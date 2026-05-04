export default function GuardrailsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50 rounded-lg p-4">
        <p className="text-sm">
          <strong>Guardrails</strong> are safety mechanisms that detect and suppress harmful content in both user inputs and model outputs. They work as a protective layer to ensure AI systems remain safe and compliant.
        </p>
      </div>

      {/* What are Guardrails */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">What Are Guardrails?</h2>
        <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded border border-amber-200/50">
          <p className="text-sm text-muted-foreground">
            Guardrails are platform-level safety configurations that use content filters and abuse detection to:
          </p>
          <ul className="text-sm space-y-2 mt-3 pl-4">
            <li>✓ Classify content into severity levels (Safe, Low, Medium, High)</li>
            <li>✓ Suppress harmful prompts before processing</li>
            <li>✓ Filter dangerous responses before delivery</li>
            <li>✓ Detect abuse patterns and jailbreak attempts</li>
          </ul>
        </div>
      </div>

      {/* Harm Categories */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">5 Harm Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded border border-red-200/50">
            <p className="font-semibold text-sm mb-2">🔴 Hate & Fairness</p>
            <p className="text-xs text-muted-foreground">Discriminatory or hateful content targeting protected groups</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded border border-orange-200/50">
            <p className="font-semibold text-sm mb-2">🟠 Sexual</p>
            <p className="text-xs text-muted-foreground">Sexually explicit or adult content</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded border border-yellow-200/50">
            <p className="font-semibold text-sm mb-2">🟡 Violence</p>
            <p className="text-xs text-muted-foreground">Content promoting violence or harm to people</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded border border-purple-200/50">
            <p className="font-semibold text-sm mb-2">🟣 Self-Harm</p>
            <p className="text-xs text-muted-foreground">Content promoting self-injury or suicide</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded border border-blue-200/50 md:col-span-2">
            <p className="font-semibold text-sm mb-2">🔵 Task-Adherence</p>
            <p className="text-xs text-muted-foreground">Jailbreaks, prompt injections, and system prompt override attempts</p>
          </div>
        </div>
      </div>

      {/* Severity Levels */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Severity Levels</h2>
        <div className="space-y-2">
          <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded border border-green-200/50">
            <p className="font-semibold text-sm text-green-700 dark:text-green-400">✅ Safe</p>
            <p className="text-xs text-muted-foreground">Content is appropriate and safe to deliver</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded border border-blue-200/50">
            <p className="font-semibold text-sm text-blue-700 dark:text-blue-400">ℹ️ Low</p>
            <p className="text-xs text-muted-foreground">Minor concerns; minimal risk, may allow with warning</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded border border-yellow-200/50">
            <p className="font-semibold text-sm text-yellow-700 dark:text-yellow-400">⚠️ Medium</p>
            <p className="text-xs text-muted-foreground">Significant concerns; recommend blocking or filtering</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded border border-red-200/50">
            <p className="font-semibold text-sm text-red-700 dark:text-red-400">🚫 High</p>
            <p className="text-xs text-muted-foreground">Severe concerns; must block immediately</p>
          </div>
        </div>
      </div>

      {/* Implementation */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">How to Implement</h2>
        <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded border border-amber-200/50">
          <ul className="text-sm space-y-2">
            <li><strong>1. Content Filters:</strong> Analyze both inputs and outputs for harmful categories</li>
            <li><strong>2. Prompt Shields:</strong> Detect abuse patterns and systematic jailbreak attempts</li>
            <li><strong>3. Dynamic Thresholds:</strong> Adjust blocking sensitivity based on use case</li>
            <li><strong>4. Logging & Monitoring:</strong> Track filtered content for review and improvement</li>
            <li><strong>5. Fallback Responses:</strong> Provide safe alternative responses when content is blocked</li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong>💡 Key Insight:</strong> Guardrails are a critical mitigation layer that provides real-time protection against harmful content, working alongside system prompts and other defenses to ensure responsible AI deployment.
        </p>
      </div>
    </div>
  )
}
