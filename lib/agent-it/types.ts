export type TicketCategory =
  | 'Infrastructure'
  | 'Application'
  | 'Security'
  | 'Database'
  | 'Storage'
  | 'Network'
  | 'Access Management';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ITTicket {
  ticketId: string;
  title: string;
  description: string;
  category: TicketCategory;
  resolution: string;
  priority: TicketPriority;
}

// Metadata stored per vector in Pinecone
export interface TicketVectorMetadata {
  ticketId: string;
  title: string;
  category: string;
  priority: string;
  resolution: string;
  text: string;             // full text used for embedding
  source: string;           // blob name e.g. "IT_Tickets_v2.csv"
  documentVersion: string;  // e.g. "v2"
  ingestId: string;         // UUID per ingest run
  blobVersionId?: string;   // Azure Blob version ID — exact snapshot this vector came from
  embeddingModel: string;
  chunkIndex: number;
  totalChunks: number;
  ingestedAt: string;       // ISO timestamp
}

// A single blob file version in Azure Blob Storage
export interface BlobTicketVersion {
  name: string;          // e.g. "IT_Tickets_v2.csv"
  versionId: string;     // Azure blob version ID
  lastModified: Date;
  size: number;
  etag: string;
}

// Result of classifying an incoming ticket
export interface ClassificationResult {
  category: TicketCategory;
  confidence: number;        // 0–1, based on top Pinecone match score
  shouldEscalate: boolean;   // true when confidence < ESCALATION_THRESHOLD
  topMatches: SimilarTicket[];
  suggestedResolution: string;
  latencyMs: number;
}

export interface SimilarTicket {
  ticketId: string;
  title: string;
  category: string;
  priority: string;
  resolution: string;
  score: number;             // cosine similarity from Pinecone
}

// Ingest run result
export interface TicketIngestResult {
  namespace: string;
  documentVersion: string;
  ingestId: string;
  embeddingModel: string;
  totalTickets: number;
  totalVectors: number;
  source: string;
  ingestedAt: string;
}

// Eval pair for LLM-judge evaluation
export interface TicketEvalPair {
  question: string;          // incoming ticket description
  expectedCategory: TicketCategory;
  expectedResolution?: string;
}
