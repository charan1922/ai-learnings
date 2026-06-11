import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import { ipv4Fetch } from '@/lib/ipv4-fetch';

type ReasoningEffort = 'minimal' | 'low' | 'medium' | 'high';
const REASONING_EFFORTS: ReasoningEffort[] = ['minimal', 'low', 'medium', 'high'];

/**
 * Prompt Testing Playground — runs ONE prompt version against a shared test input.
 * The client calls this once per version (in parallel) so outputs can be compared
 * side-by-side. Returns the output plus token usage and latency for improvement tracking.
 *
 * The deployment is a reasoning model (gpt-5 family), so by default it spends "thinking"
 * tokens that don't appear in the answer and inflate the token count. We default
 * reasoning_effort to "minimal" so the reported tokens reflect the real prompt + answer
 * cost — making cross-version comparison meaningful. Callers can raise the effort.
 */
export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, userInput, reasoningEffort } = await request.json();

    if (!userInput?.trim()) {
      return NextResponse.json({ error: 'A test input is required' }, { status: 400 });
    }

    const effort: ReasoningEffort = REASONING_EFFORTS.includes(reasoningEffort)
      ? reasoningEffort
      : 'minimal';

    const chatClient = new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      endpoint: `https://${process.env.AZURE_OPENAI_INSTANCE_NAME}.openai.azure.com`,
      apiVersion: '2024-12-01-preview',
      deployment: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
      fetch: ipv4Fetch,
      maxRetries: 1,
    });

    const messages: { role: 'system' | 'user'; content: string }[] = [];
    if (systemPrompt?.trim()) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: userInput });

    const startedAt = Date.now();
    const response = await chatClient.chat.completions.create({
      model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
      messages,
      reasoning_effort: effort,
    });
    const latencyMs = Date.now() - startedAt;

    const output = response.choices[0]?.message?.content ?? '';
    const usage = response.usage;

    return NextResponse.json({ output, usage, latencyMs, reasoningEffort: effort });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Prompt Playground error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
