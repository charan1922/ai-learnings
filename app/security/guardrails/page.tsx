export default function GuardrailsPage() {
  return (
    <div className="space-y-8">

      {/* Definition */}
      <div className="bg-amber-50/50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-2">What are Guardrails?</h2>
        <p className="text-base leading-relaxed">
          Guardrails are a <strong>multi-layered safety system</strong> designed to ensure LLM applications behave securely, reliably, and within defined policies.
        </p>
        <p className="text-sm text-muted-foreground mt-3 italic">
          They act as detective controls that steer your application — validating inputs before they reach the model, and outputs before they reach the user.
        </p>
      </div>

      {/* Harm Categories */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold">What Guardrails Detect</h2>
        <p className="text-sm text-muted-foreground">Guardrails screen for these categories of harm across inputs, outputs, and tool calls:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Prompt Injection", icon: "💉", desc: "Malicious instructions hidden in user input trying to hijack the model", color: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800" },
            { label: "Harmful Content", icon: "⚠️", desc: "Violence, self-harm, hate speech, sexual content, or illicit material", color: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800" },
            { label: "Sensitive Data", icon: "🔒", desc: "PII, credentials, or confidential information in inputs or model outputs", color: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800" },
            { label: "Hallucinations", icon: "🌀", desc: "Fabricated facts, citations, or outputs not grounded in source data", color: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800" },
            { label: "Protected Material", icon: "📄", desc: "Copyrighted text, licensed code, or regulated content reproduced verbatim", color: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" },
          ].map(({ label, icon, desc, color }) => (
            <div key={label} className={`${color} border rounded-lg p-4`}>
              <p className="font-semibold text-sm mb-1">{icon} {label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Three Types of Guardrails */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Three Types of Guardrails</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">🔵 Input Guardrails</h3>
            <p className="text-xs text-muted-foreground mb-3">Run before the LLM processes the request</p>
            <ul className="text-sm space-y-1">
              <li>✓ Prompt injection detection</li>
              <li>✓ Jailbreak prevention</li>
              <li>✓ Topical / off-topic filtering</li>
            </ul>
          </div>

          <div className="bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 rounded-xl p-5">
            <h3 className="font-semibold text-violet-700 dark:text-violet-300 mb-2">🟣 Tool Guardrails</h3>
            <p className="text-xs text-muted-foreground mb-3">Run before & after every tool/function call</p>
            <ul className="text-sm space-y-1">
              <li>✓ Validate tool inputs</li>
              <li>✓ Sanitize tool outputs</li>
              <li>✓ Prevent unauthorized actions</li>
            </ul>
          </div>

          <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-xl p-5">
            <h3 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">🟠 Output Guardrails</h3>
            <p className="text-xs text-muted-foreground mb-3">Run after the LLM generates the final response</p>
            <ul className="text-sm space-y-1">
              <li>✓ Hallucination / fact checking</li>
              <li>✓ Harmful content filtering</li>
              <li>✓ Sensitive data & PII masking</li>
            </ul>
          </div>

        </div>
      </div>

      {/* Flow */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold">Request Flow</h2>
        <p className="text-sm text-muted-foreground">Guardrails run in parallel with the LLM (async) to minimise latency.</p>
        <div className="bg-muted/50 p-5 rounded-lg border border-border font-mono text-sm space-y-2">
          <p className="text-blue-600 dark:text-blue-400">👤 User Input</p>
          <p className="ml-4 text-muted-foreground">↓</p>
          <div className="ml-4 flex gap-3">
            <div className="flex-1 bg-blue-50 dark:bg-blue-950/30 p-2 rounded border border-blue-200/50 text-xs">
              <p className="font-semibold text-blue-700 dark:text-blue-300">Input Guardrail (parallel)</p>
              <p className="text-muted-foreground">Injection · Jailbreak · Topic</p>
            </div>
            <div className="flex-1 bg-purple-50 dark:bg-purple-950/30 p-2 rounded border border-purple-200/50 text-xs">
              <p className="font-semibold text-purple-700 dark:text-purple-300">LLM Processing</p>
              <p className="text-muted-foreground">System prompt + generation</p>
            </div>
          </div>
          <p className="ml-4 text-muted-foreground">↓ (if tool calls needed)</p>
          <div className="ml-4 flex gap-3">
            <div className="flex-1 bg-violet-50 dark:bg-violet-950/30 p-2 rounded border border-violet-200/50 text-xs">
              <p className="font-semibold text-violet-700 dark:text-violet-300">Tool Guardrail — Input</p>
              <p className="text-muted-foreground">Validate args before execution</p>
            </div>
            <div className="flex-1 bg-violet-50 dark:bg-violet-950/30 p-2 rounded border border-violet-200/50 text-xs">
              <p className="font-semibold text-violet-700 dark:text-violet-300">Tool Guardrail — Output</p>
              <p className="text-muted-foreground">Sanitize result before LLM sees it</p>
            </div>
          </div>
          <p className="ml-4 text-muted-foreground">↓</p>
          <div className="ml-4 bg-orange-50 dark:bg-orange-950/30 p-2 rounded border border-orange-200/50 text-xs">
            <p className="font-semibold text-orange-700 dark:text-orange-300">Output Guardrail</p>
            <p className="text-muted-foreground">Harmful content · Sensitive data · Hallucinations · Protected material</p>
          </div>
          <p className="ml-4 text-muted-foreground">↓</p>
          <p className="ml-4 text-green-600 dark:text-green-400">✅ Safe Response → User</p>
        </div>
      </div>

      {/* Threat Mapping */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold">Threat → Guardrail Mapping</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/70">
                <th className="p-3 text-left font-semibold border-b border-border">Threat</th>
                <th className="p-3 text-left font-semibold border-b border-border">Guardrail</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Prompt Injection", "Input validation + strict system prompt"],
                ["Jailbreak Attempts", "Policy enforcement + injection detection"],
                ["Data Leakage", "System instructions + output filtering"],
                ["Toxic Outputs", "Moderation API + toxicity classifier"],
                ["Hallucinations", "RAG grounding + output validation"],
                ["PII Exposure", "PII detection & masking"],
              ].map(([threat, guardrail]) => (
                <tr key={threat} className="border-b border-border hover:bg-muted/30">
                  <td className="p-3 font-medium">{threat}</td>
                  <td className="p-3 text-muted-foreground">{guardrail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Connection to Responsible AI */}
      <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5">
        <h2 className="text-lg font-bold mb-3">Guardrails → Responsible AI</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            ["Fairness", "Bias filtering"],
            ["Safety", "Toxicity blocking"],
            ["Privacy", "PII masking"],
            ["Transparency", "Audit logging"],
          ].map(([principle, impl]) => (
            <div key={principle} className="bg-background p-3 rounded border border-border text-center">
              <p className="font-semibold text-xs">{principle}</p>
              <p className="text-xs text-muted-foreground mt-1">{impl}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong>🎓 Interview Tip:</strong> Explain Input/Output model first (OpenAI-aligned), then the extended 5-layer architecture for enterprise. Always discuss async execution and how you tune thresholds to avoid over-refusal.
        </p>
      </div>

    </div>
  )
}
