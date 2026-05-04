export default function PrinciplesPage() {
  const aiPrinciples = [
    {
      title: "Fairness",
      description: "AI systems should treat all people fairly.",
      question: "How might an AI system allocate opportunities, resources, and information in ways that are fair?",
      color: "from-blue-500/10 to-blue-500/5",
    },
    {
      title: "Reliability & Safety",
      description: "AI systems should perform reliably and safely.",
      question: "How might a system function well across different use conditions and contexts?",
      color: "from-green-500/10 to-green-500/5",
    },
    {
      title: "Privacy & Security",
      description: "AI systems should be secure and respect privacy.",
      question: "How might a system be designed to support privacy and security?",
      color: "from-purple-500/10 to-purple-500/5",
    },
    {
      title: "Inclusiveness",
      description: "AI systems should empower everyone.",
      question: "How might a system be designed to be inclusive for people of all abilities?",
      color: "from-amber-500/10 to-amber-500/5",
    },
    {
      title: "Transparency",
      description: "AI systems should be understandable.",
      question: "How can we ensure people correctly understand system capabilities?",
      color: "from-pink-500/10 to-pink-500/5",
    },
    {
      title: "Accountability",
      description: "People should be accountable for AI systems.",
      question: "How can we create oversight for human control and accountability?",
      color: "from-indigo-500/10 to-indigo-500/5",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/50 rounded-lg p-4">
        <p className="text-sm">
          <strong>Six Core Principles</strong> that should guide AI development and use across all applications and use cases.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {aiPrinciples.map((principle) => (
          <div
            key={principle.title}
            className={`bg-gradient-to-br ${principle.color} border border-border rounded-lg p-5`}
          >
            <h3 className="font-semibold text-base mb-1">
              {principle.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {principle.description}
            </p>
            <div className="bg-background/50 rounded p-2 border border-border">
              <p className="text-xs text-muted-foreground italic">
                {principle.question}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong>💡 Discussion Point:</strong> Use these principles to evaluate your AI systems. How does each principle help mitigate security risks? What trade-offs exist between them?
        </p>
      </div>
    </div>
  )
}
