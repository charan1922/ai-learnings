import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import { ipv4Fetch } from '@/lib/ipv4-fetch';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    if (!text?.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const client = new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      endpoint: `https://${process.env.AZURE_OPENAI_INSTANCE_NAME}.openai.azure.com`,
      apiVersion: '2024-02-01',
      deployment: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
      fetch: ipv4Fetch,
      maxRetries: 1,
    });

    const response = await client.embeddings.create({
      model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
      input: text.slice(0, 200),
    });

    const full = response.data[0].embedding;
    return NextResponse.json({
      preview: full.slice(0, 20),
      total: full.length,
      model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Embed-preview error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
