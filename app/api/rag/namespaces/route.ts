import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { getActiveNamespace } from '@/lib/rag-config';
import { parseVersionFromNamespace } from '@/lib/rag-versioning';
import type { NamespaceEntry, NamespacesResponse } from '@/lib/rag-versioning';

const DEFAULT_BASE =
  process.env.PINECONE_NAMESPACE ??
  process.env.NEXT_PUBLIC_PINECONE_NAMESPACE ??
  'rag-example-2';

export async function GET(request: NextRequest): Promise<NextResponse<NamespacesResponse | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const base = searchParams.get('base')?.trim() || DEFAULT_BASE;
    const active = getActiveNamespace();

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    const stats = await index.describeIndexStats();
    const allNamespaces = stats.namespaces ?? {};

    // Filter to versioned slots matching {base}-vN
    const pattern = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-v\\d+$`);
    const matched = Object.entries(allNamespaces)
      .filter(([ns]) => pattern.test(ns))
      .sort(([a], [b]) => {
        const av = parseVersionFromNamespace(a) ?? 0;
        const bv = parseVersionFromNamespace(b) ?? 0;
        return av - bv;
      });

    // Fetch a sample vector from each namespace to surface embedding config
    const namespaces: NamespaceEntry[] = await Promise.all(
      matched.map(async ([ns, nsStats]) => {
        const entry: NamespaceEntry = {
          name: ns,
          version: parseVersionFromNamespace(ns),
          isActive: ns === active,
          vectorCount: nsStats.recordCount ?? 0,
        };

        try {
          const nsIndex = index.namespace(ns);
          const list = await nsIndex.listPaginated({ limit: 1 });
          const ids = (list.vectors ?? []).map(v => v.id).filter((id): id is string => !!id);
          if (ids.length > 0) {
            const fetched = await nsIndex.fetch(ids);
            const record = Object.values(fetched.records)[0];
            if (record?.metadata) {
              const m = record.metadata as Record<string, unknown>;
              if (m.embeddingModel) entry.embeddingModel = String(m.embeddingModel);
              if (m.chunkSize) entry.chunkSize = Number(m.chunkSize);
              if (m.chunkOverlap !== undefined) entry.chunkOverlap = Number(m.chunkOverlap);
              if (m.ingestedAt) entry.ingestedAt = String(m.ingestedAt);
            }
          }
        } catch {
          // Sample fetch is best-effort — don't fail the whole response
        }

        return entry;
      })
    );

    return NextResponse.json({ active, namespaces });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Namespaces route error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
