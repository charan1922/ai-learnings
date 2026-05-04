import { RagImage } from "@/components/rag-image"

export default function VectorDbIntroductionPage() {
  return (
    <div className="space-y-12">

      <div>
        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-blue-200 dark:border-blue-700">
          🗄️ VECTOR DATABASES & RAG
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Introduction</h1>
        <p className="text-muted-foreground text-base">How vector databases make LLMs context-aware instead of guess-based.</p>
      </div>

      {/* Slide 1 — The Problem */}
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

      {/* Slide 2 — The Solution */}
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

      {/* Slide 3 — The RAG Pipeline */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">3</span>
          <h2 className="text-xl font-bold">The RAG Pipeline</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">Phase 1 — Ingestion (offline)</p>
            <p className="text-sm text-muted-foreground">Documents are chunked, embedded, and indexed into the vector DB ahead of time.</p>
          </div>
          <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Phase 2 — Query (real-time)</p>
            <p className="text-sm text-muted-foreground">User query is embedded, matched against the index, and top-K chunks are passed to the LLM.</p>
          </div>
        </div>

        {/* Images stacked vertically, full width */}
        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-800 overflow-hidden bg-purple-50/30 dark:bg-purple-950/20">
            <div className="px-4 pt-3 pb-1">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Ingestion Pipeline</p>
            </div>
            <RagImage src="/rag2.png" alt="RAG Ingestion Pipeline" className="w-full object-contain" />
          </div>

          <div className="rounded-2xl border-2 border-blue-200 dark:border-blue-800 overflow-hidden bg-blue-50/30 dark:bg-blue-950/20">
            <div className="px-4 pt-3 pb-1">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Query Flow</p>
            </div>
            <RagImage src="/rag1.png" alt="RAG Query Flow" className="w-full object-contain" />
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { icon: "📥", step: "Ingest", desc: "Load docs" },
            { icon: "✂️", step: "Chunk", desc: "Split + overlap" },
            { icon: "🔢", step: "Embed", desc: "Vectorise" },
            { icon: "🗄️", step: "Index", desc: "Store in DB" },
            { icon: "🔍", step: "Retrieve", desc: "Top-K search" },
            { icon: "🧠", step: "Generate", desc: "LLM + context" },
          ].map(({ icon, step, desc }) => (
            <div key={step} className="bg-muted/50 rounded-lg border border-border p-3 text-center space-y-1">
              <p className="text-xl">{icon}</p>
              <p className="font-semibold text-xs">{step}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 rounded-xl p-4">
          <p className="text-sm italic text-center text-muted-foreground">
            "Instead of answering blindly, the model answers based on <strong className="text-foreground">retrieved context</strong>."
          </p>
        </div>
      </section>

    </div>
  )
}
