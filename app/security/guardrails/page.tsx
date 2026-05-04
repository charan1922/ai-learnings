export default function GuardrailsPage() {
  return (
    <div className="space-y-10">

      {/* Hero Definition */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 dark:bg-amber-700/20 rounded-full -translate-y-8 translate-x-8" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-amber-200 dark:border-amber-700">
            🛡️ SAFETY LAYER
          </div>
          <h1 className="text-2xl font-bold mb-3">What are Guardrails?</h1>
          <p className="text-base leading-relaxed max-w-2xl">
            Guardrails are a <strong>multi-layered safety system</strong> designed to ensure LLM applications behave securely, reliably, and within defined policies.
          </p>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-2xl">
            They act as <em>detective controls</em> — screening every input before it reaches the model, every tool call before it executes, and every output before it reaches the user.
          </p>
        </div>
      </div>

      {/* What Guardrails Detect */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">What Guardrails Detect</h2>
          <p className="text-sm text-muted-foreground mt-1">Five categories of harm screened across inputs, tool calls, and outputs:</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              label: "Prompt Injection",
              icon: "💉",
              badge: "High Risk",
              badgeColor: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
              desc: "Malicious instructions embedded in user input designed to override system prompts or hijack model behavior.",
              example: "\"Ignore all previous instructions and...\"",
              color: "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20",
            },
            {
              label: "Harmful Content",
              icon: "⚠️",
              badge: "Policy Block",
              badgeColor: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
              desc: "Violence, self-harm, hate speech, sexual content, or illicit material in inputs or model-generated responses.",
              example: "Detected by severity: low → medium → high",
              color: "border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20",
            },
            {
              label: "Sensitive Data",
              icon: "🔒",
              badge: "PII / Secrets",
              badgeColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
              desc: "Personally identifiable information (PII), API keys, credentials, or confidential data appearing in prompts or outputs.",
              example: "Email, SSN, phone numbers, auth tokens",
              color: "border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20",
            },
            {
              label: "Hallucinations",
              icon: "🌀",
              badge: "Accuracy",
              badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
              desc: "Fabricated facts, invented citations, or model outputs that are not grounded in the source context or retrieved data.",
              example: "Verified via RAG grounding + output validation",
              color: "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20",
            },
            {
              label: "Protected Material",
              icon: "📄",
              badge: "Copyright",
              badgeColor: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
              desc: "Copyrighted text, licensed source code, or regulated content reproduced verbatim without attribution or permission.",
              example: "Books, songs, proprietary codebases",
              color: "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20",
            },
          ].map(({ label, icon, badge, badgeColor, desc, example, color }) => (
            <div key={label} className={`${color} border rounded-xl p-4 space-y-2`}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm">{icon} {label}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${badgeColor}`}>{badge}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              <p className="text-xs italic text-muted-foreground/70 border-t border-current/10 pt-2">{example}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Three Types */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Three Types of Guardrails</h2>
          <p className="text-sm text-muted-foreground mt-1">Each type runs at a different point in the agent execution lifecycle.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-5 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-7 w-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">1</span>
                <h3 className="font-bold text-blue-700 dark:text-blue-300">Input Guardrails</h3>
              </div>
              <p className="text-xs text-muted-foreground">Run on the first user message, before the LLM sees it.</p>
            </div>
            <ul className="text-sm space-y-2">
              {["Prompt injection detection", "Jailbreak & abuse prevention", "Topic / policy scoping", "Harmful intent classification"].map(i => (
                <li key={i} className="flex gap-2 items-start">
                  <span className="text-blue-500 mt-0.5">✓</span>
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-violet-50 dark:bg-violet-950/40 border-2 border-violet-200 dark:border-violet-800 rounded-xl p-5 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-7 w-7 rounded-full bg-violet-500 text-white text-xs font-bold flex items-center justify-center">2</span>
                <h3 className="font-bold text-violet-700 dark:text-violet-300">Tool Guardrails</h3>
              </div>
              <p className="text-xs text-muted-foreground">Run before and after every tool / function call the agent makes.</p>
            </div>
            <ul className="text-sm space-y-2">
              {["Validate tool arguments", "Restrict unauthorized actions", "Sanitize tool return values", "Prevent data exfiltration via tools"].map(i => (
                <li key={i} className="flex gap-2 items-start">
                  <span className="text-violet-500 mt-0.5">✓</span>
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-orange-50 dark:bg-orange-950/40 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-5 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-7 w-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">3</span>
                <h3 className="font-bold text-orange-700 dark:text-orange-300">Output Guardrails</h3>
              </div>
              <p className="text-xs text-muted-foreground">Run on the final agent response, before it reaches the user.</p>
            </div>
            <ul className="text-sm space-y-2">
              {["Hallucination & fact checking", "Harmful content filtering", "Sensitive data & PII masking", "Protected material detection"].map(i => (
                <li key={i} className="flex gap-2 items-start">
                  <span className="text-orange-500 mt-0.5">✓</span>
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Request Flow */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Request Flow</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Optimistic execution — LLM and input guardrails run in <strong>parallel</strong>. If a guardrail triggers, the response is blocked before reaching the user.
          </p>
        </div>
        <div className="bg-muted/40 rounded-xl border border-border p-6 space-y-3 font-mono text-sm">

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-base flex-shrink-0">👤</div>
            <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-xs font-medium">User Message</div>
          </div>

          <div className="ml-4 text-muted-foreground text-xs">↓ parallel execution begins</div>

          {/* Parallel: Input guardrail + LLM */}
          <div className="ml-4 grid grid-cols-2 gap-3">
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-700 rounded-lg p-3 text-xs">
              <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">🔵 Input Guardrail</p>
              <p className="text-muted-foreground">Injection · Jailbreak · Topic</p>
              <p className="text-blue-600/70 dark:text-blue-400/70 text-xs mt-1 italic">→ block or pass</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-700 rounded-lg p-3 text-xs">
              <p className="font-semibold text-purple-700 dark:text-purple-300 mb-1">🧠 LLM Processing</p>
              <p className="text-muted-foreground">System prompt + response generation</p>
              <p className="text-purple-600/70 dark:text-purple-400/70 text-xs mt-1 italic">→ may call tools</p>
            </div>
          </div>

          <div className="ml-4 text-muted-foreground text-xs">↓ if tools are invoked</div>

          {/* Tool guardrails */}
          <div className="ml-4 grid grid-cols-2 gap-3">
            <div className="bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-700 rounded-lg p-3 text-xs">
              <p className="font-semibold text-violet-700 dark:text-violet-300 mb-1">🟣 Tool Guardrail — Input</p>
              <p className="text-muted-foreground">Validate args before execution</p>
            </div>
            <div className="bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-700 rounded-lg p-3 text-xs">
              <p className="font-semibold text-violet-700 dark:text-violet-300 mb-1">🟣 Tool Guardrail — Output</p>
              <p className="text-muted-foreground">Sanitize result before LLM sees it</p>
            </div>
          </div>

          <div className="ml-4 text-muted-foreground text-xs">↓ final response</div>

          {/* Output guardrail */}
          <div className="ml-4 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-700 rounded-lg p-3 text-xs">
            <p className="font-semibold text-orange-700 dark:text-orange-300 mb-1">🟠 Output Guardrail</p>
            <p className="text-muted-foreground">Harmful content · Sensitive data · Hallucinations · Protected material</p>
            <p className="text-orange-600/70 dark:text-orange-400/70 text-xs mt-1 italic">→ block, redact, or pass</p>
          </div>

          <div className="ml-4 text-muted-foreground text-xs">↓</div>

          <div className="ml-4 flex items-center gap-2 text-xs">
            <span className="h-7 w-7 rounded-full bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 flex items-center justify-center">✅</span>
            <span className="text-green-700 dark:text-green-400 font-medium">Safe Response → User</span>
          </div>

        </div>
      </div>

      {/* Threat Mapping */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold">Threat → Guardrail Mapping</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/70">
                <th className="p-3 text-left font-semibold border-b border-border w-1/6">Type</th>
                <th className="p-3 text-left font-semibold border-b border-border w-1/4">Threat</th>
                <th className="p-3 text-left font-semibold border-b border-border">Guardrail Response</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["🔵", "Prompt Injection", "Input validation + strict system prompt boundaries"],
                ["🔵", "Jailbreak Attempts", "Policy enforcement + intent classification"],
                ["🟣", "Unauthorized Tool Use", "Argument validation + action allowlist"],
                ["🟠", "Toxic / Harmful Output", "Moderation API + severity-based blocking"],
                ["🟠", "Hallucinations", "RAG grounding + output fact-checking"],
                ["🟠", "PII / Sensitive Data Leak", "PII detection + redaction before delivery"],
                ["🟠", "Protected Material", "Copyright classifier + attribution checks"],
              ].map(([type, threat, guardrail]) => (
                <tr key={threat} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-center text-base">{type}</td>
                  <td className="p-3 font-medium">{threat}</td>
                  <td className="p-3 text-muted-foreground">{guardrail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">🔵 Input &nbsp;|&nbsp; 🟣 Tool &nbsp;|&nbsp; 🟠 Output</p>
      </div>

      {/* Responsible AI Mapping */}
      <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
        <h2 className="text-lg font-bold mb-1">How Guardrails Enable Responsible AI</h2>
        <p className="text-sm text-muted-foreground mb-4">Each guardrail category maps directly to a Responsible AI principle:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { principle: "Fairness", impl: "Bias & hate speech filtering", icon: "⚖️" },
            { principle: "Safety", impl: "Toxicity & harm blocking", icon: "🛡️" },
            { principle: "Privacy", impl: "PII detection & masking", icon: "🔒" },
            { principle: "Transparency", impl: "Audit logging & explainability", icon: "📊" },
          ].map(({ principle, impl, icon }) => (
            <div key={principle} className="bg-background rounded-lg p-4 border border-border text-center space-y-1">
              <p className="text-2xl">{icon}</p>
              <p className="font-semibold text-sm">{principle}</p>
              <p className="text-xs text-muted-foreground leading-tight">{impl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interview Tip */}
      <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-5">
        <p className="text-sm font-semibold mb-2">🎓 Interview Tip</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Start with the <strong>3-type model</strong> (Input → Tool → Output) — it shows you understand agentic systems, not just chatbots.</li>
          <li>• Mention <strong>parallel / optimistic execution</strong> to show you care about latency.</li>
          <li>• Discuss <strong>threshold tuning</strong> — over-refusal is a real UX problem, not just under-refusal.</li>
          <li>• Connect each guardrail type to a <strong>Responsible AI principle</strong> to show end-to-end thinking.</li>
        </ul>
      </div>

    </div>
  )
}
