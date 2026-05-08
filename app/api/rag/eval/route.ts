import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { ipv4Fetch } from '@/lib/ipv4-fetch';
import type { EvalRequest, EvalResponse, EvalPairResult } from '@/lib/rag-versioning';

export async function POST(request: NextRequest): Promise<NextResponse<EvalResponse | { error: string }>> {
  try {
    const body = (await request.json()) as EvalRequest;
    const { namespace, pairs, topK = 3 } = body;

    if (!namespace?.trim()) {
      return NextResponse.json({ error: 'namespace is required' }, { status: 400 });
    }
    if (!Array.isArray(pairs) || pairs.length === 0) {
      return NextResponse.json({ error: 'pairs must be a non-empty array' }, { status: 400 });
    }

    const azureBase = {
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      endpoint: `https://${process.env.AZURE_OPENAI_INSTANCE_NAME}.openai.azure.com`,
      apiVersion: '2024-02-01' as const,
      fetch: ipv4Fetch,
      maxRetries: 1,
    };

    const embedClient = new AzureOpenAI({
      ...azureBase,
      deployment: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
    });

    const chatClient = new AzureOpenAI({
      ...azureBase,
      deployment: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
    });

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!).namespace(namespace.trim());

    const results: EvalPairResult[] = [];

    // Sequential — preserve per-pair latency measurements
    for (const pair of pairs) {
      const t0 = Date.now();

      // 1. Embed the question
      const embRes = await embedClient.embeddings.create({
        model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
        input: pair.question,
      });
      const queryVector = embRes.data[0].embedding;

      // 2. Retrieve from candidate namespace
      const searchResult = await index.query({
        vector: queryVector,
        topK: Math.min(Math.max(Number(topK), 1), 10),
        includeMetadata: true,
      });
      const matches = searchResult.matches ?? [];
      const retrieved = matches.length > 0;

      // 3. Generate answer
      const context = matches.map(m => String(m.metadata?.text ?? '')).join('\n\n---\n\n');
      const chatRes = await chatClient.chat.completions.create({
        model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant. Answer the question using ONLY the context provided below.
If the context does not contain enough information, say "I don't have enough information in the provided context to answer that."

Context:
${context}`,
          },
          { role: 'user', content: pair.question },
        ],
      });
      const actualAnswer = chatRes.choices[0]?.message?.content ?? '';
      const latencyMs = Date.now() - t0;

      // 4. LLM judge
      let correct = false;
      let judgeReason = 'unknown';
      try {
        const judgeRes = await chatClient.chat.completions.create({
          model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
          messages: [
            {
              role: 'system',
              content: `You are an evaluation judge. Given a question, an expected answer, and an actual answer,
determine if the actual answer captures the key facts of the expected answer.
Respond with valid JSON only: {"correct": true or false, "reason": "one sentence explanation"}`,
            },
            {
              role: 'user',
              content: `Question: ${pair.question}
Expected: ${pair.expectedAnswer}
Actual: ${actualAnswer}`,
            },
          ],
        });
        const raw = judgeRes.choices[0]?.message?.content ?? '{}';
        const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim()) as { correct?: boolean; reason?: string };
        correct = Boolean(parsed.correct);
        judgeReason = parsed.reason ?? 'no reason provided';
      } catch {
        correct = false;
        judgeReason = 'judge parse error';
      }

      results.push({
        question: pair.question,
        expectedAnswer: pair.expectedAnswer,
        actualAnswer,
        retrieved,
        latencyMs,
        correct,
        judgeReason,
      });
    }

    const recall = results.filter(r => r.retrieved).length / results.length;
    const accuracy = results.filter(r => r.correct).length / results.length;
    const avgLatencyMs = Math.round(results.reduce((sum, r) => sum + r.latencyMs, 0) / results.length);

    return NextResponse.json({
      namespace: namespace.trim(),
      totalPairs: results.length,
      recall,
      accuracy,
      avgLatencyMs,
      results,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Eval route error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
