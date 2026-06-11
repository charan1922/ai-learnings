export default function DebuggingStepsPage() {
  const steps = [
    {
      n: 1,
      color: "amber",
      title: "Reproduce & Define the Failure",
      summary:
        "You can't fix what you can't reproduce. Pin down a single input that reliably fails, then write the expected output beside the actual output.",
      points: [
        "Capture the exact failing input — don't debug from a vague memory of “sometimes it's wrong.”",
        "State success criteria explicitly: what would a correct answer look like?",
        "Make runs deterministic while debugging — set temperature to 0 and freeze the model version, so output changes come from your edits, not randomness.",
      ],
      example: {
        bad: "“The summarizer is bad sometimes.”",
        good: "Input #4127 → expected a 3-bullet summary in JSON; got 6 bullets as prose. Repro at temperature 0 on gpt-4o-2024-08.",
      },
    },
    {
      n: 2,
      color: "orange",
      title: "Isolate the Cause (Ablate the Prompt)",
      summary:
        "Strip the prompt down to its minimal form, then add components back one at a time until the failure reappears. The piece that brings it back is your culprit.",
      points: [
        "Remove examples, context, and formatting rules — does the bare instruction still fail?",
        "Add each block back individually (instructions → context → examples → format).",
        "Ask the model to explain itself: “Which part of these instructions made you produce 6 bullets?” — it often points straight at the ambiguous line.",
      ],
      example: {
        bad: "Editing 5 parts of the prompt at once, then guessing what helped.",
        good: "Minimal prompt → works. Add the long context block → fails. The context is burying the format instruction.",
      },
    },
    {
      n: 3,
      color: "rose",
      title: "Diagnose the Prompt Anatomy",
      summary:
        "Most prompt bugs trace to one of five components. Match the failure type to the most likely culprit.",
      points: [
        "Instructions — ambiguous, contradictory, or missing constraints.",
        "Context — too little (model guesses) or too much (signal gets buried).",
        "Examples — wrong, off-distribution, or absent for a hard task.",
        "Output format — under-specified, so the model picks its own shape.",
        "Parameters — temperature/top-p too high for a task that needs determinism.",
      ],
      example: {
        bad: "Wrong format → blaming the model.",
        good: "Wrong format → the prompt never said “return valid JSON, no prose.” Fix the format spec, not the model.",
      },
    },
    {
      n: 4,
      color: "violet",
      title: "Refine — One Change at a Time",
      summary:
        "Make a single, targeted edit and re-test. Changing several things at once means you'll never know which one actually fixed it.",
      points: [
        "Reword the failing instruction in plain, unambiguous language — wording matters a lot.",
        "Add a constraint or a single targeted few-shot example covering the edge case.",
        "Adjust one parameter (e.g. lower temperature) — and only one.",
        "Re-run the same failing input to confirm the fix before moving on.",
      ],
      example: {
        bad: "“Summarize the text.”",
        good: "“Summarize the text as exactly 3 bullet points. Return only a JSON array of strings — no preamble, no prose.”",
      },
    },
    {
      n: 5,
      color: "emerald",
      title: "Evaluate & Monitor at Scale",
      summary:
        "Debugging is anecdotal; evaluation is statistical. A fix for one query can break five others — so re-run the whole benchmark, then keep watching in production.",
      points: [
        "Re-run the edited prompt across your full test/benchmark set to catch new edge cases the fix introduced.",
        "Track quality metrics (accuracy, format-valid rate, latency, cost) instead of eyeballing single outputs.",
        "Version the prompt and log every output against its version — so regressions and drift are traceable.",
        "Monitor in production: model updates and changing inputs cause silent drift over time.",
      ],
      example: {
        bad: "“It works on my one example, ship it.”",
        good: "New prompt: format-valid rate 78% → 99% across 500 cases, no accuracy regression. Tagged v1.3, monitored live.",
      },
    },
  ]

  const colorMap: Record<string, { border: string; text: string; badge: string; soft: string }> = {
    amber:   { border: "border-amber-500",   text: "text-amber-700 dark:text-amber-300",     badge: "bg-amber-500",   soft: "bg-amber-50 dark:bg-amber-950/30 border-amber-200/50" },
    orange:  { border: "border-orange-500",  text: "text-orange-700 dark:text-orange-300",   badge: "bg-orange-500",  soft: "bg-orange-50 dark:bg-orange-950/30 border-orange-200/50" },
    rose:    { border: "border-rose-500",    text: "text-rose-700 dark:text-rose-300",       badge: "bg-rose-500",    soft: "bg-rose-50 dark:bg-rose-950/30 border-rose-200/50" },
    violet:  { border: "border-violet-500",  text: "text-violet-700 dark:text-violet-300",   badge: "bg-violet-500",  soft: "bg-violet-50 dark:bg-violet-950/30 border-violet-200/50" },
    emerald: { border: "border-emerald-500", text: "text-emerald-700 dark:text-emerald-300", badge: "bg-emerald-500", soft: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50" },
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border-2 border-amber-200 dark:border-amber-800/50 rounded-xl p-8">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🔧</span>
          <div>
            <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-3">
              5 Steps for Debugging LLM Prompts
            </h1>
            <p className="text-lg text-amber-800 dark:text-amber-200 leading-relaxed">
              Debugging prompts is essential to improve <strong>accuracy, reliability, and safety</strong>. Poorly crafted
              prompts lead to false outputs, unclear instructions, or inefficient performance — a repeatable 5-step loop
              turns guesswork into a method.
            </p>
          </div>
        </div>
        <div className="mt-5 bg-white dark:bg-amber-950/60 rounded-lg p-4 border border-amber-200 dark:border-amber-700/50">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Source</p>
          <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
            newline.co — &quot;5 Steps for Debugging LLM Prompts&quot; by zaoyang
          </p>
        </div>
      </div>

      {/* Loop visual */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
        {["Reproduce", "Isolate", "Diagnose", "Refine", "Evaluate"].map((s, i, arr) => (
          <div key={s} className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-muted border border-border">{s}</span>
            {i < arr.length - 1 ? <span className="text-muted-foreground">→</span> : <span className="text-muted-foreground">↻</span>}
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step) => {
          const c = colorMap[step.color]
          return (
            <div key={step.n} className={`border-l-4 ${c.border} pl-5 space-y-3`}>
              <h2 className={`text-xl font-bold flex items-center gap-3 ${c.text}`}>
                <span className={`${c.badge} text-white h-8 w-8 rounded-full flex items-center justify-center text-sm flex-shrink-0`}>
                  {step.n}
                </span>
                {step.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.summary}</p>
              <ul className="space-y-1.5">
                {step.points.map((p) => (
                  <li key={p} className="text-sm text-muted-foreground flex gap-2">
                    <span className={c.text}>•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200/50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">❌ Don&apos;t</p>
                  <p className="text-xs text-muted-foreground">{step.example.bad}</p>
                </div>
                <div className={`${c.soft} border rounded-lg p-3`}>
                  <p className={`text-xs font-semibold mb-1 ${c.text}`}>✅ Do</p>
                  <p className="text-xs text-muted-foreground">{step.example.good}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Golden rule */}
      <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50 rounded-xl p-6">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><span className="text-xl">🏅</span> The Golden Rule</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong>Debugging is anecdotal; evaluation is statistical.</strong> Fixing a prompt for one user query can break
          it for five others. Always change <em>one thing at a time</em>, then validate the change against a real
          dataset — never a single hand-picked example.
        </p>
      </div>

      <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong>🔗 Connects to:</strong> Step 5 (Evaluate &amp; Monitor) is exactly where <strong>Prompt Versioning</strong>
          pays off — you can only detect a regression if every output is traceable to a specific prompt version.
        </p>
      </div>
    </div>
  )
}
