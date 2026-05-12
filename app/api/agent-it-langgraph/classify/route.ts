import { NextRequest, NextResponse } from 'next/server';
import { classificationGraph } from '@/lib/agent-it-langgraph/graph';
import { getActiveITNamespace } from '@/lib/agent-it/it-config';

export async function POST(request: NextRequest) {
  try {
    const { title, description, topK = 5 } = await request.json();

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'title and description are required' }, { status: 400 });
    }

    const namespace = getActiveITNamespace();

    const result = await classificationGraph.invoke({
      title,
      description,
      topK,
      namespace,
      startMs: Date.now(),
      trace: [],
    });

    return NextResponse.json({
      category: result.topMatches?.[0]?.category ?? 'Unknown',
      confidence: result.confidence ?? 0,
      shouldEscalate: result.shouldEscalate ?? true,
      topMatches: result.topMatches ?? [],
      suggestedResolution: result.suggestedResolution ?? '',
      latencyMs: result.latencyMs ?? 0,
      trace: result.trace ?? [],
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('LangGraph classify error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
