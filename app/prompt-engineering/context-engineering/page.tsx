export default function ContextEngineeringPage() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40 border-2 border-violet-200 dark:border-violet-800/50 rounded-xl p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-violet-900 dark:text-violet-100 mb-3">
              Effective Context Engineering for AI Agents
            </h1>
            <p className="text-lg text-violet-800 dark:text-violet-200 leading-relaxed">
              Context engineering is the <strong>natural evolution of prompt engineering</strong> — shifting focus from
              crafting individual prompts to thoughtfully curating what information enters the model&apos;s limited
              attention budget at each step.
            </p>
          </div>
        </div>
        <div className="mt-4 bg-white dark:bg-violet-950/60 rounded-lg p-4 border border-violet-200 dark:border-violet-700/50">
          <p className="text-sm font-semibold text-violet-900 dark:text-violet-100">Source</p>
          <p className="text-sm text-violet-800 dark:text-violet-200 mt-1">
            Anthropic Engineering Blog — Sep 29, 2025 · Prithvi Rajasekaran, Ethan Dixon, Carly Ryan, Jeremy Hadfield
          </p>
        </div>
      </div>

      {/* Core definition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 rounded-xl p-5">
          <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">✍️ Prompt Engineering</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Methods for writing and organising LLM instructions — focused on crafting a single, well-worded prompt.
          </p>
        </div>
        <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-800/40 rounded-xl p-5">
          <h3 className="font-semibold text-violet-700 dark:text-violet-300 mb-2">🧠 Context Engineering</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Strategies for curating and maintaining the <strong>optimal set of tokens</strong> — system instructions,
            tools, external data, and message history across multiple inference turns.
          </p>
        </div>
      </div>

      {/* Why it matters — Context Rot */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Why Context Engineering Matters</h2>
        <div className="space-y-4">

          <div className="border-l-4 border-red-500 pl-4 space-y-2">
            <h3 className="font-semibold text-red-600 dark:text-red-400">⚠️ Context Rot</h3>
            <p className="text-sm text-muted-foreground">
              As context window tokens increase, model accuracy in recalling information decreases. Think of it like
              human working memory — the more you load in, the harder it is to focus on what matters.
            </p>
          </div>

          <div className="border-l-4 border-orange-500 pl-4 space-y-2">
            <h3 className="font-semibold text-orange-600 dark:text-orange-400">⚡ Transformer Architecture Costs</h3>
            <p className="text-sm text-muted-foreground">
              LLMs compute <strong>n² pairwise relationships for n tokens</strong>. Longer contexts stretch this
              relationship-capturing ability, and models are trained on shorter sequences — so performance degrades
              at scale even before hitting hard limits.
            </p>
          </div>

          <div className="border-l-4 border-amber-500 pl-4 space-y-2">
            <h3 className="font-semibold text-amber-600 dark:text-amber-400">📉 Performance Gradient, Not a Cliff</h3>
            <p className="text-sm text-muted-foreground">
              There&apos;s no sudden drop-off — models show <em>gradually degraded precision</em> for information
              retrieval and long-range reasoning as context grows. The goal is to stay well below that gradient.
            </p>
          </div>
        </div>
      </div>

      {/* Anatomy of Effective Context */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Anatomy of Effective Context</h2>
        <p className="text-sm text-muted-foreground mb-5">
          The guiding principle across all components: keep context <strong>informative, yet tight</strong>.
        </p>

        <div className="space-y-5">

          {/* System Prompts */}
          <div className="rounded-xl border border-border p-5 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-2xl">💬</span> System Prompts — The Goldilocks Zone
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200/50 rounded-lg p-4">
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">❌ Too Specific</p>
                <p className="text-xs text-muted-foreground">Hardcoded complex logic creates fragility and a heavy maintenance burden.</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200/50 rounded-lg p-4">
                <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">✅ Just Right</p>
                <p className="text-xs text-muted-foreground">Specific enough to guide behaviour, flexible enough to provide strong heuristics.</p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200/50 rounded-lg p-4">
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">❌ Too Vague</p>
                <p className="text-xs text-muted-foreground">High-level guidance without concrete signals — the model guesses what you want.</p>
              </div>
            </div>
            <div className="bg-muted/40 rounded-lg p-4">
              <p className="text-xs font-semibold mb-2">Best Practices</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Organise into distinct sections using XML tags or Markdown headers</li>
                <li>• Strive for <em>minimal information</em> sufficient to outline expected behaviour</li>
                <li>• Start minimal on capable models — add instructions based on failure analysis</li>
              </ul>
            </div>
          </div>

          {/* Tools */}
          <div className="rounded-xl border border-border p-5 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-2xl">🔧</span> Tools — Efficiency Over Coverage
            </h3>
            <p className="text-sm text-muted-foreground">
              Tools let agents interact with environments and retrieve additional context at runtime.
              The common failure mode is a <strong>bloated tool set</strong> covering excessive functionality.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: '📦', title: 'Token-efficient returns', body: 'Tools should return the minimum data needed — not entire objects or documents.' },
                { icon: '🎯', title: 'Minimal overlap', body: 'Prevent ambiguous tool selection by keeping each tool\'s purpose distinct.' },
                { icon: '📝', title: 'Clear parameters', body: 'Descriptive input names and types support the model\'s strengths at tool selection.' },
                { icon: '🏗️', title: 'Self-contained & robust', body: 'Tools should work like well-designed code — predictable, composable, side-effect aware.' },
              ].map(item => (
                <div key={item.title} className="bg-muted/40 rounded-lg p-3 flex gap-3">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-xs font-semibold mb-0.5">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Few-Shot Examples */}
          <div className="rounded-xl border border-border p-5 space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-2xl">📚</span> Few-Shot Examples — Quality Over Quantity
            </h3>
            <p className="text-sm text-muted-foreground">
              Diverse, canonical examples effectively portray expected agent behaviour. Don&apos;t
              stuff a laundry list of edge cases — curate <strong>representative examples</strong> that
              illustrate behaviour at the right scope.
            </p>
          </div>
        </div>
      </div>

      {/* Context Retrieval & Agentic Search */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Context Retrieval & Agentic Search</h2>

        <div className="space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/50 rounded-xl p-5">
            <h3 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3">
              From Pre-computed to &quot;Just-in-Time&quot;
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Traditional Approach</p>
                <p className="text-sm text-muted-foreground">Embedding-based pre-inference retrieval — load relevant chunks before the agent starts.</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Modern Agentic Approach</p>
                <p className="text-sm text-muted-foreground">
                  Maintain lightweight identifiers (file paths, queries, links) and dynamically load data
                  via tools at runtime — fetching only what is needed, when it&apos;s needed.
                </p>
              </div>
            </div>
            <div className="mt-3 bg-white dark:bg-indigo-950/60 rounded-lg p-3 border border-indigo-200/50">
              <p className="text-xs font-semibold mb-1">Real example: Claude Code</p>
              <p className="text-xs text-muted-foreground">
                Performs complex analysis over large codebases using targeted queries and Unix commands
                (<code className="bg-muted px-1 rounded">head</code>, <code className="bg-muted px-1 rounded">tail</code>)
                — without loading entire files into context.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '🗂️', title: 'Metadata as Navigation', body: 'File paths, naming conventions, folder hierarchies, and timestamps help agents understand information usage — mirroring human cognition.' },
              { icon: '🔭', title: 'Progressive Disclosure', body: 'Agents incrementally discover relevant context through exploration. File sizes suggest complexity; timestamps proxy relevance.' },
              { icon: '⚖️', title: 'Trade-off', body: 'Runtime exploration is slower than pre-computed retrieval but scales far better. Requires opinionated tooling and clear agent heuristics.' },
            ].map(item => (
              <div key={item.title} className="rounded-xl border border-border p-4 space-y-2">
                <div className="text-2xl">{item.icon}</div>
                <h4 className="font-semibold text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Long-Horizon Techniques */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Context Engineering for Long-Horizon Tasks</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Tasks spanning tens of minutes to hours (large codebase migrations, research projects) require
          specialised techniques to stay within context limits without losing important state.
        </p>

        <div className="space-y-5">

          {/* Compaction */}
          <div className="border-l-4 border-violet-500 pl-5 space-y-3">
            <h3 className="text-lg font-semibold text-violet-700 dark:text-violet-300">1️⃣ Compaction</h3>
            <p className="text-sm text-muted-foreground">
              When the context window approaches its limit, summarise the conversation and reinitialise
              with a compressed version. Claude Code implements this by passing the full message history
              to the model, which produces a structured summary.
            </p>
            <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200/50 rounded-lg p-4">
              <p className="text-xs font-semibold mb-2">What Claude Code preserves vs discards</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">✅ Preserved</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Architectural decisions</li>
                    <li>• Unresolved bugs</li>
                    <li>• Implementation details</li>
                    <li>• 5 most-recently accessed files</li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">🗑️ Discarded</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Redundant tool outputs</li>
                    <li>• Intermediate reasoning steps</li>
                    <li>• Superseded decisions</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-muted/40 rounded-lg p-3">
              <p className="text-xs font-semibold mb-1">Tuning guidance</p>
              <p className="text-xs text-muted-foreground">
                Start by maximising recall (capture everything). Then iterate to improve precision —
                eliminating superfluous content. Tool calls and results are safe, lightweight candidates for early removal.
              </p>
            </div>
          </div>

          {/* Structured Note-Taking */}
          <div className="border-l-4 border-teal-500 pl-5 space-y-3">
            <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-300">2️⃣ Structured Note-Taking (Agentic Memory)</h3>
            <p className="text-sm text-muted-foreground">
              Agents regularly write externally-persisted notes and retrieve them later.
              This provides <strong>persistent memory with minimal overhead</strong> — the agent offloads
              state to storage rather than keeping everything in the context window.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: 'Claude Code', example: 'Creates to-do lists tracking task progress across long sessions' },
                { label: 'Custom Agents', example: 'Maintains a NOTES.md file updated at each milestone' },
                { label: 'Claude Plays Pokémon', example: 'Maintains precise tallies across thousands of steps: "For the last 1,234 steps I\'ve been training my Pokémon"' },
              ].map(item => (
                <div key={item.label} className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200/50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-1">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.example}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-Agent Architectures */}
          <div className="border-l-4 border-blue-500 pl-5 space-y-3">
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">3️⃣ Sub-Agent Architectures</h3>
            <p className="text-sm text-muted-foreground">
              Instead of one agent carrying all state, specialised sub-agents handle focused tasks
              with <strong>clean context windows</strong>. The main agent coordinates the high-level plan;
              sub-agents perform detailed technical work and return condensed summaries.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 rounded-lg p-4">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">Lead Agent</span>
                  <span className="text-muted-foreground">High-level plan · synthesises results from sub-agents</span>
                </div>
                <div className="ml-4 flex items-center gap-3 text-xs text-muted-foreground">↓ dispatches focused tasks</div>
                <div className="flex items-center gap-3">
                  <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">Sub-Agent</span>
                  <span className="text-muted-foreground">Isolated context · returns 1,000–2,000 token summary</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Clear separation of concerns: the detailed search context stays isolated within sub-agents.
                The lead agent never sees the noise.
              </p>
            </div>
          </div>

          {/* When to use which */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-muted/50 px-4 py-3">
              <h4 className="font-semibold text-sm">When to use which technique</h4>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-3 font-semibold text-xs">Technique</th>
                  <th className="text-left p-3 font-semibold text-xs">Best for</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Compaction', 'Extensive back-and-forth requiring conversational flow to be maintained'],
                  ['Note-taking', 'Iterative development with clear milestones — progress can be snapshotted'],
                  ['Multi-agent', 'Complex research and analysis that benefits from parallel exploration'],
                ].map(([tech, use], i) => (
                  <tr key={tech} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                    <td className="p-3 font-medium text-violet-700 dark:text-violet-400">{tech}</td>
                    <td className="p-3 text-muted-foreground">{use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Key Principles Summary */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Key Principles — At a Glance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: '🎯', title: 'Think in Context', body: 'Consider the holistic state available to the model at each step — not just the current message.' },
            { icon: '💡', title: 'Attention Budget', body: 'Treat context as a precious, finite resource. Every token competes for the model\'s attention.' },
            { icon: '📐', title: 'Minimal Sufficient', body: 'Identify the smallest set of high-signal tokens that maximise the likelihood of your desired outcome.' },
            { icon: '🔁', title: 'Failure-Driven Iteration', body: 'Start minimal. Analyse failures. Add instructions and context only when you have evidence they help.' },
            { icon: '🧭', title: 'Metadata over Data', body: 'Give agents lightweight identifiers to navigate, not full data dumps to memorise.' },
            { icon: '📈', title: 'Scale with Autonomy', body: 'As models improve, smarter systems need less prescriptive engineering — agent autonomy increases.' },
          ].map(item => (
            <div key={item.title} className="bg-muted/40 rounded-xl p-4 flex gap-4">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Closing quote */}
      <div className="bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/50 dark:border-violet-800/50 rounded-xl p-6">
        <blockquote className="text-base italic text-violet-900 dark:text-violet-100 leading-relaxed border-l-4 border-violet-400 pl-4">
          &quot;Rather than perfecting individual prompts, the focus shifts to thoughtfully curating what information
          enters the model&apos;s limited attention budget at each step. Treating context as a precious, finite resource
          will remain central to building reliable, effective agents even as capabilities scale.&quot;
        </blockquote>
        <p className="text-xs text-muted-foreground mt-3 pl-4">— Anthropic Engineering, 2025</p>
      </div>

      <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong>💼 For Interviews:</strong> Frame context engineering as moving from &quot;how do I write a good prompt?&quot;
          to &quot;how do I manage state across an agent&apos;s entire lifetime?&quot; — covering compaction, note-taking, and
          sub-agent isolation as production-grade solutions.
        </p>
      </div>
    </div>
  )
}
