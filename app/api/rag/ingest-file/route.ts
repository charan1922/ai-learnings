import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { randomUUID } from 'node:crypto';
import { ipv4Fetch } from '@/lib/ipv4-fetch';
import { getActiveNamespace } from '@/lib/rag-config';
import type { VersionedChunkMetadata } from '@/lib/rag-versioning';

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

function chunkText(text: string, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, Math.min(start + chunkSize, text.length)));
    start += chunkSize - overlap;
  }
  return chunks;
}

async function extractText(buffer: Buffer, filename: string): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (ext === 'md' || ext === 'txt') {
    return buffer.toString('utf-8');
  }

  if (ext === 'pdf') {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  }

  if (ext === 'docx' || ext === 'doc') {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error(`Unsupported file type: .${ext}`);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    const nsField = formData.get('namespace');
    const namespace = typeof nsField === 'string' && nsField.trim() ? nsField.trim() : getActiveNamespace();

    const idxField = formData.get('index');
    const indexName = typeof idxField === 'string' && idxField.trim() ? idxField.trim() : process.env.PINECONE_INDEX_NAME!;

    const dvField = formData.get('documentVersion');
    const documentVersion = typeof dvField === 'string' && dvField.trim() ? dvField.trim() : 'v1';

    const modeField = formData.get('mode');
    const mode: 'full' | 'incremental' =
      modeField === 'full' ? 'full' : 'incremental';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const filename = file.name;
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractText(buffer, filename);

    if (!text.trim()) {
      return NextResponse.json({ error: 'Could not extract text from file' }, { status: 400 });
    }

    const embedClient = new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      endpoint: `https://${process.env.AZURE_OPENAI_INSTANCE_NAME}.openai.azure.com`,
      apiVersion: '2024-02-01',
      deployment: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
      fetch: ipv4Fetch,
      maxRetries: 1,
    });

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(indexName).namespace(namespace);

    // Full mode: wipe the namespace before re-ingesting
    if (mode === 'full') {
      await index.deleteAll();
    }

    // Incremental mode: remove old chunks for this source only
    if (mode === 'incremental') {
      let paginationToken: string | undefined;
      const idsToDelete: string[] = [];

      do {
        const listResult = await index.listPaginated(
          paginationToken ? { paginationToken } : {}
        );
        const pageIds = (listResult.vectors ?? [])
          .map(v => v.id)
          .filter((id): id is string => !!id);

        if (pageIds.length > 0) {
          const fetched = await index.fetch(pageIds);
          for (const record of Object.values(fetched.records)) {
            if ((record.metadata as Record<string, unknown>)?.source === filename) {
              idsToDelete.push(record.id);
            }
          }
        }

        paginationToken = listResult.pagination?.next;
      } while (paginationToken);

      if (idsToDelete.length > 0) {
        await index.deleteMany(idsToDelete);
      }
    }

    const chunks = chunkText(text.trim());
    const ingestedAt = new Date().toISOString();
    const ingestId = randomUUID();
    const embeddingModel = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!;

    const embeddingResponse = await embedClient.embeddings.create({
      model: embeddingModel,
      input: chunks,
    });

    const vectors = embeddingResponse.data.map((item, i) => ({
      id: `${ingestId}-${i}`,
      values: item.embedding,
      metadata: {
        source: filename,
        chunkIndex: i,
        totalChunks: chunks.length,
        ingestedAt,
        text: chunks[i],
        documentVersion,
        ingestId,
        embeddingModel,
        chunkSize: CHUNK_SIZE,
        chunkOverlap: CHUNK_OVERLAP,
      } satisfies VersionedChunkMetadata,
    }));

    await index.upsert(vectors);

    return NextResponse.json({
      message: 'File ingested successfully',
      chunks: chunks.length,
      filename,
      namespace,
      documentVersion,
      ingestId,
      embeddingModel,
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
      sampleChunks: chunks.slice(0, 3),
      sampleVector: {
        id: vectors[0].id,
        valuesPreview: vectors[0].values.slice(0, 8),
        totalDims: vectors[0].values.length,
        metadata: vectors[0].metadata,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Ingest-file error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
