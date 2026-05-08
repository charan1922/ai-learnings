import { NextRequest, NextResponse } from 'next/server';
import {
  getActiveNamespace,
  setActiveNamespace,
  getPromotedAt,
  isRuntimeOverride,
} from '@/lib/rag-config';
import type { ConfigResponse, PromoteRequest, PromoteResponse } from '@/lib/rag-versioning';

const BASE_NAMESPACE =
  process.env.PINECONE_NAMESPACE ??
  process.env.NEXT_PUBLIC_PINECONE_NAMESPACE ??
  'rag-example-2';

function deriveBase(active: string): string {
  return active.replace(/-v\d+$/, '') || BASE_NAMESPACE;
}

export async function GET(): Promise<NextResponse<ConfigResponse>> {
  const active = getActiveNamespace();
  return NextResponse.json({
    active,
    base: deriveBase(active),
    promotedAt: getPromotedAt(),
    source: isRuntimeOverride() ? 'runtime' : 'env',
  });
}

export async function POST(request: NextRequest): Promise<NextResponse<PromoteResponse | { error: string }>> {
  try {
    const body = (await request.json()) as PromoteRequest;
    const { namespace } = body;

    if (!namespace?.trim()) {
      return NextResponse.json({ error: 'namespace is required' }, { status: 400 });
    }

    const previousActive = getActiveNamespace();
    setActiveNamespace(namespace.trim());

    const response: PromoteResponse = {
      previousActive,
      newActive: namespace.trim(),
      promotedAt: getPromotedAt()!,
    };

    return NextResponse.json(response);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Config route error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
