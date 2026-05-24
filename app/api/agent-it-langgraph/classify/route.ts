import { NextRequest, NextResponse } from 'next/server';
import { classificationGraph } from '@/lib/agent-it-langgraph/graph';
import { getActiveITNamespace } from '@/lib/agent-it/it-config';
import { semanticCacheLookup, storeCacheEntry } from '@/lib/semantic-cache';
import { formatQueryForEmbedding } from '@/lib/agent-it/ticket-formatter';
import { embedQuery } from '@/lib/agent-it/embedder';

export async function POST(request: NextRequest) {
  try {
    const { title, description, topK = 5 } = await request.json();

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'title and description are required' }, { status: 400 });
    }

    const namespace = getActiveITNamespace();

    // Semantic cache check — embed first for similarity lookup
    const queryText = formatQueryForEmbedding(title, description);
    const queryVector = await embedQuery(queryText).catch(() => null);

    if (queryVector) {
      const cacheHit = await semanticCacheLookup<object>(queryVector).catch(() => null);
      if (cacheHit) {
        return NextResponse.json({ ...cacheHit.response, cacheHit: true, cacheSimilarity: cacheHit.similarity });
      }
    }

    const result = await classificationGraph.invoke({
      title,
      description,
      topK,
      namespace,
      startMs: Date.now(),
      trace: [],
    });

    const responsePayload = {
      category: result.topMatches?.[0]?.category ?? 'Unknown',
      confidence: result.confidence ?? 0,
      shouldEscalate: result.shouldEscalate ?? true,
      topMatches: result.topMatches ?? [],
      suggestedResolution: result.suggestedResolution ?? '',
      latencyMs: result.latencyMs ?? 0,
      trace: result.trace ?? [],
    };

    // Store in semantic cache (best-effort — graph already ran the embedding)
    if (queryVector) {
      await storeCacheEntry(queryText, queryVector, responsePayload, process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!).catch(() => {});
    }

    return NextResponse.json({ ...responsePayload, cacheHit: false });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('LangGraph classify error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
