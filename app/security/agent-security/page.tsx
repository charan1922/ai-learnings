const risks = [
  {
    area: "Data Leakage & Privacy Exposure",
    icon: "🔓",
    color: "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20",
    badgeColor: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
    badge: "Critical",
    description:
      "Agents often access sensitive business or user data. Without proper controls, they can unintentionally expose confidential information.",
    example:
      "An agent summarizing internal files accidentally includes private data in customer-facing responses.",
  },
  {
    area: "Prompt Injection & Manipulation",
    icon: "💉",
    color: "border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20",
    badgeColor: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
    badge: "High",
    description:
      "Malicious users craft inputs that override an agent's intended behavior, tricking it into revealing data or performing unauthorized actions.",
    example:
      "Hidden instructions in a message cause the agent to leak system credentials.",
  },
  {
    area: "Unauthorized Access & Privilege Escalation",
    icon: "🔑",
    color: "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20",
    badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    badge: "High",
    description:
      "Weak authentication or access controls let agents — or bad actors controlling them — access systems they shouldn't.",
    example:
      "An agent connected to a CRM tool performs admin-level actions like exporting or deleting records.",
  },
  {
    area: "Data Poisoning",
    icon: "☠️",
    color: "border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20",
    badgeColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
    badge: "Medium",
    description:
      "Attackers corrupt training or contextual data, causing agents to make biased, incorrect, or unsafe decisions.",
    example:
      "A poisoned dataset causes a customer support agent to recommend harmful content.",
  },
  {
    area: "Supply Chain Vulnerabilities",
    icon: "🔗",
    color: "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20",
    badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
    badge: "Medium",
    description:
      "Agents rely on external APIs, plugins, or model endpoints, expanding the attack surface.",
    example:
      "A compromised third-party plugin injects malicious code into the agent's workflow.",
  },
  {
    area: "Over-Reliance on Autonomous Actions",
    icon: "🤖",
    color: "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    badge: "Medium",
    description:
      "Highly autonomous agents may execute unintended actions if not carefully constrained or validated.",
    example:
      "An agent mistakenly sends payments or publishes unverified content.",
  },
  {
    area: "Inadequate Auditability & Logging",
    icon: "📋",
    color: "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/20",
    badgeColor: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    badge: "Compliance",
    description:
      "Without detailed logging, it's difficult to trace actions or detect malicious behavior early.",
    example:
      "Security teams can't identify data misuse due to missing activity logs.",
  },
  {
    area: "Model Inversion & Output Leakage",
    icon: "🔍",
    color: "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20",
    badgeColor: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
    badge: "Emerging",
    description:
      "Attackers exploit model outputs to infer sensitive data used during training or prompting.",
    example:
      "Repeated queries extract private information from a fine-tuning dataset.",
  },
]

const mitigations = [
  { icon: "🔐", text: "Enforce role-based access controls (RBAC) and least privilege permissions" },
  { icon: "🛡️", text: "Add prompt filtering and validation layers to prevent injection attacks" },
  { icon: "👤", text: "Sandbox or gate sensitive operations behind human-in-the-loop approvals" },
  { icon: "📊", text: "Maintain comprehensive logging and traceability for all agent actions" },
  { icon: "🔍", text: "Audit third-party dependencies and integrations regularly" },
  { icon: "🔄", text: "Continuously retrain and validate models to detect data drift or poisoning" },
]

export default function AgentSecurityPage() {
  return (
    <div className="space-y-10">

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-red-50 dark:from-slate-950/40 dark:to-red-950/30 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-8">
        <div className="absolute top-0 right-0 w-40 h-40 bg-red-100/40 dark:bg-red-900/10 rounded-full -translate-y-12 translate-x-12" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-red-200 dark:border-red-700">
            🤖 AGENTIC AI SECURITY
          </div>
          <h1 className="text-2xl font-bold mb-3">Security Considerations for AI Agents</h1>
          <p className="text-base leading-relaxed max-w-2xl text-muted-foreground">
            As AI agents become more <strong className="text-foreground">autonomous</strong> and integrated into enterprise systems, they introduce security considerations <strong className="text-foreground">beyond traditional application threats</strong>. Because agents can access sensitive data, make decisions, and act independently, you must design with security in mind from the start.
          </p>
        </div>
      </div>

      {/* Risk Areas */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Key Security Risks</h2>
          <p className="text-sm text-muted-foreground mt-1">Eight risk areas unique to autonomous AI agents:</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {risks.map(({ area, icon, color, badge, badgeColor, description, example }) => (
            <div key={area} className={`${color} border rounded-xl p-5 space-y-3`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{icon}</span>
                  <h3 className="font-semibold text-sm leading-tight">{area}</h3>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${badgeColor}`}>{badge}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              <div className="bg-background/60 rounded-lg px-3 py-2 border border-current/10">
                <p className="text-xs text-muted-foreground/80 italic">
                  <strong className="not-italic text-muted-foreground">Example:</strong> {example}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mitigation Strategies */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Mitigation Strategies</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Adopt a <strong>security-by-design</strong> approach — embed these practices early in development, not as an afterthought.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {mitigations.map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-3 bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <span className="text-xl flex-shrink-0">{icon}</span>
              <p className="text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security-by-Design Summary */}
      <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
        <h2 className="text-lg font-bold mb-3">Security-by-Design Principle</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { phase: "Design Phase", icon: "📐", actions: ["Define trust boundaries", "Map data flows", "Identify privilege requirements"] },
            { phase: "Build Phase", icon: "🔧", actions: ["Implement RBAC & least privilege", "Add prompt & output guards", "Build audit logging"] },
            { phase: "Operate Phase", icon: "📡", actions: ["Monitor for anomalies", "Audit 3rd-party integrations", "Retrain on drift signals"] },
          ].map(({ phase, icon, actions }) => (
            <div key={phase} className="bg-background rounded-lg p-4 border border-border">
              <p className="text-2xl mb-2">{icon}</p>
              <p className="font-semibold text-sm mb-2">{phase}</p>
              <ul className="space-y-1">
                {actions.map(a => (
                  <li key={a} className="text-xs text-muted-foreground flex gap-1.5">
                    <span className="text-indigo-400 flex-shrink-0">→</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-5">
        <p className="text-sm font-semibold mb-2">🎓 Interview Tip</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Frame this as <strong>agent-specific risks</strong> — go beyond generic app security to show you understand agentic architecture.</li>
          <li>• Highlight <strong>human-in-the-loop</strong> as the key control for autonomous action risks.</li>
          <li>• Mention <strong>least privilege</strong> for tool access — agents should only have the permissions they need for that task.</li>
        </ul>
      </div>

    </div>
  )
}
