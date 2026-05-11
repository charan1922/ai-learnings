# Agent IT — RAG Versioning Concepts

## Overview

The Agent IT feature implements 6 RAG versioning concepts for the IT ticket routing system.

- **Vector store:** Pinecone — namespaces act as version slots (`it-tickets-v1`, `it-tickets-v2`, …)
- **Relational store:** PostgreSQL (`it_tickets` database) — stores ticket rows with status and embed tracking
- **Blob store:** Azure Blob Storage — stores versioned Excel files with immutable snapshots

---

## #1 — Source Versioning

Every Pinecone vector carries metadata that identifies exactly which data it came from:

| Metadata field | Example | Meaning |
|---|---|---|
| `documentVersion` | `v1` | Logical version label you assign at seed time |
| `ingestId` | `uuid-abc-123` | UUID per seed run — ties all vectors from one run together |
| `source` | `IT_Tickets_v1.xlsx` | Filename the ticket came from |

**Why:** If data changes, you know which vectors are stale without guessing.

**Key file:** `lib/agent-it/embedder.ts` → `embedAndUpsertTicket()`

---

## #2 — Embedding Versioning

Every vector also records how it was produced:

| Metadata field | Example | Meaning |
|---|---|---|
| `embeddingModel` | `text-embedding-3-small` | Which AI model created the vector |
| `chunkSize` | `1` | Tickets are embedded one-per-vector |
| `chunkOverlap` | `0` | No overlap (single ticket = single chunk) |
| `ingestedAt` | `2026-05-11T10:00:00Z` | When this vector was created |

**Why:** If you swap embedding models, old and new vectors are incompatible (different number spaces). The metadata tells you which vectors need re-embedding.

**Rule:** Model changed → create a new namespace, re-embed everything there, then promote it.

**Key files:** `lib/agent-it/embedder.ts` (EMBEDDING_CONFIG), `lib/agent-it/types.ts` (TicketVectorMetadata)

---

## #3 — Index Versioning (Promote & Rollback)

**Mechanism:** A module-level variable in `lib/agent-it/it-config.ts` tracks the active namespace in-process:

```
Server start → _activeNamespace = null → falls back to IT_TICKETS_NAMESPACE env var (default: it-tickets-v1)
```

**Zero-downtime promotion flow:**

1. **Seed candidate** — ingest new data into `it-tickets-v2`. Live queries keep hitting `it-tickets-v1`. No disruption.
2. **Promote** — `POST /api/agent-it/config { namespace: "it-tickets-v2" }` flips `_activeNamespace` instantly in-process. Next query hits the new namespace.
3. **Rollback** — same POST with the previous namespace. Reverts in milliseconds.

**Caveat:** In-process memory only. Server restart resets to env var.
To persist: update `IT_TICKETS_NAMESPACE=it-tickets-v2` in `.env.local`.

**Key files:** `lib/agent-it/it-config.ts`, `app/api/agent-it/config/route.ts`

---

## #4 — Metadata Tagging (Full Traceability)

Each vector also stores `blobVersionId` — the Azure Blob Storage version ID of the exact file snapshot it came from.

**Full traceability chain:**

```
Pinecone vector
  → metadata.ingestId       (which seed run)
  → metadata.blobVersionId  (which exact Azure Blob snapshot)
  → metadata.source         (which file)
  → metadata.documentVersion (which logical version)
```

**Why:** You can answer "this vector came from exactly this file at this point in time" — no ambiguity.

**Key files:** `lib/agent-it/types.ts`, `lib/agent-it/embedder.ts`, `app/api/agent-it/seed/route.ts`

---

## #5 — Incremental vs Full Re-indexing

The seed route (`POST /api/agent-it/seed`) accepts a `mode` parameter:

### Full mode (`mode: "full"`)
- Calls `index.deleteAll()` on the target namespace
- Wipes every vector, then re-embeds everything fresh
- **Use when:** Changing embedding model, or major data overhaul

### Incremental mode (`mode: "incremental"`)
- Paginates through all existing vectors (100 per page)
- Fetches metadata for each batch
- Deletes only vectors where `metadata.source === blobName`
- Other source files' vectors are untouched
- **Use when:** Routine update to one source file

**Analogy:** Full = reprint the whole book. Incremental = reprint only the updated chapter.

**Key file:** `app/api/agent-it/seed/route.ts`

---

## #6 — Evaluation Before Promotion

**Status:** Planned — not yet implemented.

**Concept:** Before promoting a candidate namespace to active, run a Q&A evaluation suite against it:
- Embed a set of known questions, query the candidate namespace
- Use an LLM judge to score whether answers capture the expected facts
- Measure recall %, accuracy %, and per-pair latency
- Block promotion if accuracy < threshold (e.g. 60%)

**Planned route:** `POST /api/agent-it/eval { namespace, pairs: [{question, expectedAnswer}] }`

---

## Architecture at a Glance

```
Azure Blob Storage
  IT_Tickets_v1.xlsx (versionId: 2026-05-11-abc)
  IT_Tickets_v1.xlsx (versionId: 2026-05-10-xyz)  ← older snapshot

       ↓ seed (mode: full | incremental)

Pinecone Index: n8nfiles
  namespace: it-tickets-v1  ← active (live queries hit here)
  namespace: it-tickets-v2  ← candidate (being built/evaluated)

       ↓ promote (flip _activeNamespace in-process)

PostgreSQL: it_tickets
  ticket rows with vector_id → links to Pinecone vector
```

## API Reference

| Route | Method | Purpose |
|---|---|---|
| `/api/agent-it/seed` | POST | Seed tickets into Pinecone (mode: full/incremental) |
| `/api/agent-it/config` | GET | Get active namespace + all it-tickets-* namespaces |
| `/api/agent-it/config` | POST | Promote/rollback — switch active namespace |
| `/api/agent-it/classify` | POST | Classify an incoming ticket using vector similarity |
| `/api/agent-it/tickets` | GET/POST | Browse/create tickets in PostgreSQL |
| `/api/agent-it/blob/upload` | POST | Upload new Excel version to Azure Blob |
| `/api/agent-it/blob/versions` | GET | List blob versions for a file |
