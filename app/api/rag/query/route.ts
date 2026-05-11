import { NextRequest, NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { ipv4Fetch } from '@/lib/ipv4-fetch';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const azureConfig = {
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      endpoint: `https://${process.env.AZURE_OPENAI_INSTANCE_NAME}.openai.azure.com`,
      apiVersion: '2024-02-01' as const,
      fetch: ipv4Fetch,
      maxRetries: 1,
    };

    const embedClient = new AzureOpenAI({
      ...azureConfig,
      deployment: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
    });

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    // Embed the query
    const embeddingResponse = await embedClient.embeddings.create({
      model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
      input: query,
    });
    const queryVector = embeddingResponse.data[0].embedding;

    // Retrieve top-3 matching chunks from Pinecone
    const searchResult = await index.query({
      vector: queryVector,
      topK: 3,
      includeMetadata: true,
    });

    const sources = (searchResult.matches ?? []).map(match => ({
      content: String(match.metadata?.text ?? ''),
      metadata: {
        source: match.metadata?.source,
        chunkIndex: match.metadata?.chunkIndex,
        totalChunks: match.metadata?.totalChunks,
        score: match.score,
      },
    }));

    const context = sources.map(s => s.content).join('\n\n---\n\n');

    // Generate answer with GPT-4.1
    const chatClient = new AzureOpenAI({
      ...azureConfig,
      deployment: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
    });

    const chatResponse = await chatClient.chat.completions.create({
      model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant. Answer the question using ONLY the context provided below.
If the context does not contain enough information, say "I don't have enough information in the provided context to answer that."

Context:
${context}`,
        },
        { role: 'user', content: query },
      ],
    });

    const answer = chatResponse.choices[0]?.message?.content ?? '';

    return NextResponse.json({ answer, sources });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Query error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
