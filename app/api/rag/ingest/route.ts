import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { ipv4Fetch } from '@/lib/ipv4-fetch';

function chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, Math.min(start + chunkSize, text.length)));
    start += chunkSize - overlap;
  }
  return chunks;
}

export async function POST(request: NextRequest) {
  try {
    const { text, source = 'user-input' } = await request.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const openai = new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      endpoint: `https://${process.env.AZURE_OPENAI_INSTANCE_NAME}.openai.azure.com`,
      apiVersion: '2024-02-01',
      deployment: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
      fetch: ipv4Fetch,
      maxRetries: 1,
    });

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    const chunks = chunkText(text.trim());
    const ingestedAt = new Date().toISOString();

    const embeddingResponse = await openai.embeddings.create({
      model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
      input: chunks,
    });

    const vectors = embeddingResponse.data.map((item, i) => ({
      id: `${Date.now()}-${i}`,
      values: item.embedding,
      metadata: {
        source,
        chunkIndex: i,
        totalChunks: chunks.length,
        ingestedAt,
        text: chunks[i],
      },
    }));

    await index.upsert(vectors);

    return NextResponse.json({ message: 'Document ingested successfully', chunks: chunks.length });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const cause = (error as { cause?: unknown })?.cause;
    console.error('Ingestion error:', msg, '| cause:', cause);
    return NextResponse.json({ error: msg, cause: String(cause) }, { status: 500 });
  }
}
