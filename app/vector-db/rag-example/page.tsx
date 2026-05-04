'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const SAMPLE_TEXT = `Azure OpenAI Service provides REST API access to OpenAI's powerful language models including GPT-4, GPT-3.5-Turbo, and embedding models like text-embedding-ada-002. The service is deeply integrated with Azure's enterprise security, compliance, and regional data residency features. You can use Azure OpenAI for chat completions, text generation, summarization, and semantic search. Deployments are managed through Azure AI Studio or the Azure Portal. The service requires an Azure subscription and a dedicated resource with approved access. API versions are managed independently, and customers should use the latest stable version for production workloads.`;

type IngestStatus = { type: 'success' | 'error'; message: string };
type Source = { content: string; metadata: Record<string, unknown> };
type QueryResult = { answer: string; sources: Source[] };

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

export default function RagExamplePage() {
  const [ingestText, setIngestText] = useState('');
  const [ingestStatus, setIngestStatus] = useState<IngestStatus | null>(null);
  const [ingestLoading, setIngestLoading] = useState(false);

  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);

  const handleIngest = async () => {
    setIngestLoading(true);
    setIngestStatus(null);
    try {
      const res = await fetch('/api/rag/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ingestText }),
      });
      const data = await res.json();
      if (res.ok) {
        setIngestStatus({
          type: 'success',
          message: `Ingested as ${data.chunks} chunk${data.chunks !== 1 ? 's' : ''} into Pinecone.`,
        });
        setIngestText('');
      } else {
        setIngestStatus({ type: 'error', message: data.error || 'Ingestion failed.' });
      }
    } catch {
      setIngestStatus({ type: 'error', message: 'Network error — check the server.' });
    } finally {
      setIngestLoading(false);
    }
  };

  const handleQuery = async () => {
    setQueryLoading(true);
    setQueryResult(null);
    setQueryError(null);
    try {
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (res.ok) {
        setQueryResult(data);
      } else {
        setQueryError(data.error || 'Query failed.');
      }
    } catch {
      setQueryError('Network error — check the server.');
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div className="space-y-12">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-blue-200 dark:border-blue-700">
          🗄️ VECTOR DATABASES & RAG
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">RAG Example</h1>
        <p className="text-muted-foreground text-base">
          Live pipeline using LangChain, Pinecone, and Azure OpenAI — ingest documents then query them.
        </p>
      </div>

      {/* Tech Stack */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-slate-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">⚡</span>
          <h2 className="text-xl font-bold">Tech Stack</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              name: 'LangChain',
              role: 'Orchestration',
              desc: 'Chains retriever + LLM into a single pipeline via ChatPromptTemplate',
              color: 'bg-green-50/60 dark:bg-green-950/20 border-green-200 dark:border-green-800',
            },
            {
              name: 'Pinecone',
              role: 'Vector Store',
              desc: 'Stores and retrieves high-dimensional embedding vectors at scale',
              color: 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
            },
            {
              name: 'Azure OpenAI',
              role: 'Embeddings + LLM',
              desc: 'Converts text to vectors (text-embedding-ada-002) and generates answers (GPT-4)',
              color: 'bg-purple-50/60 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
            },
          ].map(({ name, role, desc, color }) => (
            <div key={name} className={`${color} border rounded-2xl p-4 space-y-1`}>
              <p className="font-bold text-sm">{name}</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{role}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Step 1 — Ingest */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-purple-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">1</span>
          <h2 className="text-xl font-bold">Ingest Documents</h2>
        </div>
        <div className="bg-purple-50/60 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Paste any text. It will be <strong className="text-foreground">chunked → embedded → stored</strong> in Pinecone.
          </p>

          <Textarea
            placeholder="Paste your document text here..."
            value={ingestText}
            onChange={(e) => setIngestText(e.target.value)}
            rows={6}
            className="bg-background"
          />

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={handleIngest}
              disabled={ingestLoading || !ingestText.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {ingestLoading ? (
                <span className="flex items-center gap-2"><Spinner /> Ingesting…</span>
              ) : (
                'Ingest Document'
              )}
            </Button>
            <button
              type="button"
              onClick={() => setIngestText(SAMPLE_TEXT)}
              className="text-xs text-purple-600 dark:text-purple-400 underline underline-offset-2 hover:no-underline"
            >
              Load sample text
            </button>
          </div>

          {ingestStatus && (
            <div
              className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm border ${
                ingestStatus.type === 'success'
                  ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300'
              }`}
            >
              <span>{ingestStatus.type === 'success' ? '✅' : '❌'}</span>
              <span>{ingestStatus.message}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { icon: '✂️', label: 'Chunk', desc: '500 chars, 50 overlap' },
              { icon: '🔢', label: 'Embed', desc: 'text-embedding-ada-002' },
              { icon: '🗄️', label: 'Store', desc: 'Pinecone vector index' },
            ].map(({ icon, label, desc }) => (
              <div
                key={label}
                className="bg-background rounded-xl border border-purple-200 dark:border-purple-800 p-3 text-center space-y-0.5"
              >
                <p className="text-xl">{icon}</p>
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step 2 — Query */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">2</span>
          <h2 className="text-xl font-bold">Query & Generate</h2>
        </div>
        <div className="bg-blue-50/60 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Ask a question. The pipeline will <strong className="text-foreground">embed → retrieve top-3 chunks → generate</strong> an answer grounded in your documents.
          </p>

          <div className="flex gap-2">
            <Input
              placeholder="e.g. What models does Azure OpenAI support?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !queryLoading && query.trim()) handleQuery();
              }}
              className="bg-background flex-1"
            />
            <Button
              onClick={handleQuery}
              disabled={queryLoading || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {queryLoading ? (
                <span className="flex items-center gap-2"><Spinner /> Querying…</span>
              ) : (
                'Ask'
              )}
            </Button>
          </div>

          {queryError && (
            <div className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300">
              <span>❌</span>
              <span>{queryError}</span>
            </div>
          )}

          {queryResult && (
            <div className="space-y-4">
              <div className="bg-background rounded-xl border border-blue-200 dark:border-blue-800 p-4 space-y-2">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Generated Answer</p>
                <p className="text-sm leading-relaxed">{queryResult.answer}</p>
              </div>

              {queryResult.sources.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Retrieved Sources ({queryResult.sources.length})
                  </p>
                  {queryResult.sources.map((src, i) => (
                    <div key={i} className="bg-background rounded-xl border border-border p-3 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                          Chunk {i + 1}
                        </span>
                        {src.metadata.source && (
                          <span className="text-xs text-muted-foreground">
                            source: {String(src.metadata.source)}
                          </span>
                        )}
                        {src.metadata.chunkIndex !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            index: {String(src.metadata.chunkIndex)}/{String(src.metadata.totalChunks)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{src.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { icon: '🔍', label: 'Embed Query', desc: 'Same model as ingestion' },
              { icon: '🎯', label: 'Top-K Retrieve', desc: 'k=3 similar chunks' },
              { icon: '🧠', label: 'Generate', desc: 'GPT-4 + context' },
            ].map(({ icon, label, desc }) => (
              <div
                key={label}
                className="bg-background rounded-xl border border-blue-200 dark:border-blue-800 p-3 text-center space-y-0.5"
              >
                <p className="text-xl">{icon}</p>
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step 3 — How It Works */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-slate-400 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">3</span>
          <h2 className="text-xl font-bold">How It Works</h2>
        </div>
        <div className="bg-muted/40 border border-border rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Ingestion (offline)
              </p>
              <ol className="space-y-1.5">
                {[
                  'Text is split into 500-char chunks with 50-char overlap',
                  'Each chunk is embedded via Azure OpenAI Embeddings',
                  'Vectors + metadata are upserted into Pinecone',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-purple-500 font-semibold text-xs mt-0.5">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Query (real-time)
              </p>
              <ol className="space-y-1.5">
                {[
                  'Query is embedded with the same Azure OpenAI model',
                  'Top-3 nearest chunks retrieved from Pinecone by cosine similarity',
                  'Chunks injected into a ChatPromptTemplate and sent to Azure GPT-4',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-blue-500 font-semibold text-xs mt-0.5">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 rounded-xl p-4">
            <p className="text-sm italic text-center text-muted-foreground">
              Tracing enabled via{' '}
              <strong className="text-foreground">Traceloop + OpenTelemetry</strong> — view traces at{' '}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">localhost:4318</code>
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
