export default function ChunkingPage() {
  return (
    <div className="space-y-12">

      <div>
        <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-green-200 dark:border-green-700">
          ✂️ CHUNKING STRATEGIES
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Chunking Strategies</h1>
        <p className="text-muted-foreground text-base">
          How you split documents directly determines retrieval quality. Poor chunking = poor RAG.
        </p>
      </div>

      {/* Why Chunking Matters */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-red-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">1</span>
          <h2 className="text-xl font-bold">Why Chunking Matters</h2>
        </div>
        <div className="bg-red-50/60 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 space-y-4">
          <p className="text-base leading-relaxed">
            <strong>LLMs have a fixed context window. You can't pass in entire documents — you need to find the right passages.</strong>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {[
              { icon: "📏", label: "Context Limits", desc: "Even large context LLMs degrade in quality with too much noise. Precise chunks improve signal." },
              { icon: "🎯", label: "Retrieval Precision", desc: "Embedding a 10-page document produces one blurry vector. Small chunks produce sharp, specific vectors." },
              { icon: "💰", label: "Cost & Latency", desc: "Smaller, relevant chunks reduce token usage and response time in production." },
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

      {/* The Core Trade-off */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-amber-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">2</span>
          <h2 className="text-xl font-bold">The Core Trade-off</h2>
        </div>
        <div className="bg-amber-50/60 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-background rounded-xl border border-amber-200 dark:border-amber-700 p-4 space-y-2">
              <p className="font-semibold text-sm text-amber-700 dark:text-amber-300">📦 Chunks Too Large</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Diluted embeddings — one vector covers many topics</li>
                <li>• Low retrieval precision</li>
                <li>• More tokens sent to LLM per query</li>
                <li>• Harder to cite sources accurately</li>
              </ul>
            </div>
            <div className="bg-background rounded-xl border border-amber-200 dark:border-amber-700 p-4 space-y-2">
              <p className="font-semibold text-sm text-amber-700 dark:text-amber-300">🔬 Chunks Too Small</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Missing context — fragments lack meaning on their own</li>
                <li>• Broken sentences confuse the LLM</li>
                <li>• Needs more chunks to cover the same passage</li>
                <li>• Higher storage & embedding cost</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-amber-100 dark:bg-amber-900/40 rounded-xl p-3 text-center">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Goal: chunks that are semantically complete, focused, and independently meaningful.
            </p>
          </div>
        </div>
      </section>

      {/* Strategy 1 — Fixed-Size */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">3</span>
          <h2 className="text-xl font-bold">Strategy 1 — Fixed-Size Chunking</h2>
        </div>
        <div className="bg-blue-50/60 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Split text into chunks of exactly N characters or tokens, regardless of content structure.
          </p>
          <div className="bg-background border border-blue-200 dark:border-blue-700 rounded-xl p-4 font-mono text-xs text-muted-foreground">
            <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2"># Python example</p>
            <p>chunk_size = 512  <span className="text-muted-foreground"># tokens</span></p>
            <p>chunks = [text[i:i+chunk_size]</p>
            <p className="pl-10">for i in range(0, len(text), chunk_size)]</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-700 p-3 space-y-1">
              <p className="text-xs font-semibold text-green-700 dark:text-green-400">✅ Pros</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Simple and fast to implement</li>
                <li>• Predictable chunk count and size</li>
                <li>• Works well with uniform content</li>
              </ul>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-700 p-3 space-y-1">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400">❌ Cons</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Cuts mid-sentence or mid-idea</li>
                <li>• No awareness of document structure</li>
                <li>• Poor retrieval for structured docs</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Best for: raw log files, homogenous text with no structure.
          </p>
        </div>
      </section>

      {/* Strategy 2 — Overlapping Chunks */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-purple-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">4</span>
          <h2 className="text-xl font-bold">Strategy 2 — Overlapping Chunks</h2>
        </div>
        <div className="bg-purple-50/60 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-6 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Fixed-size chunks with a sliding window overlap — each chunk shares N tokens with the previous. Prevents context from being cut off at boundaries.
          </p>

          {/* Visual diagram */}
          <div className="bg-background border border-purple-200 dark:border-purple-700 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-3">Visual: chunk_size=6, overlap=2</p>
            <div className="space-y-1 font-mono text-xs">
              {[
                { label: "Chunk 1", tokens: ["A","B","C","D","E","F","·","·"], active: [0,5] },
                { label: "Chunk 2", tokens: ["·","·","·","·","E","F","G","H","I","J","·","·"], active: [4,9] },
                { label: "Chunk 3", tokens: ["·","·","·","·","·","·","·","·","I","J","K","L","M","N"], active: [8,13] },
              ].map(({ label, tokens, active }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-14 text-muted-foreground shrink-0">{label}</span>
                  <div className="flex gap-0.5">
                    {tokens.map((t, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold border ${
                          t === "·"
                            ? "bg-transparent border-transparent text-transparent"
                            : i >= active[0] && i <= active[1]
                            ? "bg-purple-500 text-white border-purple-500"
                            : "bg-muted border-border text-muted-foreground"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Overlap tokens (E, F and I, J) appear in consecutive chunks — no context is lost at boundaries.</p>
          </div>

          <div className="bg-background border border-purple-200 dark:border-purple-700 rounded-xl p-4 font-mono text-xs text-muted-foreground">
            <p className="text-purple-600 dark:text-purple-400 font-semibold mb-2"># LangChain RecursiveCharacterTextSplitter</p>
            <p>splitter = RecursiveCharacterTextSplitter(</p>
            <p className="pl-4">chunk_size=512,</p>
            <p className="pl-4">chunk_overlap=50,  <span className="text-muted-foreground"># ~10% overlap</span></p>
            <p>)</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-700 p-3 space-y-1">
              <p className="text-xs font-semibold text-green-700 dark:text-green-400">✅ Pros</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Prevents context loss at chunk edges</li>
                <li>• Better recall for boundary-crossing passages</li>
                <li>• Easy to tune (just adjust overlap %)</li>
              </ul>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-700 p-3 space-y-1">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400">❌ Cons</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Increases total chunk count and storage</li>
                <li>• Duplicate content can inflate retrieval</li>
                <li>• Still unaware of semantic structure</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Best for: general-purpose RAG, articles, documentation. The most common default strategy.
          </p>
        </div>
      </section>

      {/* Strategy 3 — Structure-Aware */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-green-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">5</span>
          <h2 className="text-xl font-bold">Strategy 3 — Structure-Aware Chunking</h2>
        </div>
        <div className="bg-green-50/60 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-6 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Split on natural document boundaries: headings, paragraphs, sentences, or code blocks. Respects the logical structure of the source document.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: "📑", label: "By Heading", desc: "Split at H1/H2/H3 — each section becomes a chunk. Great for wikis and docs." },
              { icon: "¶", label: "By Paragraph", desc: "Split on double newlines. Preserves logical ideas within their paragraph unit." },
              { icon: ".", label: "By Sentence", desc: "NLTK / spaCy sentence tokenization. Most granular; best for Q&A." },
              { icon: "{ }", label: "By Code Block", desc: "Split at function or class boundaries. Essential for code-heavy repos." },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="bg-background rounded-xl border border-green-200 dark:border-green-700 p-3 space-y-1">
                <p className="text-xl text-center">{icon}</p>
                <p className="font-semibold text-xs text-center">{label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-700 p-3 space-y-1">
              <p className="text-xs font-semibold text-green-700 dark:text-green-400">✅ Pros</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Naturally coherent, self-contained chunks</li>
                <li>• Better embedding quality</li>
                <li>• Easy to trace back to source sections</li>
              </ul>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-700 p-3 space-y-1">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400">❌ Cons</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Requires document parsing (Markdown, HTML…)</li>
                <li>• Variable chunk sizes can exceed context limits</li>
                <li>• Poorly structured docs produce poor chunks</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Best for: Markdown documentation, HTML pages, PDFs with clear headings, code repositories.
          </p>
        </div>
      </section>

      {/* Strategy 4 — Semantic Chunking */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-indigo-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">6</span>
          <h2 className="text-xl font-bold">Strategy 4 — Semantic Chunking</h2>
        </div>
        <div className="bg-indigo-50/60 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Use embedding similarity to detect topic shifts. Sentences are embedded and grouped together as long as cosine similarity stays above a threshold. When the topic changes, a new chunk begins.
          </p>

          {/* Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            {[
              { step: "1", label: "Sentence Split", desc: "Split doc into sentences" },
              { step: "2", label: "Embed Each", desc: "Get vector per sentence" },
              { step: "3", label: "Diff Similarity", desc: "Compare consecutive pairs" },
              { step: "4", label: "Split on Drop", desc: "New chunk when similarity drops" },
            ].map(({ step, label, desc }) => (
              <div key={step} className="bg-background rounded-xl border border-indigo-200 dark:border-indigo-700 p-3 space-y-1 text-center">
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Step {step}</p>
                <p className="font-bold text-xs">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-background border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 font-mono text-xs text-muted-foreground">
            <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-2"># LangChain SemanticChunker</p>
            <p>from langchain_experimental.text_splitter import SemanticChunker</p>
            <p>from langchain_openai import OpenAIEmbeddings</p>
            <p className="mt-2">chunker = SemanticChunker(</p>
            <p className="pl-4">OpenAIEmbeddings(),</p>
            <p className="pl-4">breakpoint_threshold_type="percentile"</p>
            <p>)</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-700 p-3 space-y-1">
              <p className="text-xs font-semibold text-green-700 dark:text-green-400">✅ Pros</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Chunks match actual topic boundaries</li>
                <li>• Best retrieval precision of all strategies</li>
                <li>• Adapts to any document structure</li>
              </ul>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-700 p-3 space-y-1">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400">❌ Cons</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Slower — requires embedding every sentence</li>
                <li>• Higher ingestion cost</li>
                <li>• Threshold tuning required per domain</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic">
            Best for: long-form research papers, mixed-topic documents, high-accuracy Q&A systems.
          </p>
        </div>
      </section>

      {/* Metadata Preservation */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">7</span>
          <h2 className="text-xl font-bold">Metadata Preservation</h2>
        </div>
        <div className="bg-orange-50/60 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl p-6 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every chunk should carry metadata so the LLM and your application can cite sources, filter results, and understand context.
          </p>
          <div className="bg-background border border-orange-200 dark:border-orange-700 rounded-xl p-4 font-mono text-xs">
            <p className="text-orange-600 dark:text-orange-400 font-semibold mb-2"># Chunk object with metadata</p>
            <p><span className="text-muted-foreground">{"{"}</span></p>
            <p className="pl-4"><span className="text-green-600 dark:text-green-400">"text"</span>: <span className="text-amber-600">"...chunk content..."</span>,</p>
            <p className="pl-4"><span className="text-green-600 dark:text-green-400">"metadata"</span>: <span className="text-muted-foreground">{"{"}</span></p>
            <p className="pl-8"><span className="text-green-600 dark:text-green-400">"source"</span>: <span className="text-amber-600">"policy-v2.pdf"</span>,</p>
            <p className="pl-8"><span className="text-green-600 dark:text-green-400">"page"</span>: <span className="text-blue-600">4</span>,</p>
            <p className="pl-8"><span className="text-green-600 dark:text-green-400">"section"</span>: <span className="text-amber-600">"Data Retention"</span>,</p>
            <p className="pl-8"><span className="text-green-600 dark:text-green-400">"chunk_index"</span>: <span className="text-blue-600">12</span>,</p>
            <p className="pl-8"><span className="text-green-600 dark:text-green-400">"created_at"</span>: <span className="text-amber-600">"2024-01-15"</span></p>
            <p className="pl-4"><span className="text-muted-foreground">{"}"}</span></p>
            <p><span className="text-muted-foreground">{"}"}</span></p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: "📎", label: "Source Citation", desc: "Link every answer back to its origin document and page" },
              { icon: "🔍", label: "Pre-filtering", desc: "Filter by metadata before semantic search (e.g. only search policy docs)" },
              { icon: "🗓️", label: "Freshness", desc: "Use timestamps to deprioritize or exclude stale chunks" },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="bg-background rounded-xl border border-orange-200 dark:border-orange-700 p-3 space-y-1 text-center">
                <p className="text-xl">{icon}</p>
                <p className="font-semibold text-xs">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategy Comparison */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-slate-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">8</span>
          <h2 className="text-xl font-bold">Strategy Comparison</h2>
        </div>
        <div className="overflow-x-auto rounded-2xl border-2 border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/60">
                <th className="text-left p-3 font-semibold">Strategy</th>
                <th className="text-left p-3 font-semibold">Complexity</th>
                <th className="text-left p-3 font-semibold">Retrieval Quality</th>
                <th className="text-left p-3 font-semibold">Ingestion Cost</th>
                <th className="text-left p-3 font-semibold">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { name: "Fixed-Size", complexity: "🟢 Low", quality: "🔴 Low", cost: "🟢 Low", use: "Uniform text, logs" },
                { name: "Overlapping", complexity: "🟢 Low", quality: "🟡 Medium", cost: "🟡 Medium", use: "General-purpose RAG" },
                { name: "Structure-Aware", complexity: "🟡 Medium", quality: "🟡 Medium–High", cost: "🟢 Low", use: "Docs, Markdown, HTML" },
                { name: "Semantic", complexity: "🔴 High", quality: "🟢 High", cost: "🔴 High", use: "Research papers, mixed docs" },
              ].map((row) => (
                <tr key={row.name} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-semibold">{row.name}</td>
                  <td className="p-3 text-muted-foreground">{row.complexity}</td>
                  <td className="p-3 text-muted-foreground">{row.quality}</td>
                  <td className="p-3 text-muted-foreground">{row.cost}</td>
                  <td className="p-3 text-muted-foreground">{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Decision Guide */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-teal-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">9</span>
          <h2 className="text-xl font-bold">Choosing a Strategy</h2>
        </div>
        <div className="bg-teal-50/60 dark:bg-teal-950/20 border-2 border-teal-200 dark:border-teal-800 rounded-2xl p-6 space-y-3">
          {[
            { q: "Is the document structured (headings, paragraphs)?", a: "→ Structure-Aware first, add overlap if needed" },
            { q: "Is retrieval accuracy critical (legal, medical)?", a: "→ Semantic chunking — worth the extra cost" },
            { q: "Building a quick prototype or MVP?", a: "→ Overlapping fixed-size — fast and good enough" },
            { q: "Processing code repositories?", a: "→ Structure-Aware at function/class boundaries" },
            { q: "Dealing with very long documents (books, reports)?", a: "→ Hierarchical: coarse structure + fine semantic within each section" },
          ].map(({ q, a }) => (
            <div key={q} className="bg-background rounded-xl border border-teal-200 dark:border-teal-700 p-3">
              <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-1">❓ {q}</p>
              <p className="text-xs text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-green-50/50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/50 rounded-xl p-4">
        <p className="text-sm text-muted-foreground">
          <strong>💼 Interview Insight:</strong> Demonstrate that you understand chunking as a quality lever, not just a pre-processing step. Mention that the right strategy depends on document structure, retrieval SLA, and cost constraints — and that you'd evaluate retrieval quality (MRR, recall@K) to validate the choice.
        </p>
      </div>

    </div>
  )
}
