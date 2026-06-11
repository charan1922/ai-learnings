export default function GuardrailsAiPage() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/40 dark:to-cyan-950/40 border-2 border-teal-200 dark:border-teal-800/50 rounded-xl p-8">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🧰</span>
          <div>
            <h1 className="text-3xl font-bold text-teal-900 dark:text-teal-100 mb-3">
              Guardrails AI
            </h1>
            <p className="text-lg text-teal-800 dark:text-teal-200 leading-relaxed">
              An <strong>open-source Python framework</strong> that wraps an LLM call in a <em>Guard</em> made of
              composable <em>Validators</em>. It detects, quantifies, and <strong>corrects</strong> problems in
              LLM output — from PII and toxic language to broken JSON — and can re-ask the model when validation fails.
            </p>
          </div>
        </div>
        <div className="mt-5 bg-white dark:bg-teal-950/60 rounded-lg p-4 border border-teal-200 dark:border-teal-700/50">
          <p className="text-sm font-semibold text-teal-900 dark:text-teal-100">Source</p>
          <a
            href="https://github.com/guardrails-ai/guardrails"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-teal-700 dark:text-teal-300 underline mt-1 inline-block"
          >
            github.com/guardrails-ai/guardrails
          </a>
        </div>
      </div>

      {/* Core idea */}
      <div className="bg-teal-50/60 dark:bg-teal-950/20 border-l-4 border-teal-400 rounded-r-lg p-5">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Think of it as <strong>&quot;input validation for LLMs.&quot;</strong> You declare what a valid response looks
          like; Guardrails runs the validators against the model output and applies an <em>on-fail action</em> —
          <code className="bg-muted px-1 rounded">noop</code>, <code className="bg-muted px-1 rounded">fix</code>,
          <code className="bg-muted px-1 rounded">filter</code>, <code className="bg-muted px-1 rounded">refrain</code>,
          <code className="bg-muted px-1 rounded">exception</code>, or <code className="bg-muted px-1 rounded">reask</code>.
        </p>
      </div>

      {/* Building blocks */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Core Building Blocks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: "🛡️", title: "Guard", body: "The wrapper around your LLM call. It runs validators on input and/or output and orchestrates the on-fail action — including re-asking the model." },
            { icon: "✔️", title: "Validators", body: "Single-purpose checks (no PII, no profanity, valid JSON, on-topic, no competitor mentions). Each has its own on-fail behavior." },
            { icon: "🏪", title: "Guardrails Hub", body: "A registry of community + official pre-built validators you install with the CLI — so you don't reinvent common checks." },
            { icon: "📦", title: "Structured output", body: "Bind a Pydantic model (or the legacy RAIL XML spec) and Guardrails enforces the schema, retrying until the output parses." },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-border p-5 space-y-2">
              <div className="text-2xl">{c.icon}</div>
              <h3 className="font-semibold text-sm">{c.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Code example */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Example — install a validator, then guard a call</h2>
        <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-4 text-xs overflow-x-auto mb-3"><code>{`# 1. Pull a validator from the Hub
guardrails hub install hub://guardrails/toxic_language`}</code></pre>
        <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-4 text-xs overflow-x-auto"><code>{`from guardrails import Guard
from guardrails.hub import ToxicLanguage

guard = Guard().use(
    ToxicLanguage(threshold=0.5, on_fail="exception")
)

# Wrap any LLM call — validation runs on the output
result = guard(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Write a product review."}],
)
print(result.validated_output)   # guaranteed to pass the validators`}</code></pre>
      </div>

      {/* Common validators */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Representative Validators (from the Hub)</h2>
        <p className="text-sm text-muted-foreground mb-5">A few of the many checks you can compose into a Guard.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {[
            "Detect PII", "Toxic Language", "Competitor Check",
            "Restrict to Topic", "Valid JSON / Choice", "Profanity Free",
            "Secrets Present", "Gibberish Text", "Provenance / Grounding",
          ].map((c) => (
            <div key={c} className="bg-muted/40 rounded-lg px-3 py-2 text-xs text-muted-foreground">
              {c}
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200/50 rounded-xl p-5">
          <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">✅ Strengths</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>Goes beyond classify — can <strong>fix</strong>, filter, or re-ask</li>
            <li>Rich validator ecosystem via the Hub</li>
            <li>Strong structured-output / schema enforcement</li>
            <li>Model-agnostic; supports streaming validation</li>
          </ul>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 rounded-xl p-5">
          <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">⚠️ Limits</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>Python-centric; setup heavier than a single API call</li>
            <li>Re-asking adds latency and extra token cost</li>
            <li>Some validators call external models/services</li>
            <li>Focused on validation, not conversational flow control</li>
          </ul>
        </div>
      </div>

      {/* vs Moderation */}
      <div className="bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-800/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong>vs. OpenAI Moderation:</strong> the Moderation API answers <em>&quot;is this harmful?&quot;</em> with a
          fixed taxonomy. Guardrails AI answers <em>&quot;does this meet my policy?&quot;</em> for arbitrary, composable
          rules — and can repair the output instead of only flagging it.
        </p>
      </div>

      {/* Next */}
      <div className="bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-800/50 rounded-xl p-6">
        <p className="text-sm text-muted-foreground">
          <strong>🛠️ Coming next — hands-on project:</strong> build a Guard with a couple of Hub validators (PII + toxic
          language) and contrast its <em>fix / re-ask</em> behavior against a plain Moderation block. Last page covers
          NVIDIA <strong>NeMo Guardrails</strong> for conversation-level rails.
        </p>
      </div>
    </div>
  )
}
