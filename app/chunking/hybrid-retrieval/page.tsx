export default function HybridRetrievalPage() {
  return (
    <div className="space-y-12">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-teal-200 dark:border-teal-700">
          🔀 HYBRID RETRIEVAL
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Hybrid Retrieval: BM25 + Dense + RRF</h1>
        <p className="text-muted-foreground text-base">
          We had thousands of messy support records. Here is the problem, how we parsed the data into clean chunks, the retrieval approach that made it searchable, and how it helped.
        </p>
      </div>

      {/* ================= THE PROBLEM ================= */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-red-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">1</span>
          <h2 className="text-xl font-bold">The Problem</h2>
        </div>
        <div className="bg-red-50/60 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 space-y-4">
          <p className="text-base leading-relaxed">
            <strong>The starting point:</strong> a support knowledge base built from years of history — roughly
            <strong> 2,000 past tickets</strong>, plus <strong>procedure documents</strong> and <strong>Excel spreadsheets</strong>.
            When someone asks a question, we want an LLM to answer using <em>that</em> knowledge — not made-up information.
          </p>
          <div className="bg-background border border-red-200 dark:border-red-700 rounded-xl p-4">
            <p className="text-sm font-semibold mb-1">An LLM can&apos;t read all 2,000 records at once.</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              It has a limited context window. So for each question we must <strong>find only the handful of relevant pieces</strong> and
              hand those to the model. That raises two hard questions a newcomer should understand up front:
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-background rounded-xl border border-red-200 dark:border-red-700 p-4 space-y-1">
              <p className="font-semibold text-sm text-red-700 dark:text-red-300">① How do we parse the data?</p>
              <p className="text-xs text-muted-foreground">
                Tickets are free text, procedures are structured documents, and spreadsheets are tables. You can&apos;t split all three
                the same way — a table cut in half is meaningless. The raw files must become clean, self-contained <strong>chunks</strong> first.
              </p>
            </div>
            <div className="bg-background rounded-xl border border-red-200 dark:border-red-700 p-4 space-y-1">
              <p className="font-semibold text-sm text-red-700 dark:text-red-300">② How do we search the chunks?</p>
              <p className="text-xs text-muted-foreground">
                The content mixes <strong>exact identifiers</strong> (error codes, part numbers, IDs) with <strong>plain English</strong>.
                As we&apos;ll see, keyword search and semantic search each handle only one of those — never both.
              </p>
            </div>
          </div>
          <div className="bg-red-100 dark:bg-red-900/40 rounded-xl p-3">
            <p className="text-xs text-red-800 dark:text-red-200 leading-relaxed">
              <strong>Why both matter at once:</strong> a ticket may log an exact code like <code className="bg-white/60 dark:bg-black/30 px-1 rounded">ERR-4021</code>.
              Months later a different person asks, in plain words, <em>&quot;the label printer won&apos;t start.&quot;</em> Same underlying issue —
              but <strong>zero shared keywords</strong> with the original ticket. We need to catch both phrasings.
            </p>
          </div>
        </div>
      </section>

      {/* ================= PARSING THE DATA ================= */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">2</span>
          <h2 className="text-xl font-bold">Step 1 — Parsing the Data into Chunks</h2>
        </div>
        <div className="bg-orange-50/60 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl p-6 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Before any search can work, every source has to be turned into clean <strong>chunks</strong> (small, self-contained pieces of text).
            The trick: <strong>each format is parsed differently</strong>, because what makes a chunk &quot;complete&quot; depends on the source.
          </p>

          {/* classify */}
          <div className="bg-background border border-orange-200 dark:border-orange-700 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold">First, classify each source</p>
            <p className="text-xs text-muted-foreground">Decide what kind of file it is, so we can pick the right chunking rule:</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {["📄 Procedure doc", "📊 Spreadsheet", "🎫 Ticket / incident", "📚 Reference"].map((t) => (
                <span key={t} className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full border border-orange-200 dark:border-orange-700">{t}</span>
              ))}
            </div>
          </div>

          {/* per-type rules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-background rounded-xl border border-orange-200 dark:border-orange-700 p-4 space-y-1">
              <p className="font-semibold text-sm">🎫 Short tickets &amp; tiny docs</p>
              <p className="text-xs text-muted-foreground">Keep as <strong>one chunk</strong>. They&apos;re already small and self-contained — splitting would only break the meaning.</p>
            </div>
            <div className="bg-background rounded-xl border border-orange-200 dark:border-orange-700 p-4 space-y-1">
              <p className="font-semibold text-sm">📊 Spreadsheets</p>
              <p className="text-xs text-muted-foreground">Split into <strong>row-batches</strong>, and <strong>repeat the header row in every chunk</strong> so each chunk still explains its own columns.</p>
            </div>
            <div className="bg-background rounded-xl border border-orange-200 dark:border-orange-700 p-4 space-y-1">
              <p className="font-semibold text-sm">📄 Long documents</p>
              <p className="text-xs text-muted-foreground">Split on <strong>structure</strong> (headings/sections); if a section is still too big, fall back to splitting by sentences.</p>
            </div>
          </div>

          {/* spreadsheet illustration */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Why repeat the header? A row batch without its header is unreadable:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-3 text-xs overflow-x-auto"><code>{`❌ chunk without header
"4021, label, jammed, replace roller"
→ what do these columns mean?`}</code></pre>
              <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-3 text-xs overflow-x-auto"><code>{`✅ chunk with header repeated
"code, device, issue, fix
 4021, label, jammed, replace roller"
→ self-explanatory ✅`}</code></pre>
            </div>
          </div>

          {/* idempotent */}
          <div className="bg-background border border-orange-200 dark:border-orange-700 rounded-xl p-4 space-y-1">
            <p className="text-sm font-semibold">Then, hash each chunk → skip unchanged ones</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We compute a fast hash of every chunk&apos;s text. On a re-run, chunks whose hash hasn&apos;t changed are <strong>skipped</strong> —
              so re-ingesting is cheap and <strong>idempotent</strong> (running it twice doesn&apos;t duplicate or re-pay for anything).
            </p>
          </div>

          <div className="bg-orange-100 dark:bg-orange-900/40 rounded-xl p-3 text-center">
            <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
              Clean chunks in → good retrieval out. Garbage chunks in → garbage answers, no matter how good the search is.
            </p>
          </div>
        </div>
      </section>

      {/* ================= MY APPROACH ================= */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-teal-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">3</span>
          <h2 className="text-xl font-bold">Step 2 — The Retrieval Approach</h2>
        </div>
        <div className="bg-teal-50/60 dark:bg-teal-950/20 border-2 border-teal-200 dark:border-teal-800 rounded-2xl p-6 space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            With clean chunks ready, the fix for challenge ② is <strong>hybrid retrieval</strong>: run <strong>both</strong> search methods,
            store both kinds of vector for every chunk, then <strong>fuse</strong> the two ranked lists. Plus one extra trick so short chunks
            stay findable. Four moving parts:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2">
            {[
              { n: "A", label: "Keyword (BM25)", desc: "Sparse vector for exact matches" },
              { n: "B", label: "Dense (semantic)", desc: "Embedding vector for meaning" },
              { n: "C", label: "RRF fusion", desc: "Merge both ranked lists" },
              { n: "D", label: "Contextual embedding", desc: "Situate each chunk in its doc" },
            ].map(({ n, label, desc }) => (
              <div key={n} className="bg-background rounded-xl border border-teal-200 dark:border-teal-700 p-3 text-center space-y-1">
                <p className="text-xs font-bold text-teal-600 dark:text-teal-400">Part {n}</p>
                <p className="font-semibold text-xs">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* A — BM25 */}
        <div className="bg-blue-50/60 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 space-y-3">
          <h3 className="font-bold text-blue-700 dark:text-blue-300">Part A — Keyword Search (BM25)</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>BM25</strong> (Best Match 25) looks for the <strong>exact word</strong>. Contains it → scores high. Doesn&apos;t → scores zero.
          </p>
          <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-3 text-xs overflow-x-auto"><code>{`Query: "ERR-4021 startup failure"

chunk A → "ERR-4021" x2 → 8.4  ✅ high
chunk B → "ERR-4021" x1 → 5.1  ✅ medium
chunk C → about startup  → 0.0 ❌ miss`}</code></pre>
          <p className="text-xs text-muted-foreground">
            <strong>Wins on:</strong> exact codes, IDs, names. <strong>Loses on:</strong> meaning — a reworded question with no overlapping words returns nothing.
          </p>
        </div>

        {/* B — Dense */}
        <div className="bg-indigo-50/60 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 space-y-3">
          <h3 className="font-bold text-indigo-700 dark:text-indigo-300">Part B — Dense Vectors (Semantic Search)</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Each text becomes ~1536 numbers (a <strong>vector</strong>) via an embedding model. Similar meaning → similar numbers → &quot;close&quot; in space.
          </p>
          <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-3 text-xs overflow-x-auto"><code>{`"the label printer won't start"
 → [0.12, -0.87, 0.43, ...]

"barcode printer not powering on"
 → [0.14, -0.83, 0.41, ...]  ← close ✅  (no shared words!)

"ERR-4021"
 → [0.72, 0.31, -0.22, ...]  ← far ❌  (rare code = noise)`}</code></pre>
          <p className="text-xs text-muted-foreground">
            <strong>Wins on:</strong> paraphrases and synonyms. <strong>Loses on:</strong> rare exact codes the model never saw in training.
          </p>
        </div>

        {/* Store both */}
        <div className="bg-purple-50/60 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-6 space-y-3">
          <h3 className="font-bold text-purple-700 dark:text-purple-300">Store BOTH vectors per chunk</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            In the vector database, every chunk is one record carrying <strong>two vectors side by side</strong> — one dense, one sparse:
          </p>
          <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-4 text-xs overflow-x-auto"><code>{`Point (one chunk):
{
  id: "chunk-2",
  vectors: {
    "text-dense":  [0.12, -0.87, 0.43, ...]   ← semantic (embedding model)
    "text-sparse": {42: 1.7, 891: 0.9, ...}   ← keyword (BM25)
  },
  payload: { section_path: "...", content_hash: "..." }
}`}</code></pre>
          <div className="bg-background border border-purple-200 dark:border-purple-700 rounded-xl p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              The <strong>sparse</strong> vector isn&apos;t 1536 numbers — it&apos;s a dictionary: <em>keys = word IDs</em>, <em>values = word importance</em>.
              Most vocabulary words aren&apos;t in the chunk, so their value is 0 and we don&apos;t store them. That&apos;s why it&apos;s called &quot;sparse&quot;.
            </p>
          </div>
        </div>

        {/* fastembed */}
        <div className="bg-cyan-50/60 dark:bg-cyan-950/20 border-2 border-cyan-200 dark:border-cyan-800 rounded-2xl p-6 space-y-3">
          <h3 className="font-bold text-cyan-700 dark:text-cyan-300">Keeping it cheap — local BM25</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-background border border-cyan-200 dark:border-cyan-700 rounded-xl p-3">
              <p className="text-xs font-semibold mb-1">💸 Dense vector</p>
              <p className="text-xs text-muted-foreground">An embedding API call — costs money, runs in the cloud.</p>
            </div>
            <div className="bg-background border border-cyan-200 dark:border-cyan-700 rounded-xl p-3">
              <p className="text-xs font-semibold mb-1">🆓 Sparse vector (BM25)</p>
              <p className="text-xs text-muted-foreground">A local encoder (<code className="bg-muted px-1 rounded">fastembed</code>) runs on CPU — free, instant, no API key.</p>
            </div>
          </div>
          <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-3 text-xs overflow-x-auto"><code>{`VectorStore(
    enable_hybrid=True,
    sparse_model="bm25"   # runs locally on CPU, free
)`}</code></pre>
        </div>

        {/* C — RRF */}
        <div className="bg-amber-50/60 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6 space-y-3">
          <h3 className="font-bold text-amber-700 dark:text-amber-300">Part C — RRF (Reciprocal Rank Fusion)</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Each search returns its own ranked list. RRF merges them with one rule: <strong>a chunk ranking high in BOTH lists is probably the best answer.</strong>
            The formula is <code className="bg-muted px-1 rounded">1 / (rank + 60)</code>, summed across the lists.
          </p>
          <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-4 text-xs overflow-x-auto"><code>{`Query: "how to add a new print queue"

BM25 results:          Dense results:
 1. printer-setup       1. printer-setup
 2. general-info        2. printer-reference
 3. printer-reference   3. laser-printer

RRF score = sum of 1/(rank+60):
 printer-setup:     1/61 + 1/61 = 0.0328  ← #1 in BOTH → wins
 printer-reference: 1/63 + 1/62 = 0.0320  ← second
 general-info:      1/62 + 0    = 0.0161  ← only in BM25 → third`}</code></pre>
          <p className="text-xs text-muted-foreground italic">
            Most frameworks apply RRF automatically once you enable &quot;hybrid&quot; query mode — you don&apos;t write the math yourself.
          </p>
        </div>

        {/* D — Contextual embedding */}
        <div className="bg-green-50/60 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-6 space-y-3">
          <h3 className="font-bold text-green-700 dark:text-green-300">Part D — Contextual Embedding</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A bare chunk like <em>&quot;3. Select the queue from the dropdown and click Save.&quot;</em> has no context — its vector looks
            identical to every other &quot;select from dropdown&quot; step, so it gets retrieved for the wrong questions.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Fix:</strong> before embedding, prepend a one-sentence summary that situates the chunk inside its document.
          </p>
          <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-4 text-xs overflow-x-auto"><code>{`# The whole document goes in the system prompt (same for every
# chunk of that doc) → the prompt cache reuses it → pay once per doc
system_prompt = f"""
You are summarizing chunks of a single document.
<document>
{full_document_text}
</document>
"""

# Per chunk, the model returns one situating sentence, prepended before embedding:
chunk.text = f"{situating_sentence}\\n\\n{original_chunk_text}"`}</code></pre>
          <div className="bg-background border border-green-200 dark:border-green-700 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">
              Now the chunk&apos;s embedding includes its document identity, so it matches the right questions. Putting the full document
              in the (cached) system prompt keeps this step cheap — you pay for the big context once per document, not once per chunk.
            </p>
          </div>
        </div>
      </section>

      {/* ================= HOW IT HELPED ================= */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">4</span>
          <h2 className="text-xl font-bold">How It Helped</h2>
        </div>
        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: "🎯", title: "Both query types now work", body: "Exact-code lookups AND paraphrased questions return the right chunks — neither half is sacrificed." },
              { icon: "🧩", title: "Short chunks retrievable", body: "Contextual prefixes stop generic steps from being pulled for unrelated questions." },
              { icon: "💰", title: "Low extra cost", body: "BM25 runs free on local CPU; the context step reuses a cached system prompt per document." },
              { icon: "🔭", title: "Traceable & cheap re-runs", body: "Every chunk carries metadata to cite its source, and hashing skips unchanged chunks on re-ingest." },
            ].map(({ icon, title, body }) => (
              <div key={title} className="bg-background rounded-xl border border-emerald-200 dark:border-emerald-700 p-4 flex gap-3">
                <span className="text-2xl flex-shrink-0">{icon}</span>
                <div>
                  <p className="font-semibold text-sm mb-0.5">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* before / after */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-700 rounded-xl p-3">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">❌ Before (single method)</p>
              <p className="text-xs text-muted-foreground">&quot;ERR-4021&quot; → semantic search returns vaguely-related prose, misses the exact ticket.</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700 rounded-xl p-3">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">✅ After (hybrid + RRF)</p>
              <p className="text-xs text-muted-foreground">BM25 pins the exact code, dense covers the wording, RRF puts the correct ticket at #1.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The resulting flow */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-violet-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">5</span>
          <h2 className="text-xl font-bold">The Full Flow</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-violet-50/60 dark:bg-violet-950/20 border-2 border-violet-200 dark:border-violet-800 rounded-2xl p-5 space-y-2">
            <h3 className="font-bold text-violet-700 dark:text-violet-300 text-sm">📥 Ingest (parse once per source)</h3>
            <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-3 text-xs overflow-x-auto"><code>{`tickets + docs + spreadsheets
   ↓ classify by type
   ↓ chunk per type (rows / headings / whole)
   ↓ add situating sentence (contextual)
   ↓ hash → skip if unchanged (idempotent)
   ↓ build index
        ├ embedding model → dense vector
        └ local BM25      → sparse vector
   ↓ store both vectors per chunk`}</code></pre>
          </div>
          <div className="bg-blue-50/60 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-5 space-y-2">
            <h3 className="font-bold text-blue-700 dark:text-blue-300 text-sm">🔎 Query (per question)</h3>
            <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-3 text-xs overflow-x-auto"><code>{`user question
   ↓ embed → dense query vector
   ↓ tokenize → sparse BM25 vector
   ↓ hybrid search
        ├ semantic → top 20
        └ keyword  → top 20
   ↓ RRF merge → re-ranked top 5
   ↓ deduplicate per source
   ↓ LLM synthesizes the answer`}</code></pre>
          </div>
        </div>
      </section>

      {/* Libraries */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="h-8 w-8 rounded-full bg-slate-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">6</span>
          <h2 className="text-xl font-bold">Building Blocks</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            ["Orchestration framework", "Chunking, embedding, retrieval, synthesis (e.g. LlamaIndex)"],
            ["Vector database", "Stores dense + sparse vectors, runs hybrid search (e.g. Qdrant)"],
            ["Local BM25 encoder", "Sparse keyword vectors on CPU — no API, no cost (e.g. fastembed)"],
            ["Embedding + LLM", "Dense embeddings for retrieval + a model for answer synthesis"],
            ["Content hashing", "Fast hash per chunk → idempotent, skip-if-unchanged re-ingest"],
            ["RRF (built-in)", "Reciprocal Rank Fusion to merge the two ranked lists"],
          ].map(([lib, desc]) => (
            <div key={lib} className="bg-background border border-border rounded-xl p-3">
              <p className="text-xs font-semibold">{lib}</p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-800/50 rounded-xl p-4">
        <p className="text-sm text-muted-foreground">
          <strong>💼 Interview Insight:</strong> Tell it as a story — &quot;we had ~2,000 tickets plus docs and spreadsheets; first we parsed
          each format into clean chunks, then made them searchable.&quot; The retrieval fix is <strong>BM25 catches identifiers, dense catches
          paraphrases, RRF fuses both lists</strong>, and contextual embeddings give short chunks their document identity.
        </p>
      </div>

    </div>
  )
}
