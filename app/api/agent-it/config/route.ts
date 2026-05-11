import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import {
  getActiveITNamespace,
  setActiveITNamespace,
  getPreviousITNamespace,
  getITPromotedAt,
  isITRuntimeOverride,
  parseITVersion,
} from '@/lib/agent-it/it-config';

export async function GET() {
  try {
    const active = getActiveITNamespace();

    // Fetch all IT namespaces from Pinecone index stats
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const stats = await pinecone.index(process.env.PINECONE_INDEX_NAME!).describeIndexStats();

    const allNamespaces = Object.entries(stats.namespaces ?? {})
      .filter(([ns]) => ns.startsWith('it-tickets-'))
      .map(([ns, info]) => ({
        name: ns,
        version: parseITVersion(ns),
        vectorCount: info.recordCount ?? 0,
        isActive: ns === active,
      }))
      .sort((a, b) => (a.version ?? 0) - (b.version ?? 0));

    return NextResponse.json({
      active,
      previous: getPreviousITNamespace(),
      promotedAt: getITPromotedAt(),
      source: isITRuntimeOverride() ? 'runtime' : 'env',
      namespaces: allNamespaces,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { namespace } = await request.json();

    if (!namespace?.trim()) {
      return NextResponse.json({ error: 'namespace is required' }, { status: 400 });
    }

    const previous = getActiveITNamespace();
    setActiveITNamespace(namespace.trim());

    return NextResponse.json({
      previousActive: previous,
      newActive: getActiveITNamespace(),
      promotedAt: getITPromotedAt(),
      message: `Active namespace switched from ${previous} → ${namespace.trim()}`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
