import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import { ipv4Fetch } from '@/lib/ipv4-fetch';
import { embedQuery, searchSimilarTickets, ESCALATION_THRESHOLD } from '@/lib/agent-it/embedder';
import { formatQueryForEmbedding } from '@/lib/agent-it/ticket-formatter';
import type { ClassificationResult } from '@/lib/agent-it/types';

export async function POST(request: NextRequest) {
  try {
    const { title, description, topK = 5 } = await request.json();

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'title and description are required' }, { status: 400 });
    }

    const startMs = Date.now();

    // Embed the incoming ticket
    const queryText = formatQueryForEmbedding(title, description);
    const queryVector = await embedQuery(queryText);

    // Find similar tickets in Pinecone
    const topMatches = await searchSimilarTickets(queryVector, topK);

    if (topMatches.length === 0) {
      return NextResponse.json({ error: 'No tickets in index yet. Run /api/agent-it/seed first.' }, { status: 404 });
    }

    const topMatch = topMatches[0];
    const confidence = topMatch.score;
    const shouldEscalate = confidence < ESCALATION_THRESHOLD;

    // Use LLM to generate a contextual resolution suggestion
    const context = topMatches
      .map((m, i) => `[${i + 1}] Category: ${m.category} | Priority: ${m.priority}\nTitle: ${m.title}\nResolution: ${m.resolution}`)
      .join('\n\n');

    const chatClient = new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      endpoint: `https://${process.env.AZURE_OPENAI_INSTANCE_NAME}.openai.azure.com`,
      apiVersion: '2024-02-01',
      deployment: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
      fetch: ipv4Fetch,
      maxRetries: 1,
    });

    const systemPrompt = shouldEscalate
      ? `You are an IT support agent. The incoming ticket has low similarity to past tickets (confidence: ${(confidence * 100).toFixed(1)}%).
Suggest escalation to a human agent and provide a brief initial triage note based on similar past tickets.
Keep your response under 3 sentences.`
      : `You are an IT support agent. Based on similar past tickets, suggest a resolution for the incoming ticket.
Use ONLY the context provided. Keep your response concise and actionable (2-4 sentences).

Past similar tickets:
${context}`;

    const chatResponse = await chatClient.chat.completions.create({
      model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `New ticket:\nTitle: ${title}\nDescription: ${description}` },
      ],
    });

    const suggestedResolution = chatResponse.choices[0]?.message?.content ?? '';
    const latencyMs = Date.now() - startMs;

    const result: ClassificationResult = {
      category: topMatch.category as ClassificationResult['category'],
      confidence,
      shouldEscalate,
      topMatches,
      suggestedResolution,
      latencyMs,
    };

    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Classify error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
