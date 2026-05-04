const phases = [
  {
    num: "1",
    icon: "📥",
    title: "Data Ingestion Phase",
    color: "bg-orange-50/60 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
    numColor: "bg-orange-500",
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
]

export default function VectorDbConsiderationsPage() {
  return (
    <div className="space-y-10">

      <div>
        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-blue-200 dark:border-blue-700">
          🗄️ VECTOR DATABASES & RAG
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">What to Consider</h1>
        <p className="text-muted-foreground text-base">
          RAG is not just retrieval — it involves careful design across ingestion, embedding, indexing, retrieval, and generation. Each phase impacts accuracy, performance, and security.
        </p>
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
