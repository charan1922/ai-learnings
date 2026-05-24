export default function PromptEngineeringGuidePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-2 border-emerald-200 dark:border-emerald-800/50 rounded-xl p-8">
        <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-3">
          Prompt Engineering Guide
        </h1>
        <p className="text-lg text-emerald-800 dark:text-emerald-200 leading-relaxed">
          <strong>Prompt engineering</strong> is the practice of writing <em>clear, structured instructions</em> for a
          model so it reliably produces the output you want. It&apos;s both a design skill and a set of best practices
          to reduce ambiguity and errors in AI responses.
        </p>
        <div className="mt-4 bg-white dark:bg-emerald-950/60 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700/50">
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Source</p>
          <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-1">
            OpenAI — Official Prompt Engineering Guide (API Docs)
          </p>
        </div>
      </div>

      {/* Key Reminder */}
      <div className="bg-muted/50 border border-border rounded-lg p-4 flex gap-3 items-start">
        <span className="text-xl">🎤</span>
        <p className="text-sm text-muted-foreground">
          Prompt engineering isn&apos;t about <em>length</em> — it&apos;s about <strong>clarity and structure</strong>.
          Well-structured prompts give more reliable, predictable results.
        </p>
      </div>

      {/* Strategy 1 */}
      <div className="border-l-4 border-emerald-500 pl-4 space-y-3">
        <h2 className="text-xl font-bold">1. Write Clear Instructions</h2>
        <p className="text-sm text-muted-foreground">
          Be <em>explicit</em> about what you want — include the task, format, and style.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200/50 rounded-lg p-4">
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">❌ Vague</p>
            <p className="text-sm font-mono bg-white/60 dark:bg-black/20 rounded p-2">Summarize this article.</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200/50 rounded-lg p-4">
            <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">✅ Clear</p>
            <p className="text-sm font-mono bg-white/60 dark:bg-black/20 rounded p-2">
              Summarize this article into 5 bullet points, focusing on key outcomes for product managers.
            </p>
          </div>
        </div>
      </div>

      {/* Strategy 2 */}
      <div className="border-l-4 border-teal-500 pl-4 space-y-3">
        <h2 className="text-xl font-bold">2. Use Message Roles & Structure</h2>
        <p className="text-sm text-muted-foreground">
          Use roles like <em>developer/system</em> vs <em>user</em> to guide priorities. Developer/system instructions
          have higher authority.
        </p>
        <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200/50 rounded-lg p-4">
          <pre className="text-xs leading-relaxed overflow-x-auto">{`[
  {
    "role": "developer",
    "content": "You are a concise API documentation generator."
  },
  {
    "role": "user",
    "content": "Document this function with examples."
  }
]`}</pre>
        </div>
        <p className="text-xs text-muted-foreground">
          This tells the model <em>how</em> to behave before the user&apos;s actual request.
        </p>
      </div>

      {/* Strategy 3 */}
      <div className="border-l-4 border-blue-500 pl-4 space-y-3">
        <h2 className="text-xl font-bold">3. Few-Shot Examples</h2>
        <p className="text-sm text-muted-foreground">
          Giving <em>input/output examples</em> helps the model learn the desired pattern.
        </p>
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 rounded-lg p-4">
          <pre className="text-xs leading-relaxed">{`Input: "Happy with product"
Output: "Positive"

Input: "Terrible service"
Output: "Negative"

Now classify: "Delivery was late."`}</pre>
        </div>
        <p className="text-xs text-muted-foreground">The model picks up the pattern from examples.</p>
      </div>

      {/* Strategy 4 */}
      <div className="border-l-4 border-purple-500 pl-4 space-y-3">
        <h2 className="text-xl font-bold">4. Include Relevant Context</h2>
        <p className="text-sm text-muted-foreground">
          If the model needs external or specific data, include it in the prompt.
        </p>
        <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200/50 rounded-lg p-4">
          <pre className="text-xs leading-relaxed">{`Article: """{text}"""
Task: "Rewrite this for a technical blog."`}</pre>
        </div>
        <p className="text-xs text-muted-foreground">
          This gives the model both the <em>raw material</em> and <em>instructions</em>.
        </p>
      </div>

      {/* Strategy 5 */}
      <div className="border-l-4 border-orange-500 pl-4 space-y-3">
        <h2 className="text-xl font-bold">5. Be Specific About Format</h2>
        <p className="text-sm text-muted-foreground">
          Tell the model <em>exactly what output format</em> you want (JSON, steps, summary length, etc.)
        </p>
        <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200/50 rounded-lg p-4">
          <p className="text-sm font-mono">Return a JSON with fields: title, key_points[], and summary.</p>
        </div>
      </div>

      {/* Strategy 6 */}
      <div className="border-l-4 border-pink-500 pl-4 space-y-3">
        <h2 className="text-xl font-bold">6. Break Down Complex Tasks</h2>
        <p className="text-sm text-muted-foreground">
          Split big tasks into clearer pieces so the model handles them better.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200/50 rounded-lg p-4">
            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">❌ Too broad</p>
            <p className="text-sm font-mono bg-white/60 dark:bg-black/20 rounded p-2">Create a business strategy.</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200/50 rounded-lg p-4">
            <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">✅ Broken down</p>
            <pre className="text-xs bg-white/60 dark:bg-black/20 rounded p-2">{`1. Analyze market trends.
2. Identify strengths/weaknesses.
3. Draft actionable steps.`}</pre>
          </div>
        </div>
      </div>

      {/* Strategy 7 */}
      <div className="border-l-4 border-indigo-500 pl-4 space-y-3">
        <h2 className="text-xl font-bold">7. Prompt Caching & Reusability</h2>
        <p className="text-sm text-muted-foreground">
          Keep repeated/unchanging instructions at the start (or in reusable templates) to improve performance.
        </p>
        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/50 rounded-lg p-4">
          <p className="text-sm">
            Create a prompt template with placeholders like <code className="bg-white/60 dark:bg-black/20 px-1 rounded">{`{{product}}`}</code>,
            then pass values via API. Stable prefixes stay cached and reduce latency + cost.
          </p>
        </div>
      </div>

      {/* Strategy 8 */}
      <div className="border-l-4 border-slate-500 pl-4 space-y-3">
        <h2 className="text-xl font-bold">8. Know Model Differences</h2>
        <p className="text-sm text-muted-foreground">Different model types require different prompting styles.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200/50 rounded-lg p-4">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">🧠 Reasoning Models</p>
            <p className="text-xs text-muted-foreground">
              Can solve higher-level tasks with looser instructions. Let them think step-by-step.
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200/50 rounded-lg p-4">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">⚡ GPT Models</p>
            <p className="text-xs text-muted-foreground">
              Work best with <em>precise instructions</em> and clear formatting. Be explicit.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Reference</h2>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="text-left p-3 font-semibold">Strategy</th>
                <th className="text-left p-3 font-semibold">One-liner</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Clear Instructions",     "State the task, format, and style explicitly"],
                ["Message Roles",          "System/developer > user in authority"],
                ["Few-Shot Examples",      "Show input→output pairs to teach the pattern"],
                ["Relevant Context",       "Include raw data alongside instructions"],
                ["Specify Format",         "JSON, bullets, length — be precise"],
                ["Break Down Tasks",       "Subtasks produce better output than one big ask"],
                ["Prompt Caching",         "Keep stable text first; use placeholders for variables"],
                ["Model Awareness",        "Reasoning = looser; GPT = stricter instructions"],
              ].map(([strategy, desc], i) => (
                <tr key={strategy} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                  <td className="p-3 font-medium text-emerald-700 dark:text-emerald-400">{strategy}</td>
                  <td className="p-3 text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong>💼 For Interviews:</strong> Mention strategies like few-shot prompting, role separation, and
          output formatting to demonstrate you understand how to engineer reliable, production-grade prompts — not
          just casual chatbot use.
        </p>
      </div>
    </div>
  )
}
