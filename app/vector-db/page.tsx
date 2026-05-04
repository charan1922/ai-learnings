import { RagImage } from "@/components/rag-image"

export default function VectorDbPage() {
  return (
    <div className="space-y-12">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-blue-200 dark:border-blue-700">
          🗄️ VECTOR DATABASES & RAG
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Vector Databases</h1>
        <p className="text-muted-foreground text-base">How vector databases make LLMs context-aware instead of guess-based.</p>
      </div>

      {/* Slide 1 — Real Problem */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-red-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">1</span>
          <h2 className="text-xl font-bold">The Problem</h2>
        </div>
        <div className="bg-red-50/60 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 space-y-4">
          <p className="text-base leading-relaxed">
            <strong>"LLMs don't know your application data. Without context, they generate generic or incorrect answers."</strong>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {[
              { icon: "🚫", label: "No Internal Data", desc: "The model has no access to your documents, databases, or domain knowledge" },
              { icon: "🌀", label: "Hallucinations", desc: "Without grounding, the model confidently fabricates plausible-sounding answers" },
              { icon: "⚠️", label: "Not Production-Ready", desc: "Generic responses can't be trusted in real-world business applications" },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="bg-background rounded-xl border border-red-200 dark:border-red-800 p-4 text-center space-y-1">
                <p className="text-2xl">{icon}</p>
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slide 2 — Solution */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-green-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">2</span>
          <h2 className="text-xl font-bold">The Solution</h2>
        </div>
        <div className="bg-green-50/60 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-6 space-y-4">
          <p className="text-base leading-relaxed">
            <strong>A Vector Database combined with a RAG pipeline brings relevant context into the model at query time.</strong>
          </p>
          <div className="bg-background rounded-xl border border-green-300 dark:border-green-700 p-5 text-center">
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              Context-Aware &nbsp;→&nbsp; Not Guess-Based
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Instead of answering blindly, the model answers based on retrieved context from your own data.
            </p>
          </div>
        </div>
      </section>

      {/* Slide 3 — Core Flow */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">3</span>
          <h2 className="text-xl font-bold">Core RAG Flow</h2>
        </div>

        <div className="rounded-2xl border-2 border-blue-200 dark:border-blue-800 overflow-hidden bg-blue-50/40 dark:bg-blue-950/20">
          <RagImage src="/rag1.png" alt="RAG Pipeline Flow Diagram" className="w-full object-contain max-h-[500px]" />
          <div className="p-6 space-y-2 font-mono text-sm">
            {[
              { step: "User Query", color: "text-blue-600 dark:text-blue-400", icon: "👤" },
              { step: "Convert to Embedding", color: "text-purple-600 dark:text-purple-400", icon: "🔢" },
              { step: "Search Vector DB (semantic similarity)", color: "text-violet-600 dark:text-violet-400", icon: "🔍" },
              { step: "Retrieve Top-K Relevant Chunks", color: "text-amber-600 dark:text-amber-400", icon: "📦" },
              { step: "Pass Context to LLM", color: "text-orange-600 dark:text-orange-400", icon: "🧠" },
              { step: "Generate Grounded Answer", color: "text-green-600 dark:text-green-400", icon: "✅" },
            ].map(({ step, color, icon }, i, arr) => (
              <div key={step}>
                <div className={`flex items-center gap-3 ${color} font-medium`}>
                  <span>{icon}</span>
                  <span>{step}</span>
                </div>
                {i < arr.length - 1 && <div className="ml-4 text-muted-foreground text-xs py-0.5">↓</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 rounded-xl p-4">
          <p className="text-sm italic text-center text-muted-foreground">
            "Instead of answering blindly, the model answers based on <strong className="text-foreground">retrieved context</strong>."
          </p>
        </div>
      </section>

      {/* Slide 4 — Ingestion Pipeline */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-purple-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">4</span>
          <h2 className="text-xl font-bold">Ingestion Pipeline</h2>
        </div>
        <div className="bg-purple-50/60 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-6 space-y-5">
          <p className="text-base font-semibold">
            A RAG pipeline involves preparing and indexing data before retrieval can happen.
          </p>

          <div className="rounded-xl border border-purple-200 dark:border-purple-800 overflow-hidden bg-background">
            <RagImage src="/rag2.png" alt="RAG Ingestion Pipeline Diagram" className="w-full object-contain max-h-[500px]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: "📥", step: "1. Document Ingestion", desc: "Load raw documents into the pipeline" },
              { icon: "✂️", step: "2. Chunking", desc: "Split docs into sized chunks with overlap" },
              { icon: "🔢", step: "3. Embedding Generation", desc: "Convert chunks to vector representations" },
              { icon: "🗄️", step: "4. Store in Vector DB", desc: "Index vectors with metadata" },
              { icon: "🔍", step: "5. Top-K Retrieval", desc: "Semantic search at query time" },
              { icon: "🧠", step: "6. LLM + Context", desc: "Ground the model with retrieved chunks" },
            ].map(({ icon, step, desc }) => (
              <div key={step} className="bg-background rounded-lg border border-purple-200 dark:border-purple-800 p-3 space-y-1">
                <p className="text-lg">{icon}</p>
                <p className="font-semibold text-xs">{step}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
            <p className="text-sm font-medium text-center text-purple-800 dark:text-purple-200">
              "Chunking strategy and retrieval tuning directly impact answer quality."
            </p>
          </div>
        </div>
      </section>

      {/* Slide 5 — Security Angle */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-red-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">5</span>
          <h2 className="text-xl font-bold">Security Considerations</h2>
        </div>
        <div className="bg-slate-50/60 dark:bg-slate-950/20 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-5">
          <p className="text-base font-semibold">
            "A vector database introduces new risks if not controlled properly."
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-red-600 dark:text-red-400">⚠️ Risks</h3>
              {[
                "Sensitive data exposure via retrieved chunks",
                "Wrong document retrieval breaking trust",
                "Prompt injection via poisoned stored data",
              ].map((r) => (
                <div key={r} className="flex gap-2 items-start bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 rounded-lg px-3 py-2">
                  <span className="text-red-500 flex-shrink-0 mt-0.5">✗</span>
                  <p className="text-sm">{r}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-green-600 dark:text-green-400">✅ Mitigations</h3>
              {[
                { label: "Access Control", desc: "User-specific document access only" },
                { label: "Metadata Filtering", desc: "Filter by user / role at query time" },
                { label: "Trusted Data Only", desc: "Controlled ingestion — no unverified sources" },
                { label: "Sanitization", desc: "Clean and validate chunks before storing" },
              ].map(({ label, desc }) => (
                <div key={label} className="flex gap-2 items-start bg-green-50/50 dark:bg-green-950/20 border border-green-200/50 rounded-lg px-3 py-2">
                  <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 dark:bg-slate-900 text-slate-100 rounded-xl p-4 text-center border border-slate-600">
            <p className="text-sm font-semibold">
              "Treat the vector database as a <span className="text-blue-400">controlled data layer</span>, not just a search engine."
            </p>
          </div>
        </div>
      </section>

      {/* Slide 6 — Optimization */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-amber-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">6</span>
          <h2 className="text-xl font-bold">Retrieval Optimization</h2>
        </div>
        <div className="bg-amber-50/60 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6 space-y-4">
          <p className="text-base font-semibold">Key levers for improving retrieval quality:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: "✂️", label: "Chunk Size Tuning", desc: "Smaller = precise, Larger = more context" },
              { icon: "🔁", label: "Overlap Strategy", desc: "Prevents losing context at chunk boundaries" },
              { icon: "🔢", label: "Better Embeddings", desc: "Domain-specific models outperform generic ones" },
              { icon: "🎯", label: "Top-K Tuning", desc: "Balance relevance vs. context window size" },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="bg-background rounded-xl border border-amber-200 dark:border-amber-800 p-4 text-center space-y-2">
                <p className="text-2xl">{icon}</p>
                <p className="font-semibold text-xs">{label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Slide 7 — Problem → Solution Table */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-indigo-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">7</span>
          <h2 className="text-xl font-bold">Problem → Solution</h2>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/70">
                <th className="p-4 text-left font-semibold border-b border-border">Problem</th>
                <th className="p-4 text-left font-semibold border-b border-border">Solution</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["🌀 Hallucination", "RAG grounds responses — the model answers only from retrieved context"],
                ["🎯 Irrelevant Answers", "Semantic search returns meaning-based matches, not just keyword matches"],
                ["🔓 Data Leakage", "Access-controlled retrieval — users only see their permitted documents"],
                ["📉 Poor Context Quality", "Top-K tuning + chunk overlap ensures a rich, relevant context window"],
              ].map(([problem, solution]) => (
                <tr key={problem} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">{problem}</td>
                  <td className="p-4 text-muted-foreground">{solution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Slide 8 — Key Takeaway */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">8</span>
          <h2 className="text-xl font-bold">Key Takeaway</h2>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border-2 border-green-200 dark:border-green-800 rounded-2xl p-8 space-y-6">
          <p className="text-xl font-bold text-center">
            "Vector databases make AI systems accurate, context-aware, and safe for real-world use."
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "🎯", label: "Accurate", desc: "Grounded in real data — not model guesses" },
              { icon: "🧠", label: "Context-Aware", desc: "Every answer backed by retrieved evidence" },
              { icon: "🔒", label: "Safe", desc: "Access controls + sanitization protect sensitive data" },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="bg-background rounded-xl border border-green-200 dark:border-green-800 p-5 text-center space-y-2">
                <p className="text-3xl">{icon}</p>
                <p className="font-bold text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-slate-800 dark:bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-600">
            <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">One-liner summary</p>
            <p className="text-sm font-semibold leading-relaxed">
              "A vector database with a controlled RAG pipeline retrieves relevant, secure context to ground LLM responses."
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
