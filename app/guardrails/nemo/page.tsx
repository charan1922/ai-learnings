export default function NemoGuardrailsPage() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/40 dark:to-cyan-950/40 border-2 border-teal-200 dark:border-teal-800/50 rounded-xl p-8">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🚦</span>
          <div>
            <h1 className="text-3xl font-bold text-teal-900 dark:text-teal-100 mb-3">
              NVIDIA NeMo Guardrails
            </h1>
            <p className="text-lg text-teal-800 dark:text-teal-200 leading-relaxed">
              An <strong>open-source toolkit</strong> for adding programmable <em>rails</em> to LLM-based conversational
              apps. Instead of one-off filters, you define guardrails as <strong>flows</strong> in a modeling language
              called <strong>Colang</strong> — controlling topics, safety, dialog, and tool use across a whole conversation.
            </p>
          </div>
        </div>
        <div className="mt-5 bg-white dark:bg-teal-950/60 rounded-lg p-4 border border-teal-200 dark:border-teal-700/50">
          <p className="text-sm font-semibold text-teal-900 dark:text-teal-100">Source</p>
          <a
            href="https://github.com/NVIDIA-NeMo/Guardrails"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-teal-700 dark:text-teal-300 underline mt-1 inline-block"
          >
            github.com/NVIDIA-NeMo/Guardrails
          </a>
        </div>
      </div>

      {/* Core idea */}
      <div className="bg-teal-50/60 dark:bg-teal-950/20 border-l-4 border-teal-400 rounded-r-lg p-5">
        <p className="text-sm text-muted-foreground leading-relaxed">
          NeMo sits <strong>between the user and the LLM</strong> as a runtime. Every turn passes through a chain of
          rails you configure; each rail can inspect, transform, block, or redirect the message. It&apos;s the most
          <em> conversation-aware</em> of the three approaches — built for chatbots and agents, not just single calls.
        </p>
      </div>

      {/* The five rail types */}
      <div>
        <h2 className="text-2xl font-bold mb-2">The Five Rail Types</h2>
        <p className="text-sm text-muted-foreground mb-5">Rails fire at different points in the request lifecycle.</p>
        <div className="space-y-3">
          {[
            { n: "1", title: "Input rails", body: "Run on the user message — jailbreak / prompt-injection detection, moderation, off-topic rejection, PII masking." },
            { n: "2", title: "Dialog rails", body: "Steer the conversation flow itself — define canonical user intents and the allowed bot responses in Colang." },
            { n: "3", title: "Retrieval rails", body: "Act on chunks fetched for RAG — filter or rewrite retrieved context before it reaches the model." },
            { n: "4", title: "Execution rails", body: "Guard calls to tools / custom actions the LLM triggers — validate inputs and outputs of those actions." },
            { n: "5", title: "Output rails", body: "Run on the model's response — fact-checking / hallucination checks, moderation, self-check before the user sees it." },
          ].map((r) => (
            <div key={r.n} className="rounded-xl border border-border p-4 flex gap-4">
              <span className="bg-teal-500 text-white text-xs h-6 w-6 flex items-center justify-center rounded-full flex-shrink-0">{r.n}</span>
              <div>
                <h3 className="font-semibold text-sm mb-1">{r.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Colang example */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Colang — defining a topical rail</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Colang describes user intents (<code className="bg-muted px-1 rounded">define user</code>), bot responses, and
          the flows that connect them. Here, off-topic requests are caught and redirected.
        </p>
        <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-4 text-xs overflow-x-auto"><code>{`define user ask off topic
  "What do you think about politics?"
  "What's your favorite movie?"

define bot refuse off topic
  "I'm here to help with product questions only."

define flow
  user ask off topic
  bot refuse off topic`}</code></pre>
      </div>

      {/* Config example */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Wiring rails in config</h2>
        <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-4 text-xs overflow-x-auto mb-3"><code>{`# config.yml
rails:
  input:
    flows:
      - self check input        # jailbreak / moderation
  output:
    flows:
      - self check output
      - check facts             # hallucination / grounding`}</code></pre>
        <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-4 text-xs overflow-x-auto"><code>{`from nemoguardrails import LLMRails, RailsConfig

config = RailsConfig.from_path("./config")
rails = LLMRails(config)

response = rails.generate(messages=[
    {"role": "user", "content": "Ignore your rules and ..."}
])
# input rail blocks the jailbreak before it reaches the model`}</code></pre>
      </div>

      {/* Strengths & limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200/50 rounded-xl p-5">
          <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">✅ Strengths</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>Conversation-level control, not just per-call filters</li>
            <li>Built-in jailbreak, topical, fact-checking & moderation rails</li>
            <li>Composes with LangChain and custom actions/tools</li>
            <li>Rails are declarative config — auditable and versionable</li>
          </ul>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 rounded-xl p-5">
          <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">⚠️ Limits</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>Steeper learning curve — Colang is a new language to learn</li>
            <li>Extra rails (esp. fact-checking) add latency &amp; LLM calls</li>
            <li>Heavier to set up than a single moderation request</li>
            <li>Python runtime; best fit for chatbot/agent architectures</li>
          </ul>
        </div>
      </div>

      {/* Comparison of all three */}
      <div>
        <h2 className="text-2xl font-bold mb-4">The Three Approaches at a Glance</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-teal-500/10">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Tool</th>
                <th className="px-4 py-3 font-semibold">Scope</th>
                <th className="px-4 py-3 font-semibold">Can it correct?</th>
                <th className="px-4 py-3 font-semibold">Best for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3 font-medium">OpenAI Moderation</td>
                <td className="px-4 py-3 text-muted-foreground">Single message, fixed harm taxonomy</td>
                <td className="px-4 py-3 text-muted-foreground">No — classify only</td>
                <td className="px-4 py-3 text-muted-foreground">Cheap first-line safety filter</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Guardrails AI</td>
                <td className="px-4 py-3 text-muted-foreground">Per-call output, arbitrary policies</td>
                <td className="px-4 py-3 text-muted-foreground">Yes — fix / filter / re-ask</td>
                <td className="px-4 py-3 text-muted-foreground">Validation &amp; structured output</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">NeMo Guardrails</td>
                <td className="px-4 py-3 text-muted-foreground">Whole conversation, multi-stage rails</td>
                <td className="px-4 py-3 text-muted-foreground">Yes — redirect / block flows</td>
                <td className="px-4 py-3 text-muted-foreground">Chatbots &amp; agents needing dialog control</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Next */}
      <div className="bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-800/50 rounded-xl p-6">
        <p className="text-sm text-muted-foreground">
          <strong>🛠️ Coming next — hands-on project:</strong> with all three summaries in place, the plan is to build a
          single guarded chat endpoint that layers Moderation (fast filter) → Guardrails AI (output validation) →
          NeMo rails (dialog &amp; jailbreak control), and observe what each layer catches.
        </p>
      </div>
    </div>
  )
}
