export default function OpenAIModerationPage() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/40 dark:to-cyan-950/40 border-2 border-teal-200 dark:border-teal-800/50 rounded-xl p-8">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🛡️</span>
          <div>
            <h1 className="text-3xl font-bold text-teal-900 dark:text-teal-100 mb-3">
              OpenAI Moderation API
            </h1>
            <p className="text-lg text-teal-800 dark:text-teal-200 leading-relaxed">
              A <strong>free, hosted classification endpoint</strong> that scores text and images against a set of
              harm categories (hate, harassment, self-harm, sexual, violence, illicit…). It is the simplest
              guardrail to bolt onto an LLM app — screen what goes <em>in</em> and what comes <em>out</em>.
            </p>
          </div>
        </div>
        <div className="mt-5 bg-white dark:bg-teal-950/60 rounded-lg p-4 border border-teal-200 dark:border-teal-700/50">
          <p className="text-sm font-semibold text-teal-900 dark:text-teal-100">Source</p>
          <a
            href="https://developers.openai.com/api/docs/guides/moderation"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-teal-700 dark:text-teal-300 underline mt-1 inline-block"
          >
            developers.openai.com/api/docs/guides/moderation
          </a>
        </div>
      </div>

      {/* Core idea */}
      <div className="bg-teal-50/60 dark:bg-teal-950/20 border-l-4 border-teal-400 rounded-r-lg p-5">
        <p className="text-sm text-muted-foreground leading-relaxed">
          The Moderation API is a <strong>classifier, not a generator</strong>. You send it content, it returns whether
          the content is <code className="bg-muted px-1 rounded">flagged</code>, a boolean per category, and a
          confidence <code className="bg-muted px-1 rounded">score</code> per category. It does not rewrite or block —
          <em> your application</em> decides what to do with the verdict. It&apos;s <strong>free to use</strong>, which
          makes it the default first line of defense.
        </p>
      </div>

      {/* Models */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Models</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border p-5 space-y-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <span className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full">Recommended</span>
              omni-moderation-latest
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Multimodal — accepts <strong>text and images</strong>, supports more categories (incl. illicit), and is
              the current default for new projects.
            </p>
          </div>
          <div className="rounded-xl border border-border p-5 space-y-2">
            <h3 className="font-semibold text-sm">text-moderation-latest / -stable</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The older text-only models. <code className="bg-muted px-1 rounded">stable</code> is pinned for
              predictability; <code className="bg-muted px-1 rounded">latest</code> tracks the newest text classifier.
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Harm Categories</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Each category returns an independent boolean <em>and</em> a 0–1 score. You can threshold on the score for
          stricter or looser policies than the default <code className="bg-muted px-1 rounded">flagged</code> value.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {[
            "hate", "hate/threatening",
            "harassment", "harassment/threatening",
            "self-harm", "self-harm/intent",
            "self-harm/instructions", "sexual",
            "sexual/minors", "violence",
            "violence/graphic", "illicit",
          ].map((c) => (
            <div key={c} className="bg-muted/40 rounded-lg px-3 py-2 font-mono text-xs text-muted-foreground">
              {c}
            </div>
          ))}
        </div>
      </div>

      {/* Code example */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Minimal Example</h2>
        <pre className="bg-zinc-900 text-zinc-100 rounded-lg p-4 text-xs overflow-x-auto"><code>{`import OpenAI from "openai";
const openai = new OpenAI();

const result = await openai.moderations.create({
  model: "omni-moderation-latest",
  input: "I want to hurt someone.",
});

const { flagged, categories, category_scores } = result.results[0];
if (flagged) {
  // block, redact, or route to human review
  console.log("Blocked categories:",
    Object.entries(categories).filter(([, v]) => v).map(([k]) => k));
}`}</code></pre>
      </div>

      {/* Where it fits */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Where It Fits in an LLM App</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "⬅️", title: "Input rail", body: "Moderate the user's prompt before it ever reaches the model — cheap way to reject abusive or harmful requests up front." },
            { icon: "➡️", title: "Output rail", body: "Moderate the model's completion before showing it to the user — catches cases where the model produced unsafe content." },
            { icon: "🧑‍⚖️", title: "Triage", body: "Use the per-category scores to route borderline content to human review instead of a hard block." },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-border p-5 space-y-2">
              <div className="text-2xl">{c.icon}</div>
              <h3 className="font-semibold text-sm">{c.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200/50 rounded-xl p-5">
          <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">✅ Strengths</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>Free and a single API call to integrate</li>
            <li>Multimodal (text + images) with omni</li>
            <li>Per-category scores enable custom thresholds</li>
            <li>Low latency — fine as a pre/post filter</li>
          </ul>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 rounded-xl p-5">
          <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">⚠️ Limits</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>Fixed taxonomy — only covers safety harms, not PII, hallucinations, or off-topic answers</li>
            <li>Classify-only — it won&apos;t rewrite or enforce structure</li>
            <li>Sends content to OpenAI; not for fully on-prem needs</li>
            <li>English-strongest; quality varies by language</li>
          </ul>
        </div>
      </div>

      {/* Next */}
      <div className="bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-800/50 rounded-xl p-6">
        <p className="text-sm text-muted-foreground">
          <strong>🛠️ Coming next — hands-on project:</strong> wire the Moderation API as input/output rails around a
          small chat endpoint, then compare it against the policy-driven validators in <strong>Guardrails AI</strong>
          and <strong>NeMo Guardrails</strong> on the next two pages.
        </p>
      </div>
    </div>
  )
}
