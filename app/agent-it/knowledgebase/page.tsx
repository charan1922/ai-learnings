'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { BookOpen, Tag, Layers, GitBranch, Database, RefreshCw, FlaskConical, Network, Terminal } from 'lucide-react';

const TABS = [
  { id: 'overview',     label: 'Overview',              icon: BookOpen,     color: 'text-slate-500' },
  { id: 'source',       label: '#1 Source Versioning',  icon: Tag,          color: 'text-blue-500' },
  { id: 'embedding',    label: '#2 Embedding Versioning', icon: Layers,     color: 'text-purple-500' },
  { id: 'index',        label: '#3 Index Versioning',   icon: GitBranch,    color: 'text-green-500' },
  { id: 'metadata',     label: '#4 Metadata Tagging',   icon: Database,     color: 'text-orange-500' },
  { id: 'reindex',      label: '#5 Incremental vs Full', icon: RefreshCw,   color: 'text-cyan-500' },
  { id: 'eval',         label: '#6 Eval Before Promote', icon: FlaskConical, color: 'text-rose-500' },
  { id: 'architecture', label: 'Architecture',           icon: Network,      color: 'text-teal-500' },
  { id: 'api',          label: 'API Reference',          icon: Terminal,     color: 'text-yellow-600' },
] as const;

type TabId = typeof TABS[number]['id'];

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return <code className={`text-xs font-mono px-1.5 py-0.5 rounded bg-muted border border-border ${color}`}>{children}</code>;
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>{headers.map(h => <th key={h} className="text-left px-3 py-2 bg-muted border border-border font-semibold text-muted-foreground">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="even:bg-muted/30">
              {row.map((cell, j) => <td key={j} className="px-3 py-2 border border-border font-mono text-xs align-top">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return <pre className="bg-muted border border-border rounded-lg p-4 text-xs font-mono overflow-x-auto my-4 whitespace-pre">{children}</pre>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold mb-3 text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function Callout({ color, children }: { color: 'blue' | 'amber' | 'green' | 'rose' | 'purple'; children: React.ReactNode }) {
  const styles = {
    blue:   'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300',
    amber:  'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300',
    green:  'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300',
    rose:   'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300',
    purple: 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950/30 dark:border-purple-800 dark:text-purple-300',
  };
  return <div className={`border rounded-lg px-4 py-3 text-sm my-4 ${styles[color]}`}>{children}</div>;
}

// ── Tab content ────────────────────────────────────────────────────────────

function OverviewTab() {
  return (
    <div>
      <p className="text-muted-foreground mb-6">The Agent IT feature implements 6 RAG versioning concepts for the IT ticket routing system. These concepts ensure data traceability, safe model upgrades, and zero-downtime deployments.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Vector Store', value: 'Pinecone', note: 'namespaces as version slots' },
          { label: 'Relational Store', value: 'PostgreSQL', note: 'it_tickets database' },
          { label: 'Blob Store', value: 'Azure Blob', note: 'immutable file snapshots' },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
            <div className="font-semibold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.note}</div>
          </div>
        ))}
      </div>
      <Table
        headers={['#', 'Concept', 'One-line summary']}
        rows={[
          ['1', 'Source Versioning',        'Every vector knows which file + run it came from'],
          ['2', 'Embedding Versioning',      'Every vector records which model + settings produced it'],
          ['3', 'Index Versioning',          'Namespaces as slots — promote/rollback without downtime'],
          ['4', 'Metadata Tagging',          'Azure Blob versionId traces back to the exact file snapshot'],
          ['5', 'Incremental vs Full',       'Re-index one source file or wipe and start fresh'],
          ['6', 'Evaluation Before Promote', 'LLM-judge Q&A eval gates promotion at 60% accuracy'],
        ]}
      />
    </div>
  );
}

function SourceVersioningTab() {
  return (
    <div>
      <Callout color="blue">Every Pinecone vector carries metadata that identifies exactly which data it came from. If data changes, you know which vectors are stale without guessing.</Callout>
      <Section title="Metadata fields stored per vector">
        <Table
          headers={['Field', 'Example', 'Meaning']}
          rows={[
            ['documentVersion', 'v1',            'Logical version label you assign at seed time'],
            ['ingestId',        'uuid-abc-123',   'UUID per seed run — ties all vectors from one run together'],
            ['source',          'IT_Tickets_v1.xlsx', 'Filename the ticket came from'],
          ]}
        />
      </Section>
      <Section title="How it works">
        <p className="text-sm text-muted-foreground mb-3">When you call <Badge color="">POST /api/agent-it/seed</Badge>, every vector upserted to Pinecone gets these fields stamped in its metadata:</p>
        <Code>{`const ingestId = randomUUID();  // one UUID for the whole run

await embedAndUpsertTicket(ticket, namespace, {
  documentVersion,   // e.g. "v1"
  ingestId,          // same UUID for every ticket in this run
  source: blobName,  // "IT_Tickets_v1.xlsx"
});`}</Code>
      </Section>
      <Section title="Key file">
        <Badge color="text-blue-500">lib/agent-it/embedder.ts</Badge> → <code className="text-xs">embedAndUpsertTicket()</code>
      </Section>
    </div>
  );
}

function EmbeddingVersioningTab() {
  return (
    <div>
      <Callout color="purple">If you swap embedding models, old and new vectors are incompatible — they live in different number spaces. The metadata tells you which vectors need re-embedding.</Callout>
      <Section title="Metadata fields stored per vector">
        <Table
          headers={['Field', 'Example', 'Meaning']}
          rows={[
            ['embeddingModel', 'text-embedding-3-small', 'Which AI model created the vector'],
            ['chunkSize',      '1',                      'Tickets are embedded one-per-vector'],
            ['chunkOverlap',   '0',                      'No overlap (single ticket = single chunk)'],
            ['ingestedAt',     '2026-05-11T10:00:00Z',   'When this vector was created'],
          ]}
        />
      </Section>
      <Section title="The rule">
        <Callout color="amber">Model changed → create a new namespace, re-embed everything there, then promote it. Never mix vectors from different models in the same namespace.</Callout>
      </Section>
      <Section title="Where it's defined">
        <Code>{`// lib/agent-it/embedder.ts
const EMBEDDING_CONFIG = {
  embeddingModel: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
  chunkSize: 1,
  chunkOverlap: 0,
};`}</Code>
      </Section>
      <Section title="Key files">
        <div className="flex flex-wrap gap-2">
          <Badge color="text-purple-500">lib/agent-it/embedder.ts</Badge>
          <Badge color="text-purple-500">lib/agent-it/types.ts</Badge>
        </div>
      </Section>
    </div>
  );
}

function IndexVersioningTab() {
  return (
    <div>
      <Callout color="green">Pinecone namespaces act as version slots. The active namespace is a single in-process variable — flipping it promotes a new version instantly with zero downtime.</Callout>
      <Section title="How the singleton works">
        <Code>{`// lib/agent-it/it-config.ts
let _activeNamespace: string | null = null;

export function getActiveITNamespace(): string {
  return _activeNamespace
    ?? process.env.IT_TICKETS_NAMESPACE
    ?? 'it-tickets-v1';
}

export function setActiveITNamespace(ns: string): void {
  _activeNamespace = ns;
}`}</Code>
      </Section>
      <Section title="Zero-downtime promotion flow">
        <div className="space-y-3">
          {[
            { step: '1', label: 'Seed candidate', desc: 'Ingest new data into it-tickets-v2. Live queries keep hitting it-tickets-v1. No disruption.' },
            { step: '2', label: 'Promote', desc: 'POST /api/agent-it/config { namespace: "it-tickets-v2" } flips _activeNamespace instantly. Next query hits v2.' },
            { step: '3', label: 'Rollback', desc: 'Same POST with the previous namespace. Reverts in milliseconds.' },
          ].map(s => (
            <div key={s.step} className="flex gap-3 rounded-lg border border-border p-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">{s.step}</span>
              <div>
                <div className="font-semibold text-sm">{s.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Callout color="amber">Caveat: in-process memory only. Server restart resets to env var. To persist: update IT_TICKETS_NAMESPACE=it-tickets-v2 in .env.local</Callout>
      <Section title="Key files">
        <div className="flex flex-wrap gap-2">
          <Badge color="text-green-500">lib/agent-it/it-config.ts</Badge>
          <Badge color="text-green-500">app/api/agent-it/config/route.ts</Badge>
        </div>
      </Section>
    </div>
  );
}

function MetadataTaggingTab() {
  return (
    <div>
      <Callout color="blue">You can answer "this vector came from exactly this file at this point in time" — no ambiguity.</Callout>
      <Section title="Full traceability chain">
        <Code>{`Pinecone vector
  → metadata.ingestId       (which seed run)
  → metadata.blobVersionId  (which exact Azure Blob snapshot)
  → metadata.source         (which file)
  → metadata.documentVersion (which logical version)`}</Code>
      </Section>
      <Section title="blobVersionId">
        <p className="text-sm text-muted-foreground mb-3">Each Azure Blob Storage file has an immutable <code className="text-xs bg-muted px-1 py-0.5 rounded">versionId</code> — a timestamp-based identifier for that exact snapshot. It gets stored in every vector produced from that file.</p>
        <Table
          headers={['Field', 'Source', 'What it tells you']}
          rows={[
            ['ingestId',        'randomUUID() at seed time', 'Groups all vectors from one run'],
            ['blobVersionId',   'Azure Blob Storage API',   'Exact file version (immutable)'],
            ['source',          'Blob filename',            'Which file it came from'],
            ['documentVersion', 'You pass it at seed time', 'Your logical label (v1, v2, …)'],
          ]}
        />
      </Section>
      <Section title="Key files">
        <div className="flex flex-wrap gap-2">
          <Badge color="text-orange-500">lib/agent-it/types.ts</Badge>
          <Badge color="text-orange-500">lib/agent-it/embedder.ts</Badge>
          <Badge color="text-orange-500">app/api/agent-it/seed/route.ts</Badge>
        </div>
      </Section>
    </div>
  );
}

function ReindexTab() {
  return (
    <div>
      <Callout color="blue">The seed route accepts a <Badge color="">mode</Badge> parameter — either wipe the whole namespace and start fresh, or surgically update only the changed source file.</Callout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg border border-rose-200 dark:border-rose-800 p-4">
          <div className="font-semibold text-rose-700 dark:text-rose-400 mb-2">Full mode</div>
          <Code>{`index.deleteAll()
// wipes every vector in namespace
// then re-embeds everything fresh`}</Code>
          <p className="text-xs text-muted-foreground mt-2">Use when: changing embedding model, or major data overhaul.</p>
        </div>
        <div className="rounded-lg border border-cyan-200 dark:border-cyan-800 p-4">
          <div className="font-semibold text-cyan-700 dark:text-cyan-400 mb-2">Incremental mode</div>
          <Code>{`// paginate 100 IDs at a time
// fetch metadata for each batch
// delete only where source === file
// other sources untouched`}</Code>
          <p className="text-xs text-muted-foreground mt-2">Use when: routine update to one source file.</p>
        </div>
      </div>
      <Section title="Incremental delete logic">
        <Code>{`let paginationToken: string | undefined;
const idsToDelete: string[] = [];

do {
  const page = await index.listPaginated({ limit: 100, paginationToken });
  const ids = (page.vectors ?? []).map(v => v.id!).filter(Boolean);

  if (ids.length > 0) {
    const fetched = await index.fetch(ids);
    for (const [id, vec] of Object.entries(fetched.records)) {
      if ((vec.metadata as Record<string,string>)?.source === blobName) {
        idsToDelete.push(id);
      }
    }
  }
  paginationToken = page.pagination?.next;
} while (paginationToken);

if (idsToDelete.length > 0) await index.deleteMany(idsToDelete);`}</Code>
      </Section>
      <Callout color="amber">Analogy: Full = reprint the whole book. Incremental = reprint only the updated chapter.</Callout>
      <Section title="Key file">
        <Badge color="text-cyan-500">app/api/agent-it/seed/route.ts</Badge>
      </Section>
    </div>
  );
}

function EvalTab() {
  return (
    <div>
      <Callout color="rose">Never blind-swap a new namespace into production. Run a Q&A evaluation suite first — only promote when accuracy clears the threshold.</Callout>
      <Section title="Eval flow per question pair">
        <div className="space-y-2">
          {[
            { n: '1', t: 'Embed question', d: 'Generate vector for the question using the same model' },
            { n: '2', t: 'Query candidate namespace', d: 'Pinecone KNN search → top-K matching vectors' },
            { n: '3', t: 'Build context + call GPT', d: 'Generate an answer using only the retrieved chunks' },
            { n: '4', t: 'LLM judge', d: 'Second GPT call scores whether the answer captures the expected facts' },
            { n: '5', t: 'Aggregate metrics', d: 'recall %, accuracy %, avgLatencyMs across all pairs' },
          ].map(s => (
            <div key={s.n} className="flex gap-3 items-start rounded border border-border px-3 py-2 text-sm">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold mt-0.5">{s.n}</span>
              <div><span className="font-medium">{s.t}</span> — <span className="text-muted-foreground">{s.d}</span></div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="LLM judge prompt">
        <Code>{`System: You are an evaluation judge.
Assess if the actual answer captures the key facts of the expected answer.
Mark correct=true if the actual answer addresses the core issue,
even if it uses different phrasing.
Respond with valid JSON only: {"correct": true|false, "reason": "one sentence"}`}</Code>
      </Section>
      <Section title="Promotion gate">
        <Table
          headers={['Metric', 'Formula', 'Gate']}
          rows={[
            ['Recall',   'pairs where Pinecone returned ≥1 result / total',  '—'],
            ['Accuracy', 'pairs where LLM judge said correct / total',        '≥ 60% to promote'],
            ['Latency',  'avg ms per pair (embed + search + LLM)',             'informational'],
          ]}
        />
        <Callout color="amber">If accuracy {"<"} 60%, promotion is blocked. Fix chunking, re-ingest, and re-run eval.</Callout>
      </Section>
      <Section title="Key file">
        <Badge color="text-rose-500">app/api/agent-it/eval/route.ts</Badge>
      </Section>
    </div>
  );
}

function ArchitectureTab() {
  return (
    <div>
      <Section title="System diagram">
        <Code>{`Azure Blob Storage
  IT_Tickets_v1.xlsx (versionId: 2026-05-11-abc)  ← current
  IT_Tickets_v1.xlsx (versionId: 2026-05-10-xyz)  ← older snapshot

       ↓  POST /api/agent-it/seed  (mode: full | incremental)

Pinecone Index: n8nfiles
  namespace: it-tickets-v1  ← active  (live queries hit here)
  namespace: it-tickets-v2  ← candidate (being built / evaluated)

       ↓  POST /api/agent-it/config  (flip _activeNamespace)

PostgreSQL: it_tickets
  ticket rows with vector_id → links back to Pinecone vector`}</Code>
      </Section>
      <Section title="Namespace strategy">
        <p className="text-sm text-muted-foreground mb-3">Namespaces act as immutable version slots. You never mutate the active namespace — you write to a candidate, evaluate it, then promote:</p>
        <Code>{`it-tickets-v1  ← stable, serving production
it-tickets-v2  ← candidate, being built
                    ↓ eval passes (accuracy >= 60%)
it-tickets-v2  ← now active (promoted)
it-tickets-v1  ← kept for rollback`}</Code>
      </Section>
      <Section title="In-process alias vs env var">
        <Table
          headers={['Scope', 'How to set', 'Survives restart?']}
          rows={[
            ['Runtime (this process)', 'POST /api/agent-it/config',         'No — resets to env on restart'],
            ['Persistent',             'Update IT_TICKETS_NAMESPACE in .env', 'Yes'],
          ]}
        />
      </Section>
    </div>
  );
}

function ApiReferenceTab() {
  return (
    <div>
      <Table
        headers={['Route', 'Method', 'Purpose']}
        rows={[
          ['/api/agent-it/seed',          'POST',   'Seed tickets into Pinecone (mode: full | incremental)'],
          ['/api/agent-it/config',        'GET',    'Get active namespace + all it-tickets-* namespaces'],
          ['/api/agent-it/config',        'POST',   'Promote / rollback — switch active namespace'],
          ['/api/agent-it/classify',      'POST',   'Classify an incoming ticket using vector similarity'],
          ['/api/agent-it/eval',          'POST',   'Run LLM-judge eval suite against a candidate namespace'],
          ['/api/agent-it/tickets',       'GET',    'Browse tickets in PostgreSQL'],
          ['/api/agent-it/tickets',       'POST',   'Create a new ticket in PostgreSQL'],
          ['/api/agent-it/blob/upload',   'POST',   'Upload new Excel version to Azure Blob'],
          ['/api/agent-it/blob/versions', 'GET',    'List blob versions for a file'],
        ]}
      />
      <Section title="Seed body">
        <Code>{`POST /api/agent-it/seed
Content-Type: multipart/form-data

file            — Excel file (.xlsx)
namespace       — target Pinecone namespace (e.g. "it-tickets-v2")
documentVersion — logical version label    (e.g. "v2")
mode            — "full" | "incremental"   (default: "incremental")`}</Code>
      </Section>
      <Section title="Eval body">
        <Code>{`POST /api/agent-it/eval
Content-Type: application/json

{
  "namespace": "it-tickets-v2",
  "pairs": [
    { "question": "...", "expectedAnswer": "..." },
    ...
  ],
  "topK": 3
}`}</Code>
      </Section>
      <Section title="Config promote body">
        <Code>{`POST /api/agent-it/config
Content-Type: application/json

{ "namespace": "it-tickets-v2" }

Response:
{ "previousActive": "it-tickets-v1", "newActive": "it-tickets-v2", "promotedAt": "..." }`}</Code>
      </Section>
    </div>
  );
}

const TAB_CONTENT: Record<TabId, React.ReactNode> = {
  overview:     <OverviewTab />,
  source:       <SourceVersioningTab />,
  embedding:    <EmbeddingVersioningTab />,
  index:        <IndexVersioningTab />,
  metadata:     <MetadataTaggingTab />,
  reindex:      <ReindexTab />,
  eval:         <EvalTab />,
  architecture: <ArchitectureTab />,
  api:          <ApiReferenceTab />,
};

// ── Main page ──────────────────────────────────────────────────────────────

function KnowledgebaseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawTab = searchParams.get('tab') as TabId | null;
  const activeTab: TabId = TABS.find(t => t.id === rawTab) ? (rawTab as TabId) : 'overview';

  function setTab(id: TabId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', id);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  const active = TABS.find(t => t.id === activeTab)!;
  const Icon = active.icon;

  return (
    <div className="flex h-svh overflow-hidden">
      {/* Sidebar tabs */}
      <nav className="w-56 flex-shrink-0 border-r border-border bg-muted/20 overflow-y-auto">
        <div className="px-3 pt-5 pb-3">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Knowledgebase</span>
          </div>
          <div className="space-y-0.5">
            {TABS.map(tab => {
              const TabIcon = tab.icon;
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left transition-colors
                    ${isActive
                      ? 'bg-background border border-border shadow-sm font-medium text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                    }`}
                >
                  <TabIcon className={`w-4 h-4 flex-shrink-0 ${isActive ? tab.color : ''}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg bg-muted`}>
              <Icon className={`w-5 h-5 ${active.color}`} />
            </div>
            <h2 className="text-xl font-semibold">{active.label}</h2>
          </div>
          {TAB_CONTENT[activeTab]}
        </div>
      </main>
    </div>
  );
}

export default function KnowledgebasePage() {
  return (
    <Suspense>
      <KnowledgebaseContent />
    </Suspense>
  );
}
