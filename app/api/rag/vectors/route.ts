import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

const NAMESPACE = process.env.PINECONE_NAMESPACE ?? process.env.NEXT_PUBLIC_PINECONE_NAMESPACE ?? 'rag-example-2';

export async function GET() {
  try {
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!).namespace(NAMESPACE);

    // List all vector IDs in the namespace
    const listResult = await index.listPaginated();
    const ids = (listResult.vectors ?? []).map(v => v.id).filter((id): id is string => !!id);

    if (ids.length === 0) {
      return NextResponse.json({ vectors: [], total: 0 });
    }

    // Fetch full records (values + metadata) in batches of 100
    const batchSize = 100;
    const allRecords: Record<string, unknown>[] = [];

    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      const fetched = await index.fetch(batch);
      for (const record of Object.values(fetched.records)) {
        allRecords.push({
          id: record.id,
          valuesPreview: record.values.slice(0, 6),
          totalDims: record.values.length,
          metadata: record.metadata,
        });
      }
    }

    // Sort by chunkIndex so they appear in document order
    allRecords.sort((a, b) => {
      const ai = Number((a.metadata as Record<string, unknown>)?.chunkIndex ?? 0);
      const bi = Number((b.metadata as Record<string, unknown>)?.chunkIndex ?? 0);
      return ai - bi;
    });

    return NextResponse.json({ vectors: allRecords, total: allRecords.length });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Vectors route error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
