import { AzureOpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { ipv4Fetch } from '@/lib/ipv4-fetch';
import { getActiveITNamespace } from './it-config';
import type { ITTicket, TicketVectorMetadata } from './types';
import { formatTicketForEmbedding } from './ticket-formatter';
import { randomUUID } from 'node:crypto';

export const ESCALATION_THRESHOLD = 0.75;

// Embedding config — versioned alongside the namespace
export const EMBEDDING_CONFIG = {
  model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT ?? 'text-embedding-3-small',
  chunkSize: 1,        // 1 ticket = 1 chunk
  chunkOverlap: 0,
  preprocessing: 'category+priority+title+description+resolution',
} as const;

function getEmbedClient(): AzureOpenAI {
  return new AzureOpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY!,
    endpoint: `https://${process.env.AZURE_OPENAI_INSTANCE_NAME}.openai.azure.com`,
    apiVersion: '2024-02-01',
    deployment: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
    fetch: ipv4Fetch,
    maxRetries: 1,
  });
}

function getPineconeIndex(namespace?: string) {
  const ns = namespace ?? getActiveITNamespace();
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  return pinecone.index(process.env.PINECONE_INDEX_NAME!).namespace(ns);
}

export async function embedAndUpsertTicket(
  ticket: ITTicket,
  source: string = 'manual',
  documentVersion: string = 'v1',
  namespace?: string,      // if omitted, uses active namespace
  blobVersionId?: string   // Azure Blob version ID for full traceability
): Promise<string> {
  const text = formatTicketForEmbedding(ticket);
  const embedClient = getEmbedClient();

  const response = await embedClient.embeddings.create({
    model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
    input: text,
  });

  const vector = response.data[0].embedding;
  const vectorId = randomUUID();
  const ingestId = randomUUID();
  const targetNamespace = namespace ?? getActiveITNamespace();

  const metadata: TicketVectorMetadata = {
    ticketId: ticket.ticketId,
    title: ticket.title,
    category: ticket.category,
    priority: ticket.priority,
    resolution: ticket.resolution,
    text,
    source,
    documentVersion,
    ingestId,
    blobVersionId,
    // Embedding versioning fields
    embeddingModel: EMBEDDING_CONFIG.model,
    chunkIndex: 0,
    totalChunks: EMBEDDING_CONFIG.chunkSize,
    ingestedAt: new Date().toISOString(),
  };

  const index = getPineconeIndex(targetNamespace);
  await index.upsert([{
    id: vectorId,
    values: vector,
    metadata: metadata as unknown as Record<string, string | number | boolean>,
  }]);

  return vectorId;
}

export async function embedQuery(text: string): Promise<number[]> {
  const embedClient = getEmbedClient();
  const response = await embedClient.embeddings.create({
    model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
    input: text,
  });
  return response.data[0].embedding;
}

export async function searchSimilarTickets(
  queryVector: number[],
  topK = 5,
  namespace?: string   // if omitted, searches active namespace
) {
  const index = getPineconeIndex(namespace);
  const result = await index.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
  });

  return (result.matches ?? []).map(match => ({
    ticketId: String(match.metadata?.ticketId ?? ''),
    title: String(match.metadata?.title ?? ''),
    category: String(match.metadata?.category ?? ''),
    priority: String(match.metadata?.priority ?? ''),
    resolution: String(match.metadata?.resolution ?? ''),
    score: match.score ?? 0,
    // Embedding versioning info
    embeddingModel: String(match.metadata?.embeddingModel ?? ''),
    documentVersion: String(match.metadata?.documentVersion ?? ''),
    ingestedAt: String(match.metadata?.ingestedAt ?? ''),
  }));
}
