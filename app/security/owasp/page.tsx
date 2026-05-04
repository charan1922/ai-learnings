const owasp10 = [
  {
    id: "LLM01",
    title: "Prompt Injection",
    description: "Attackers manipulate LLMs with crafted inputs causing unauthorized access, data breaches, and compromised decision-making.",
  },
  {
    id: "LLM02",
    title: "Insecure Output Handling",
    description: "Applications neglect to validate LLM outputs, opening doors for downstream exploits like unauthorized code execution.",
  },
  {
    id: "LLM03",
    title: "Training Data Poisoning",
    description: "Tampered training data fundamentally impairs model behavior, leading to compromised security, accuracy, or ethical alignment.",
  },
  {
    id: "LLM04",
    title: "Model Denial of Service",
    description: "Attackers overload LLMs with resource-heavy operations, causing service disruptions and increased operational costs.",
  },
  {
    id: "LLM05",
    title: "Supply Chain Vulnerabilities",
    description: "Compromised third-party components, services, or datasets undermine AI system integrity, causing breaches and failures.",
  },
  {
    id: "LLM06",
    title: "Sensitive Information Disclosure",
    description: "Models not restricted from revealing sensitive information face severe legal consequences and loss of competitive advantage.",
  },
  {
    id: "LLM07",
    title: "Insecure Plugin Design",
    description: "LLM plugins processing untrusted inputs without sufficient access controls create high risk for remote code execution.",
  },
  {
    id: "LLM08",
    title: "Excessive Agency",
    description: "Unchecked LLM autonomy leads to unintended harmful consequences, jeopardizing reliability, privacy, and user trust.",
  },
  {
    id: "LLM09",
    title: "Overreliance",
    description: "Users failing to critically assess LLM outputs lead to compromised decision-making, vulnerabilities, and legal liabilities.",
  },
  {
    id: "LLM10",
    title: "Model Theft",
    description: "Unauthorized access to proprietary LLMs exposes organizations to IP theft, loss of competitive advantage, and data exposure.",
  },
]

export default function OWASPPage() {
  return (
    <div className="space-y-6">
      <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/50 rounded-lg p-4">
        <p className="text-sm">
          <strong>OWASP Top 10 for Large Language Models</strong> outlines the most critical security vulnerabilities specific to generative AI systems. Understanding these is essential for designing guardrails and safety measures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {owasp10.map((item) => (
          <div
            key={item.id}
            className="bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/50 rounded-lg p-4 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-500 text-white text-xs font-bold">
                  {item.id.replace("LLM0", "")}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong>💡 Presentation Tip:</strong> Walk through each vulnerability and discuss how your organization is addressing them through secure coding practices, input validation, and output monitoring.
        </p>
      </div>
    </div>
  )
}
