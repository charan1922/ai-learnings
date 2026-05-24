import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import { ipv4Fetch } from '@/lib/ipv4-fetch';

export async function POST(request: NextRequest) {
  try {
    const { question, systemPrompt, messages } = await request.json();

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const azureBase = {
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      endpoint: `https://${process.env.AZURE_OPENAI_INSTANCE_NAME}.openai.azure.com`,
      apiVersion: '2024-02-01' as const,
      fetch: ipv4Fetch,
      maxRetries: 1,
    };

    const chatClient = new AzureOpenAI({
      ...azureBase,
      deployment: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
    });

    const chatMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
      ...(messages ?? []),
      { role: 'user', content: question },
    ];

    const response = await chatClient.chat.completions.create({
      model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
      messages: chatMessages,
    });

    const answer = response.choices[0]?.message?.content ?? '';
    const usage = response.usage;

    return NextResponse.json({ answer, usage });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Smart QA error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
