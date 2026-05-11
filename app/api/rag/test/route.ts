import { NextResponse } from 'next/server';
import { AzureOpenAIEmbeddings } from '@langchain/openai';

export async function GET() {
  try {
    const embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY!,
      azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME!,
      azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
      azureOpenAIApiVersion: '2024-02-01',
    });
    const vec = await embeddings.embedQuery('test');
    return NextResponse.json({ ok: true, dims: vec.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
