'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type IngestStatus = { type: 'success' | 'error'; message: string; namespace?: string; documentVersion?: string; ingestId?: string };
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

export default function RagExample2Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ingestStatus, setIngestStatus] = useState<IngestStatus | null>(null);
  const [ingestLoading, setIngestLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);

  const SAMPLE_FILENAME = 'northstar-clinical-intelligence-report.md';
  const SAMPLE_QUESTIONS = [
    'What was the 30-day readmission rate before implementation?',
    'How does the sepsis early warning system work?',
    'What are the strategic recommendations?',
    'What is the false positive alert rate?',
  ];

  function handleFileSelect(file: File) {
    const allowed = ['.md', '.pdf', '.doc', '.docx', '.txt'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      setIngestStatus({ type: 'error', message: `Unsupported file type. Allowed: ${allowed.join(', ')}` });
      return;
    }
    setSelectedFile(file);
    setIngestStatus(null);
  }

  const handleIngest = async (fileOverride?: File) => {
    const file = fileOverride ?? selectedFile;
    if (!file) return;

    setIngestLoading(true);
    setIngestStatus(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/rag/ingest-file', { method: 'POST', body: formData });
      const data = await res.json();

      if (res.ok) {
        setIngestStatus({
          type: 'success',
          message: `"${data.filename}" ingested as ${data.chunks} chunk${data.chunks !== 1 ? 's' : ''} into Pinecone.`,
          namespace: data.namespace,
          documentVersion: data.documentVersion,
          ingestId: data.ingestId,
        });
      } else {
        setIngestStatus({ type: 'error', message: data.error || 'Ingestion failed.' });
      }
    } catch {
      setIngestStatus({ type: 'error', message: 'Network error — check the server.' });
    } finally {
      setIngestLoading(false);
    }
  };

  const handleLoadSample = async () => {
    setIngestLoading(true);
    setIngestStatus(null);
    try {
      const res = await fetch(`/${SAMPLE_FILENAME}`);
      const text = await res.text();
      const file = new File([text], SAMPLE_FILENAME, { type: 'text/markdown' });
      setSelectedFile(file);
      await handleIngest(file);
    } catch {
      setIngestStatus({ type: 'error', message: 'Failed to load sample file.' });
      setIngestLoading(false);
    }
  };

  const handleQuery = async (questionOverride?: string) => {
    const q = questionOverride ?? query;
    if (!q.trim()) return;
    if (questionOverride) setQuery(questionOverride);

    setQueryLoading(true);
    setQueryResult(null);
    setQueryError(null);
    try {
      const res = await fetch('/api/rag/query-2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
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
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">RAG Example 2</h1>
        <p className="text-muted-foreground mt-2">
          Upload a document (Markdown, PDF, DOCX) and ask questions about it. Uses{' '}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">@azure/openai</code> SDK with a dedicated Pinecone namespace.
        </p>
      </div>

      {/* Section 1: Upload & Ingest */}
      <section className="border-l-4 border-purple-500 pl-6 space-y-5">
        <div>
          <span className="text-xs font-semibold text-purple-600 uppercase tracking-widest">Step 1</span>
          <h2 className="text-xl font-semibold mt-1">Upload &amp; Ingest Document</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your file is chunked, embedded via Azure OpenAI, and stored in Pinecone under the active versioned namespace.
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Supported formats', value: '.md · .pdf · .doc · .docx' },
            { label: 'Namespace isolation', value: 'Active namespace (versioned slots)' },
            { label: 'Chunk size', value: '500 chars · 50 char overlap' },
          ].map(card => (
            <div key={card.label} className="rounded-lg border bg-muted/40 p-3">
              <div className="text-xs font-medium text-muted-foreground">{card.label}</div>
              <div className="text-sm font-semibold mt-1">{card.value}</div>
            </div>
          ))}
        </div>

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            dragOver ? 'border-purple-400 bg-purple-50 dark:bg-purple-950/20' : 'border-border hover:border-purple-400 hover:bg-muted/30'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFileSelect(file);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
          />
          {selectedFile ? (
            <div>
              <div className="text-2xl mb-2">📄</div>
              <div className="font-semibold text-sm">{selectedFile.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB — click to change
              </div>
            </div>
          ) : (
            <div>
              <div className="text-3xl mb-2">⬆️</div>
              <div className="font-medium text-sm">Drop a file here or click to browse</div>
              <div className="text-xs text-muted-foreground mt-1">.md · .pdf · .doc · .docx</div>
            </div>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={() => handleIngest()}
            disabled={!selectedFile || ingestLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {ingestLoading ? <><Spinner /><span className="ml-2">Ingesting…</span></> : 'Ingest File'}
          </Button>
          <Button
            variant="outline"
            onClick={handleLoadSample}
            disabled={ingestLoading}
          >
            {ingestLoading ? <><Spinner /><span className="ml-2">Loading…</span></> : 'Load Sample File'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          &quot;Load Sample File&quot; ingests the{' '}
          <a href="/report" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-70 transition-opacity">
            Northstar Clinical Intelligence Report ↗
          </a>{' '}
          included with this demo.
        </p>

        {ingestStatus && (
          <div
            className={`rounded-lg px-4 py-3 text-sm border space-y-1.5 ${
              ingestStatus.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300'
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300'
            }`}
          >
            <div>{ingestStatus.type === 'success' ? '✅ ' : '❌ '}{ingestStatus.message}</div>
            {ingestStatus.type === 'success' && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-80 font-mono">
                {ingestStatus.namespace && <span>namespace: {ingestStatus.namespace}</span>}
                {ingestStatus.documentVersion && <span>version: {ingestStatus.documentVersion}</span>}
                {ingestStatus.ingestId && <span>ingestId: {ingestStatus.ingestId}</span>}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Section 2: Query */}
      <section className="border-l-4 border-blue-500 pl-6 space-y-5">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Step 2</span>
          <h2 className="text-xl font-semibold mt-1">Query Your Document</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your question is embedded, matched against stored chunks, and answered by GPT-4.1 using only retrieved context.
          </p>
        </div>

        {/* Sample questions */}
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground font-medium mb-2">Try a sample question:</div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => handleQuery(q)}
                disabled={queryLoading}
                className="text-xs px-3 py-1.5 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/30 transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask a question about the ingested document…"
            onKeyDown={e => e.key === 'Enter' && !queryLoading && handleQuery()}
            className="flex-1"
          />
          <Button
            onClick={() => handleQuery()}
            disabled={!query.trim() || queryLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {queryLoading ? <Spinner /> : 'Ask'}
          </Button>
        </div>

        {queryError && (
          <div className="rounded-lg px-4 py-3 text-sm border bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300">
            ❌ {queryError}
          </div>
        )}

        {queryResult && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-background p-5 shadow-sm">
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Answer</div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{queryResult.answer}</p>
            </div>

            {queryResult.sources.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                  Retrieved Chunks ({queryResult.sources.length})
                </div>
                <div className="space-y-3">
                  {queryResult.sources.map((src, i) => (
                    <div key={i} className="rounded-lg border bg-muted/30 p-4">
                      <div className="flex gap-4 text-xs text-muted-foreground mb-2 flex-wrap">
                        <span>📄 {String(src.metadata.source ?? 'unknown')}</span>
                        <span>Chunk {Number(src.metadata.chunkIndex ?? 0) + 1} / {String(src.metadata.totalChunks ?? '?')}</span>
                        <span>Score: {(Number(src.metadata.score ?? 0) * 100).toFixed(1)}%</span>
                        {src.metadata.documentVersion && <span className="font-mono bg-muted px-1 rounded">v: {String(src.metadata.documentVersion)}</span>}
                        {src.metadata.embeddingModel && <span className="font-mono bg-muted px-1 rounded">{String(src.metadata.embeddingModel)}</span>}
                      </div>
                      <p className="text-xs font-mono leading-relaxed text-foreground/80">{src.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Section 3: How It Works */}
      <section className="border-l-4 border-slate-400 pl-6 space-y-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Reference</span>
          <h2 className="text-xl font-semibold mt-1">How It Works</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border p-4 space-y-3">
            <div className="font-semibold text-sm text-purple-700 dark:text-purple-400">Ingestion Pipeline</div>
            {[
              ['1', 'Parse file', 'Extract text from .md, .pdf, or .docx'],
              ['2', 'Chunk', 'Split into 500-char overlapping segments'],
              ['3', 'Embed', 'Azure OpenAI text-embedding-3-small'],
              ['4', 'Store', 'Upsert to Pinecone — namespace from active config'],
            ].map(([n, title, desc]) => (
              <div key={n} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{n}</div>
                <div>
                  <div className="text-xs font-semibold">{title}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border p-4 space-y-3">
            <div className="font-semibold text-sm text-blue-700 dark:text-blue-400">Query Pipeline</div>
            {[
              ['1', 'Embed query', 'Convert question to vector'],
              ['2', 'Retrieve', 'Top-3 nearest chunks from Pinecone'],
              ['3', 'Augment', 'Inject chunks as context into prompt'],
              ['4', 'Generate', 'GPT-4.1 answers from context only'],
            ].map(([n, title, desc]) => (
              <div key={n} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{n}</div>
                <div>
                  <div className="text-xs font-semibold">{title}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-muted/40 p-4 text-xs space-y-1">
          <div className="font-semibold mb-2">Tech stack</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ['SDK', '@azure/openai v2', 'Native HTTPS — no IPv6 issues'],
              ['Embeddings', 'text-embedding-3-small', '1536 dimensions, cosine similarity'],
              ['Vector store', 'Pinecone', 'Serverless, versioned namespace slots'],
              ['Chat model', 'GPT-4.1', 'Azure OpenAI, context-grounded'],
              ['File parsing', 'pdf-parse v2 · mammoth', 'PDF and DOCX extraction'],
              ['Framework', 'Next.js 15 App Router', 'Server-side API routes'],
            ].map(([label, value, sub]) => (
              <div key={label} className="rounded bg-background border p-2">
                <div className="text-muted-foreground">{label}</div>
                <div className="font-semibold">{value}</div>
                <div className="text-muted-foreground text-[10px] mt-0.5">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
