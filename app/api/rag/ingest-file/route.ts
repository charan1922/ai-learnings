import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { ipv4Fetch } from '@/lib/ipv4-fetch';

const NAMESPACE = process.env.PINECONE_NAMESPACE ?? process.env.NEXT_PUBLIC_PINECONE_NAMESPACE ?? 'rag-example-2';

function chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
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
    // allow caller to override namespace per-ingest (optional)
    const nsField = formData.get('namespace');
    const namespace = typeof nsField === 'string' && nsField.trim() ? nsField : NAMESPACE;
    // allow caller to override index name per-ingest (optional)
    const idxField = formData.get('index');
    const indexName = typeof idxField === 'string' && idxField.trim() ? idxField : process.env.PINECONE_INDEX_NAME!;

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

    const chunks = chunkText(text.trim());
    const ingestedAt = new Date().toISOString();

    const embeddingResponse = await embedClient.embeddings.create({
      model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
      input: chunks,
    });

    const vectors = embeddingResponse.data.map((item, i) => ({
      id: `${Date.now()}-${i}`,
      values: item.embedding,
      metadata: {
        source: filename,
        chunkIndex: i,
        totalChunks: chunks.length,
        ingestedAt,
        text: chunks[i],
      },
    }));

    await index.upsert(vectors);

    return NextResponse.json({
      message: 'File ingested successfully',
      chunks: chunks.length,
      filename,
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
