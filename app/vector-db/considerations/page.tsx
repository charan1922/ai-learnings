'use client';

import { useState, useEffect, useCallback } from 'react';

const phases = [
  {
    num: "1",
    icon: "📥",
    title: "Data Ingestion Phase",
    color: "bg-orange-50/60 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
    numColor: "bg-orange-500",
    accentText: "text-orange-700 dark:text-orange-300",
    note: "Most people underestimate this — but this is the foundation.",
    items: [
      {
        label: "Data Quality",
        points: ["Clean text — remove noise, HTML, duplicates", "Normalize formats before processing"],
      },
      {
        label: "Chunking Strategy",
        points: ["Chunk size: too small → no context, too big → irrelevant", "Overlap: important for continuity across boundaries"],
      },
      {
        label: "Content Structuring",
        points: ["Split by headings and sections — not random character count"],
      },
      {
        label: "Metadata",
        points: ["Attach user_id, role, source, timestamp to every chunk", "Critical for access control and filtering at query time"],
      },
      {
        label: "Sensitive Data Handling",
        points: ["Mask PII before storing — emails, phone numbers, SSNs"],
      },
    ],
  },
  {
    num: "2",
    icon: "🔢",
    title: "Embedding Phase",
    color: "bg-purple-50/60 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
    numColor: "bg-purple-500",
    accentText: "text-purple-700 dark:text-purple-300",
    note: "Embedding choice directly impacts retrieval quality.",
    items: [
      {
        label: "Model Selection",
        points: ["General models work broadly; domain-specific models outperform for niche content"],
      },
      {
        label: "Consistency",
        points: ["Use the same model for both indexing and querying — mixing models breaks similarity scores"],
      },
      {
        label: "Dimensionality vs Cost",
        points: ["Higher dimensions = better accuracy, higher compute cost", "Choose based on your scale and latency budget"],
      },
      {
        label: "Batch Processing",
        points: ["Embed in batches during ingestion to reduce API cost and time"],
      },
    ],
  },
  {
    num: "3",
    icon: "🗄️",
    title: "Storage & Indexing Phase",
    color: "bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
    numColor: "bg-blue-500",
    accentText: "text-blue-700 dark:text-blue-300",
    note: "This is where performance is determined.",
    items: [
      {
        label: "Indexing Algorithm",
        points: ["HNSW — fast and widely used (most vector DBs default)", "IVF / PQ — better for very large-scale datasets"],
      },
      {
        label: "Scalability",
        points: ["Design for millions vs billions of vectors differently", "Partition strategies matter at scale"],
      },
      {
        label: "Latency",
        points: ["Real-time queries need low-latency indexes", "Batch pipelines can trade off latency for throughput"],
      },
      {
        label: "Metadata Indexing",
        points: ["Index metadata fields (user_id, role, source) for filtering", "Without this, you can't do access-controlled retrieval"],
      },
    ],
  },
  {
    num: "4",
    icon: "🔍",
    title: "Retrieval Phase",
    color: "bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-800",
    numColor: "bg-red-500",
    accentText: "text-red-700 dark:text-red-300",
    note: "This is where most systems fail.",
    highlight: '"Retrieval quality matters more than model quality."',
    items: [
      {
        label: "Top-K Selection",
        points: ["Too low → miss important context", "Too high → introduce noise into the context window"],
      },
      {
        label: "Similarity Metric",
        points: ["Cosine similarity — most common for semantic search", "Dot product / Euclidean — use case dependent"],
      },
      {
        label: "Re-ranking",
        points: ["Run a cross-encoder re-ranker on top-K results to improve precision"],
      },
      {
        label: "Hybrid Search",
        points: ["Combine vector search with keyword search (BM25)", "Better coverage for both semantic and exact-match queries"],
      },
      {
        label: "Filtering",
        points: ["Role-based access at retrieval time", "Tenant isolation — users only retrieve their permitted documents"],
      },
    ],
  },
  {
    num: "5",
    icon: "🧠",
    title: "Generation Phase",
    color: "bg-green-50/60 dark:bg-green-950/20 border-green-200 dark:border-green-800",
    numColor: "bg-green-500",
    accentText: "text-green-700 dark:text-green-300",
    note: "Context quality going in determines answer quality coming out.",
    items: [
      {
        label: "Prompt Design",
        points: ["Inject retrieved context in a structured, clearly separated format", "Tell the model to answer only from the provided context"],
      },
      {
        label: "Context Window Limits",
        points: ["Don't overload the model — prioritise the most relevant chunks"],
      },
      {
        label: "Grounding",
        points: ["Explicitly instruct: if the answer is not in the context, say so"],
      },
      {
        label: "Output Control",
        points: ["Use structured output (JSON, schema) for downstream processing"],
      },
      {
        label: "Hallucination Handling",
        points: ['"If not found in context, say I don\'t know" — enforced in system prompt'],
      },
    ],
  },
  {
    num: "6",
    icon: "🔁",
    title: "Continuous Improvement",
    color: "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
    numColor: "bg-amber-500",
    accentText: "text-amber-700 dark:text-amber-300",
    note: "Most ignored — but what makes it production-grade.",
    items: [
      {
        label: "Feedback Loop",
        points: ["Capture user feedback on response quality", "Use signals to retune retrieval parameters"],
      },
      {
        label: "Evaluation",
        points: ["Track accuracy, relevance score, and answer faithfulness"],
      },
      {
        label: "Re-indexing",
        points: ["Update embeddings when source data changes", "Stale indexes return stale answers"],
      },
      {
        label: "Monitoring",
        points: ["Track bad/irrelevant responses in production", "Watch for retrieval drift over time"],
      },
    ],
  },
  {
    num: "✦",
    icon: "🔐",
    title: "Cross-Cutting: Security Across All Phases",
    color: "bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800",
    numColor: "bg-slate-600",
    accentText: "text-indigo-700 dark:text-indigo-300",
    note: "These apply at every stage — not just retrieval.",
    items: [
      { label: "🛡️ Input Validation", points: ["Sanitize and validate all queries before embedding", "Reject or flag inputs that look like prompt injection"] },
      { label: "🔍 Output Filtering", points: ["Screen retrieved content before the LLM sees it", "Remove or mask PII and sensitive data from context"] },
      { label: "🔐 Access Control", points: ["Enforce user/role permissions at every phase", "Namespace or partition data per tenant in the vector store"] },
      { label: "📋 Audit Logs", points: ["Log every retrieval and generation for traceability", "Required for compliance — who asked what, when, and what was returned"] },
    ],
  },
]

const TOTAL = phases.length;

export default function VectorDbConsiderationsPage() {
  const [demoMode, setDemoMode] = useState(false);
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() => setCurrent(c => Math.max(0, c - 1)), []);
  const next = useCallback(() => setCurrent(c => Math.min(TOTAL - 1, c + 1)), []);

  useEffect(() => {
    if (!demoMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev();
      if (e.key === 'Escape') setDemoMode(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [demoMode, next, prev]);

  const phase = phases[current];

  if (demoMode) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-muted-foreground">
              Vector Databases & RAG — What to Consider
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {current < TOTAL - 1 ? `Phase ${current + 1}` : 'Security'} of {TOTAL - 1} phases
            </span>
            <button
              onClick={() => setDemoMode(false)}
              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              Exit Demo ✕
            </button>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-4">
          {phases.map((p, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === current
                  ? `${phase.numColor} scale-125`
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto px-12 py-8 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-4 mb-6">
            <span className={`h-12 w-12 rounded-full ${phase.numColor} text-white text-xl font-bold flex items-center justify-center flex-shrink-0`}>
              {phase.num}
            </span>
            <div>
              <h2 className="text-3xl font-bold">{phase.icon} {phase.title}</h2>
              <p className={`text-base font-medium mt-0.5 ${phase.accentText}`}>{phase.note}</p>
            </div>
          </div>

          <div className={`${phase.color} border-2 rounded-2xl p-8 space-y-5`}>
            {phase.highlight && (
              <div className="bg-slate-800 dark:bg-slate-900 text-slate-100 rounded-xl p-4 text-center border border-slate-600">
                <p className="text-base font-semibold">{phase.highlight}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {phase.items.map(({ label, points }) => (
                <div key={label} className="bg-background rounded-xl border border-border p-5 space-y-3">
                  <p className="font-semibold text-sm">{label}</p>
                  <ul className="space-y-2">
                    {points.map((p) => (
                      <li key={p} className="flex gap-2 items-start text-sm text-muted-foreground">
                        <span className="text-blue-400 flex-shrink-0 mt-0.5">→</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex items-center justify-between px-12 py-5 border-t border-border">
          <button
            onClick={prev}
            disabled={current === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <span className="text-xs text-muted-foreground">← → arrow keys to navigate · Esc to exit</span>

          <button
            onClick={next}
            disabled={current === TOTAL - 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  // Normal scroll view
  return (
    <div className="space-y-10">

      <div>
        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-blue-200 dark:border-blue-700">
          🗄️ VECTOR DATABASES & RAG
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">What to Consider</h1>
        <p className="text-muted-foreground text-base mb-5">
          RAG is not just retrieval — it involves careful design across ingestion, embedding, indexing, retrieval, and generation. Each phase impacts accuracy, performance, and security.
        </p>
        <button
          onClick={() => { setCurrent(0); setDemoMode(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
        >
          ▶ Present in Demo Mode
        </button>
      </div>

      {phases.map(({ num, icon, title, color, numColor, note, highlight, items }) => (
        <section key={num} className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={`h-8 w-8 rounded-full ${numColor} text-white text-sm font-bold flex items-center justify-center flex-shrink-0`}>{num}</span>
            <div>
              <h2 className="text-xl font-bold">{icon} {title}</h2>
              <p className="text-sm text-muted-foreground">{note}</p>
            </div>
          </div>

          <div className={`${color} border-2 rounded-2xl p-6 space-y-4`}>
            {highlight && (
              <div className="bg-slate-800 dark:bg-slate-900 text-slate-100 rounded-xl p-3 text-center border border-slate-600">
                <p className="text-sm font-semibold">{highlight}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map(({ label, points }) => (
                <div key={label} className="bg-background rounded-xl border border-border p-4 space-y-2">
                  <p className="font-semibold text-sm">{label}</p>
                  <ul className="space-y-1">
                    {points.map((p) => (
                      <li key={p} className="flex gap-2 items-start text-xs text-muted-foreground">
                        <span className="text-blue-400 flex-shrink-0 mt-0.5">→</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Cross-cutting security */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-slate-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">✦</span>
          <div>
            <h2 className="text-xl font-bold">🔐 Cross-Cutting: Security Across All Phases</h2>
            <p className="text-sm text-muted-foreground">These apply at every stage — not just retrieval.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "🛡️", label: "Input Validation", desc: "Sanitize queries before embedding" },
            { icon: "🔍", label: "Output Filtering", desc: "Screen retrieved content before LLM sees it" },
            { icon: "🔐", label: "Access Control", desc: "Enforce permissions at every phase" },
            { icon: "📋", label: "Audit Logs", desc: "Log every retrieval and generation for traceability" },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 text-center space-y-1">
              <p className="text-2xl">{icon}</p>
              <p className="font-semibold text-xs">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
