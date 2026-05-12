import { AzureOpenAI } from 'openai';
import { ipv4Fetch } from '@/lib/ipv4-fetch';
import { embedQuery, searchSimilarTickets, ESCALATION_THRESHOLD } from '@/lib/agent-it/embedder';
import { formatQueryForEmbedding } from '@/lib/agent-it/ticket-formatter';
import type { ClassificationState } from './state';

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

export async function formatQueryNode(state: ClassificationState): Promise<Partial<ClassificationState>> {
  const t0 = Date.now();
  const queryText = formatQueryForEmbedding(state.title, state.description);
  return {
    queryText,
    trace: [{ node: 'formatQuery', durationMs: Date.now() - t0 }],
  };
}

export async function embedQueryNode(state: ClassificationState): Promise<Partial<ClassificationState>> {
  const t0 = Date.now();
  const queryVector = await embedQuery(state.queryText!);
  return {
    queryVector,
    trace: [{ node: 'embedQuery', durationMs: Date.now() - t0 }],
  };
}

export async function searchSimilarNode(state: ClassificationState): Promise<Partial<ClassificationState>> {
  const t0 = Date.now();
  const topMatches = await searchSimilarTickets(state.queryVector!, state.topK, state.namespace);
  return {
    topMatches,
    trace: [{ node: 'searchSimilar', durationMs: Date.now() - t0 }],
  };
}

export async function evaluateConfidenceNode(state: ClassificationState): Promise<Partial<ClassificationState>> {
  const t0 = Date.now();
  const confidence = state.topMatches?.[0]?.score ?? 0;
  const shouldEscalate = confidence < ESCALATION_THRESHOLD;
  return {
    confidence,
    shouldEscalate,
    trace: [{ node: 'evaluateConfidence', durationMs: Date.now() - t0 }],
  };
}

export async function escalateNode(state: ClassificationState): Promise<Partial<ClassificationState>> {
  const t0 = Date.now();
  const chatClient = getChatClient();
  const confidence = state.confidence ?? 0;

  const response = await chatClient.chat.completions.create({
    model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
    messages: [
      {
        role: 'system',
        content: `You are an IT support agent. The incoming ticket has low similarity to past tickets (confidence: ${(confidence * 100).toFixed(1)}%).
Suggest escalation to a human agent and provide a brief initial triage note based on similar past tickets.
Keep your response under 3 sentences.`,
      },
      {
        role: 'user',
        content: `New ticket:\nTitle: ${state.title}\nDescription: ${state.description}`,
      },
    ],
  });

  return {
    suggestedResolution: response.choices[0]?.message?.content ?? '',
    trace: [{ node: 'escalate', durationMs: Date.now() - t0 }],
  };
}

export async function generateResolutionNode(state: ClassificationState): Promise<Partial<ClassificationState>> {
  const t0 = Date.now();
  const chatClient = getChatClient();

  const context = (state.topMatches ?? [])
    .map((m, i) => `[${i + 1}] Category: ${m.category} | Priority: ${m.priority}\nTitle: ${m.title}\nResolution: ${m.resolution}`)
    .join('\n\n');

  const response = await chatClient.chat.completions.create({
    model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
    messages: [
      {
        role: 'system',
        content: `You are an IT support agent. Based on similar past tickets, suggest a resolution for the incoming ticket.
Use ONLY the context provided. Keep your response concise and actionable (2-4 sentences).

Past similar tickets:
${context}`,
      },
      {
        role: 'user',
        content: `New ticket:\nTitle: ${state.title}\nDescription: ${state.description}`,
      },
    ],
  });

  return {
    suggestedResolution: response.choices[0]?.message?.content ?? '',
    trace: [{ node: 'generateResolution', durationMs: Date.now() - t0 }],
  };
}

export async function formatResponseNode(state: ClassificationState): Promise<Partial<ClassificationState>> {
  const t0 = Date.now();
  const latencyMs = Date.now() - state.startMs;
  return {
    latencyMs,
    trace: [{ node: 'formatResponse', durationMs: Date.now() - t0 }],
  };
}
