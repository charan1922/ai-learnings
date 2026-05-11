// ─── Chunk metadata ───────────────────────────────────────────────────────────
export interface VersionedChunkMetadata {
  // existing fields
  source: string;
  chunkIndex: number;
  totalChunks: number;
  ingestedAt: string;
  text: string;
  // source versioning
  documentVersion: string;
  ingestId: string;
  // embedding versioning
  embeddingModel: string;
  chunkSize: number;
  chunkOverlap: number;
}

// ─── Namespace helpers ────────────────────────────────────────────────────────
export function makeVersionedNamespace(base: string, version: number): string {
  return `${base}-v${version}`;
}

export function parseVersionFromNamespace(ns: string): number | null {
  const m = ns.match(/-v(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

// ─── Ingest ───────────────────────────────────────────────────────────────────
export interface VersionedIngestResponse {
  message: string;
  chunks: number;
  filename: string;
  namespace: string;
  documentVersion: string;
  ingestId: string;
  embeddingModel: string;
  chunkSize: number;
  chunkOverlap: number;
  sampleChunks: string[];
  sampleVector: {
    id: string;
    valuesPreview: number[];
    totalDims: number;
    metadata: VersionedChunkMetadata;
  };
}

// ─── Namespace list ───────────────────────────────────────────────────────────
export interface NamespaceEntry {
  name: string;
  version: number | null;
  isActive: boolean;
  vectorCount: number;
  embeddingModel?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  ingestedAt?: string;
}

export interface NamespacesResponse {
  active: string;
  namespaces: NamespaceEntry[];
}

// ─── Config / promote ─────────────────────────────────────────────────────────
export interface PromoteRequest {
  namespace: string;
}

export interface PromoteResponse {
  previousActive: string;
  newActive: string;
  promotedAt: string;
}

export interface ConfigResponse {
  active: string;
  base: string;
  promotedAt: string | null;
  source: 'env' | 'runtime';
}

// ─── Eval ─────────────────────────────────────────────────────────────────────
export interface EvalPair {
  question: string;
  expectedAnswer: string;
}

export interface EvalRequest {
  namespace: string;
  pairs: EvalPair[];
  topK?: number;
}

export interface EvalPairResult {
  question: string;
  expectedAnswer: string;
  actualAnswer: string;
  retrieved: boolean;
  latencyMs: number;
  correct: boolean;
  judgeReason: string;
}

export interface EvalResponse {
  namespace: string;
  totalPairs: number;
  recall: number;
  accuracy: number;
  avgLatencyMs: number;
  results: EvalPairResult[];
}

// ─── Stored vector (versioned) ────────────────────────────────────────────────
export interface VersionedStoredVector {
  id: string;
  valuesPreview: number[];
  totalDims: number;
  metadata: VersionedChunkMetadata;
}
