export default function PromptPatternsPage() {
  const patterns = [
    {
      number: "01",
      name: "Persona Pattern",
      tagline: "Tell the AI who to be and what to do.",
      color: "blue",
      example: `"Act as a senior frontend engineer. Review this React component for performance issues."`,
    },
    {
      number: "02",
      name: "Audience Persona Pattern",
      tagline: "Tailor the response to a specific audience.",
      color: "purple",
      example: `"Explain OAuth authentication to a non-technical product manager."`,
    },
    {
      number: "03",
      name: "Question Refinement Pattern",
      tagline: "Ask the AI to improve your question first.",
      color: "green",
      example: `"Rewrite my question to be more precise before answering it: 'How do I improve app performance?'"`,
    },
    {
      number: "04",
      name: "Cognitive Verifier Pattern",
      tagline: "Break a problem into sub-questions, answer them, then combine.",
      color: "orange",
      example: `"Break this into steps:\n1. What causes slow page loads?\n2. Which apply here?\n3. What fixes should I prioritize?"`,
    },
    {
      number: "05",
      name: "Flipped Interaction Pattern",
      tagline: "Let the AI ask you questions to clarify requirements.",
      color: "pink",
      example: `"Before giving recommendations, ask me questions to understand my use case."`,
    },
    {
      number: "06",
      name: "Ask-for-Input Pattern",
      tagline: "Require missing inputs before proceeding.",
      color: "teal",
      example: `"If you need more details (tech stack, users, constraints), ask me before answering."`,
    },
    {
      number: "07",
      name: "Template Pattern",
      tagline: "Provide a structured format the AI must follow.",
      color: "indigo",
      example: `"Fill in this template:\n• Problem:\n• Root Cause:\n• Solution:\n• Risks:"`,
    },
    {
      number: "08",
      name: "Recipe Pattern",
      tagline: "Request a clear step-by-step plan.",
      color: "blue",
      example: `"Give me a step-by-step plan to migrate a React app to Next.js."`,
    },
    {
      number: "09",
      name: "Alternative Approaches Pattern",
      tagline: "Generate and compare multiple solutions.",
      color: "purple",
      example: `"List 3 different ways to handle concurrency conflicts in a web app, with pros and cons."`,
    },
    {
      number: "10",
      name: "Game Play Pattern",
      tagline: "Turn the interaction into a rule-based game.",
      color: "green",
      example: `"Let's play a code review game. You point out one issue at a time, and I'll fix it."`,
    },
    {
      number: "11",
      name: "Menu Actions Pattern",
      tagline: "Define commands the AI should respond to.",
      color: "orange",
      example: "Commands:\n• `review` → review code\n• `refactor` → refactor it\n• `test` → suggest tests",
    },
    {
      number: "12",
      name: "Meta-Language Creation Pattern",
      tagline: "Define custom terms or shorthand.",
      color: "pink",
      example: `"When I say 'SAFE FIX,' I mean a solution with no API changes or DB migrations."`,
    },
  ]

  const colorMap: Record<string, { bg: string; border: string; badge: string; text: string }> = {
    blue:   { bg: "bg-blue-50 dark:bg-blue-950/30",     border: "border-blue-200/60 dark:border-blue-800/40",   badge: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",   text: "text-blue-700 dark:text-blue-300" },
    purple: { bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200/60 dark:border-purple-800/40", badge: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300", text: "text-purple-700 dark:text-purple-300" },
    green:  { bg: "bg-green-50 dark:bg-green-950/30",   border: "border-green-200/60 dark:border-green-800/40",  badge: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300",  text: "text-green-700 dark:text-green-300" },
    orange: { bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200/60 dark:border-orange-800/40", badge: "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300", text: "text-orange-700 dark:text-orange-300" },
    pink:   { bg: "bg-pink-50 dark:bg-pink-950/30",     border: "border-pink-200/60 dark:border-pink-800/40",   badge: "bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300",   text: "text-pink-700 dark:text-pink-300" },
    teal:   { bg: "bg-teal-50 dark:bg-teal-950/30",     border: "border-teal-200/60 dark:border-teal-800/40",   badge: "bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300",   text: "text-teal-700 dark:text-teal-300" },
    indigo: { bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200/60 dark:border-indigo-800/40", badge: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300", text: "text-indigo-700 dark:text-indigo-300" },
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border-2 border-amber-200 dark:border-amber-800/50 rounded-xl p-8">
        <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-3">Prompt Patterns</h1>
        <p className="text-lg text-amber-800 dark:text-amber-200 leading-relaxed">
          Prompt patterns are <strong>reusable ways to structure prompts</strong> so AI systems respond more clearly,
          consistently, and usefully. Instead of trial-and-error prompting, you apply proven patterns that guide how
          the model thinks and responds.
        </p>
        <div className="mt-4 bg-white dark:bg-amber-950/60 rounded-lg p-4 border border-amber-200 dark:border-amber-700/50">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Source</p>
          <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
            Vanderbilt University — Generative AI Prompt Patterns
          </p>
        </div>
      </div>

      {/* Why This Matters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: "🎯", text: "Reduces vague or inconsistent answers" },
          { icon: "🔁", text: "Makes prompts reusable across tasks and teams" },
          { icon: "📈", text: "Improves reliability and depth of responses" },
        ].map((item) => (
          <div key={item.text} className="bg-muted/50 rounded-lg p-4 border border-border text-center">
            <div className="text-2xl mb-2">{item.icon}</div>
            <p className="text-sm text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Patterns Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">12 Key Prompt Patterns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map((pattern) => {
            const c = colorMap[pattern.color]
            return (
              <div key={pattern.number} className={`rounded-xl border p-5 ${c.bg} ${c.border}`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${c.badge}`}>
                    #{pattern.number}
                  </span>
                  <div>
                    <h3 className={`font-semibold text-sm ${c.text}`}>{pattern.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{pattern.tagline}</p>
                  </div>
                </div>
                <div className="bg-white/70 dark:bg-black/20 rounded-lg p-3 border border-white/50 dark:border-white/10">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Example</p>
                  <p className="text-xs leading-relaxed whitespace-pre-line">{pattern.example}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong>💼 For Interviews:</strong> Mention that you use structured prompt patterns (like Persona, Template,
          or Cognitive Verifier) to make AI outputs more predictable and reusable — this signals maturity in
          prompt design rather than ad-hoc prompting.
        </p>
      </div>
    </div>
  )
}
