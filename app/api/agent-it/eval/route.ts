import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import { ipv4Fetch } from '@/lib/ipv4-fetch';
import { embedQuery, searchSimilarTickets } from '@/lib/agent-it/embedder';
import { getActiveITNamespace } from '@/lib/agent-it/it-config';

export interface EvalPair {
  question: string;
  expectedAnswer: string;
}

export interface EvalPairResult {
  question: string;
  expectedAnswer: string;
  actualAnswer: string;
  correct: boolean;
  reason: string;
  latencyMs: number;
  topMatchScore: number;
}

export interface EvalResponse {
  namespace: string;
  recall: number;       // fraction of pairs that returned at least one result
  accuracy: number;     // fraction of pairs judged correct by LLM
  avgLatencyMs: number;
  pairs: EvalPairResult[];
  passed: boolean;      // accuracy >= ACCURACY_THRESHOLD
}

const ACCURACY_THRESHOLD = 0.6;

function getChatClient(): AzureOpenAI {
  return new AzureOpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY!,
    endpoint: `https://${process.env.AZURE_OPENAI_INSTANCE_NAME}.openai.azure.com`,
    apiVersion: '2024-02-01',
    deployment: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
    fetch: ipv4Fetch,
    maxRetries: 1,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const namespace: string = body.namespace ?? getActiveITNamespace();
    const pairs: EvalPair[] = body.pairs;
    const topK: number = body.topK ?? 3;

    if (!pairs?.length) {
      return NextResponse.json({ error: 'pairs array is required' }, { status: 400 });
    }

    const chatClient = getChatClient();
    const results: EvalPairResult[] = [];

    for (const pair of pairs) {
      const pairStart = Date.now();

      // Embed question and query the candidate namespace
      const queryVector = await embedQuery(pair.question);
      const matches = await searchSimilarTickets(queryVector, topK, namespace);

      const topMatchScore = matches[0]?.score ?? 0;

      // Build context from top matches
      const context = matches
        .map((m, i) => `[${i + 1}] Category: ${m.category}\nTitle: ${m.title}\nResolution: ${m.resolution}`)
        .join('\n\n');

      // Generate answer from context
      const answerResp = await chatClient.chat.completions.create({
        model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
        messages: [
          {
            role: 'system',
            content: `You are an IT support agent. Answer the question using ONLY the context below. Be concise (1-2 sentences).\n\nContext:\n${context}`,
          },
          { role: 'user', content: pair.question },
        ],
      });

      const actualAnswer = answerResp.choices[0]?.message?.content ?? '';

      // LLM judge: does actualAnswer capture key facts of expectedAnswer?
      const judgeResp = await chatClient.chat.completions.create({
        model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
        messages: [
          {
            role: 'system',
            content: 'You are an evaluation judge for IT support answers. Mark correct=true if the actual answer addresses the core issue described in the expected answer, even if it uses different wording or misses minor steps. Mark correct=false only if the actual answer is completely off-topic or contradicts the expected answer. Respond with valid JSON only: {"correct": true/false, "reason": "one sentence"}',
          },
          {
            role: 'user',
            content: `Expected: ${pair.expectedAnswer}\nActual: ${actualAnswer}`,
          },
        ],
        response_format: { type: 'json_object' },
      });

      let correct = false;
      let reason = '';
      try {
        const parsed = JSON.parse(judgeResp.choices[0]?.message?.content ?? '{}');
        correct = Boolean(parsed.correct);
        reason = String(parsed.reason ?? '');
      } catch {
        reason = 'Judge response parse error';
      }

      results.push({
        question: pair.question,
        expectedAnswer: pair.expectedAnswer,
        actualAnswer,
        correct,
        reason,
        latencyMs: Date.now() - pairStart,
        topMatchScore,
      });
    }

    const recall = results.filter(r => r.topMatchScore > 0).length / results.length;
    const accuracy = results.filter(r => r.correct).length / results.length;
    const avgLatencyMs = Math.round(results.reduce((s, r) => s + r.latencyMs, 0) / results.length);

    const response: EvalResponse = {
      namespace,
      recall,
      accuracy,
      avgLatencyMs,
      pairs: results,
      passed: accuracy >= ACCURACY_THRESHOLD,
    };

    return NextResponse.json(response);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Eval error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
