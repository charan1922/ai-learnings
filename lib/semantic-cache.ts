import Redis from 'ioredis';
import { createHash } from 'node:crypto';

// ── Singleton ──────────────────────────────────────────────────────────────

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
    _redis = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 });
  }
  return _redis;
}

// ── Constants ──────────────────────────────────────────────────────────────

const CACHE_THRESHOLD = parseFloat(process.env.SEMANTIC_CACHE_THRESHOLD ?? '0.85');
const CACHE_TTL_SECONDS = parseInt(process.env.SEMANTIC_CACHE_TTL_SECONDS ?? '3600', 10);

// Azure text-embedding-3-small outputs 1536 dimensions
const EMBEDDING_DIM = parseInt(process.env.EMBEDDING_DIM ?? '1536', 10);
const INDEX_NAME = 'idx:semantic_cache';

// ── Key helpers ────────────────────────────────────────────────────────────

export function cacheKey(query: string): string {
  return `semantic_cache:${createHash('md5').update(query).digest('hex')}`;
}

// ── Vector index bootstrap ─────────────────────────────────────────────────
// Creates an HNSW index on the `embedding` field of all semantic_cache:* hashes.
// Called once at first use — idempotent (silently skips if index already exists).
//
// HNSW = Hierarchical Navigable Small World — O(log N) ANN search instead of O(N) SCAN.
// COSINE distance: score 0 = identical, score 1 = orthogonal, score 2 = opposite.

let _indexReady = false;

export async function ensureVectorIndex(): Promise<void> {
  if (_indexReady) return;
  const redis = getRedis();
  try {
    await redis.call(
      'FT.CREATE', INDEX_NAME,
      'ON', 'HASH',
      'PREFIX', '1', 'semantic_cache:',
      'SCHEMA',
      'embedding', 'VECTOR', 'HNSW', '6',
        'TYPE', 'FLOAT32',
        'DIM', String(EMBEDDING_DIM),
        'DISTANCE_METRIC', 'COSINE',
    );
    console.log('[semantic-cache] vector index created');
  } catch (e) {
    // "Index already exists" is expected on subsequent server starts — not an error
    const msg = (e as Error).message ?? '';
    if (!msg.includes('Index already exists')) throw e;
  }
  _indexReady = true;
}

// ── Number[] → Float32 binary buffer ──────────────────────────────────────
// Redis vector index requires embeddings stored as raw IEEE 754 float32 bytes,
// NOT as JSON strings. Each float = 4 bytes → 1536 dims = 6144 bytes per entry.

function toFloat32Buffer(vec: number[]): Buffer {
  return Buffer.from(new Float32Array(vec).buffer);
}

// ── Lookup (vector index KNN) ──────────────────────────────────────────────
// FT.SEARCH KNN finds the single closest vector in O(log N).
// Redis returns cosine DISTANCE (0–2), we convert to similarity (1 – distance).

export async function semanticCacheLookup<T>(
  queryEmbedding: number[],
): Promise<{ response: T; matchedKey: string; similarity: number } | null> {
  await ensureVectorIndex();
  const redis = getRedis();

  const queryBuf = toFloat32Buffer(queryEmbedding);

  // FT.SEARCH idx:semantic_cache "*=>[KNN 1 @embedding $vec AS __score]"
  // PARAMS 2 vec <binary> SORTBY __score LIMIT 0 1 DIALECT 2
  const raw = await redis.call(
    'FT.SEARCH', INDEX_NAME,
    '*=>[KNN 1 @embedding $vec AS __score]',
    'PARAMS', '2', 'vec', queryBuf,
    'SORTBY', '__score',
    'LIMIT', '0', '1',
    'DIALECT', '2',
  ) as unknown[];

  const count = raw[0] as number;
  if (count === 0) return null;

  // Result layout: [totalCount, key, [field, value, field, value, ...]]
  const matchedKey = raw[1] as string;
  const fieldArr = raw[2] as string[];

  // Convert flat [k, v, k, v] array into an object
  const entry: Record<string, string> = {};
  for (let i = 0; i + 1 < fieldArr.length; i += 2) {
    entry[fieldArr[i]] = fieldArr[i + 1];
  }

  // Redis returns cosine DISTANCE → convert to similarity
  const distance = parseFloat(entry.__score ?? '2');
  const similarity = 1 - distance;

  if (similarity < CACHE_THRESHOLD || !entry.response) return null;

  await redis.hincrby(matchedKey, 'hits', 1).catch(() => {});
  return { response: JSON.parse(entry.response) as T, matchedKey, similarity };
}

// ── Store ──────────────────────────────────────────────────────────────────
// Embedding stored as Float32 binary (required by vector index).
// Response + metadata stored as strings in the same HASH.

export async function storeCacheEntry<T>(
  query: string,
  queryEmbedding: number[],
  response: T,
  model: string,
): Promise<void> {
  await ensureVectorIndex();
  const redis = getRedis();
  const key = cacheKey(query);

  const pipeline = redis.pipeline();
  pipeline.hset(key, {
    query,
    embedding: toFloat32Buffer(queryEmbedding),  // binary — indexed by Redis
    response: JSON.stringify(response),
    model,
    createdAt: new Date().toISOString(),
    hits: '0',
  });
  pipeline.expire(key, CACHE_TTL_SECONDS);
  await pipeline.exec();
}

// ── Cache stats ────────────────────────────────────────────────────────────

export interface CacheEntry {
  key: string;
  query: string;
  model: string;
  createdAt: string;
  hits: number;
}

export async function getCacheStats(): Promise<{ total: number; entries: CacheEntry[] }> {
  const redis = getRedis();
  const entries: CacheEntry[] = [];

  let cursor = '0';
  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', 'semantic_cache:*', 'COUNT', '100');
    cursor = nextCursor;
    for (const key of keys) {
      // Only fetch the fields we need — skip the binary embedding field
      const [query, model, createdAt, hits] = await redis.hmget(key, 'query', 'model', 'createdAt', 'hits');
      if (!query) continue;
      entries.push({ key, query, model: model ?? '', createdAt: createdAt ?? '', hits: parseInt(hits ?? '0', 10) });
    }
  } while (cursor !== '0');

  return { total: entries.length, entries };
}

export async function clearCache(): Promise<number> {
  const redis = getRedis();
  const keys: string[] = [];

  let cursor = '0';
  do {
    const [nextCursor, found] = await redis.scan(cursor, 'MATCH', 'semantic_cache:*', 'COUNT', '100');
    cursor = nextCursor;
    keys.push(...found);
  } while (cursor !== '0');

  if (keys.length > 0) await redis.del(...keys);
  _indexReady = false; // reset so index is re-verified next call
  return keys.length;
}
