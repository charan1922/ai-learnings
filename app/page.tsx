"use client"

import { useState } from "react"
import { Sidebar, SidebarTopic, SecuritySubsection } from "@/components/sidebar"
import { Button } from "@/components/ui/button"

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

const contentSections = {
  security: {
    title: "Security & Responsible AI",
    subtitle: "OWASP Top 10 for LLMs & AI Principles",
    topics: [],
  },
  "vector-db": {
    title: "Vector Databases",
    subtitle: "Efficient Storage & Retrieval",
    topics: [
      "Vector embeddings basics",
      "Popular solutions: Pinecone, Weaviate, Milvus",
      "Indexing strategies",
      "Similarity search & retrieval",
    ],
  },
  embeddings: {
    title: "In-Memory Embedding Comparisons",
    subtitle: "Real-time Similarity Analysis",
    topics: [
      "Embedding models (OpenAI, Cohere, etc.)",
      "Cosine similarity calculations",
      "In-memory caching strategies",
      "Performance optimization",
    ],
  },
  chunking: {
    title: "Chunking Strategies",
    subtitle: "Text Segmentation & Preparation",
    topics: [
      "Fixed-size chunking",
      "Semantic chunking",
      "Overlapping chunks",
      "Metadata preservation",
    ],
  },
  "graph-rag": {
    title: "Graph RAG",
    subtitle: "Knowledge Graphs & Enhanced Retrieval",
    topics: [
      "Knowledge graph construction",
      "Entity extraction & linking",
      "Multi-hop reasoning",
      "Graph-based retrieval augmentation",
    ],
  },
}

export default function Page() {
  const [activeSection, setActiveSection] = useState<SidebarTopic>("security")
  const [activeSubsection, setActiveSubsection] =
    useState<SecuritySubsection>("security-intro")

  const content = contentSections[activeSection]
  const isSecuritySection = activeSection === "security"

  const handleSectionChange = (
    section: SidebarTopic,
    subsection?: SecuritySubsection
  ) => {
    if (section === "security") {
      const target = subsection === "security-guardrails"
        ? "/security/guardrails"
        : subsection === "security-agent"
        ? "/security/agent-security"
        : subsection === "security-principles"
        ? "/security/principles"
        : subsection === "security-owasp"
        ? "/security/owasp"
        : "/security/introduction"
      window.location.href = target
    } else {
      setActiveSection(section)
      if (subsection) setActiveSubsection(subsection)
    }
  }

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar
        activeSection={activeSection}
        activeSubsection={activeSubsection}
        onSectionChange={handleSectionChange}
      />

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              {content.title}
            </h1>
            <p className="text-lg text-muted-foreground">{content.subtitle}</p>
          </div>

          {isSecuritySection ? (
            <div className="space-y-8">
              {/* Introduction Section */}
              {activeSubsection === "security-intro" && (
                <div className="space-y-6">
                  {/* Definition */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-2 border-blue-200 dark:border-blue-800/50 rounded-xl p-8">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-3">
                          What is Responsible AI?
                        </h2>
                        <p className="text-lg text-blue-800 dark:text-blue-200 leading-relaxed">
                          Responsible AI refers to designing, developing, and using artificial intelligence in ways that are <strong>ethical, transparent, fair, and aligned with human values</strong>. It's a concept that focuses not just on what AI can do, but what it <strong>should</strong> do.
                        </p>
                      </div>

                      <div className="border-t border-blue-200 dark:border-blue-700 pt-4">
                        <div className="bg-white dark:bg-blue-950/60 rounded-lg p-4 border border-blue-200 dark:border-blue-700/50">
                          <p className="text-base font-semibold text-blue-900 dark:text-blue-100">
                            In simple terms:
                          </p>
                          <p className="text-lg mt-2 text-blue-800 dark:text-blue-200 font-semibold">
                            ✨ Responsible AI means building and using AI systems that people can trust.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4-Stage Framework */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4">4-Stage Responsible AI Lifecycle</h2>

                    {/* Stage 1: Map */}
                    <div className="space-y-4 mb-6 border-l-4 border-blue-500 pl-4">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                          1️⃣ Map Potential Harms (Risk Identification)
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Identify risks across three dimensions:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded border border-blue-200/50">
                            <p className="font-semibold text-sm mb-1">🔓 Security Risks</p>
                            <ul className="text-xs space-y-1 text-muted-foreground">
                              <li>• Prompt injection attacks</li>
                              <li>• Data leakage</li>
                              <li>• Jailbreak attempts</li>
                            </ul>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded border border-purple-200/50">
                            <p className="font-semibold text-sm mb-1">🤖 AI Risks</p>
                            <ul className="text-xs space-y-1 text-muted-foreground">
                              <li>• Hallucinations</li>
                              <li>• Bias in responses</li>
                              <li>• Toxic content</li>
                            </ul>
                          </div>
                          <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded border border-amber-200/50">
                            <p className="font-semibold text-sm mb-1">📊 Business Risks</p>
                            <ul className="text-xs space-y-1 text-muted-foreground">
                              <li>• Wrong decisions</li>
                              <li>• Compliance issues</li>
                              <li>• Legal liability</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stage 2: Measure */}
                    <div className="space-y-4 mb-6 border-l-4 border-purple-500 pl-4">
                      <div>
                        <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
                          2️⃣ Measure Harms (Evaluation Layer)
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Evaluate using automated and manual testing:
                        </p>
                        <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded border border-purple-200/50">
                          <ul className="text-sm space-y-2">
                            <li>✓ <strong>Red Teaming:</strong> Simulate attacks and jailbreaks</li>
                            <li>✓ <strong>Metrics:</strong> Toxicity score, hallucination rate, bias detection</li>
                            <li>✓ <strong>Tools:</strong> Content safety APIs, custom evaluation pipelines</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Stage 3: Mitigate */}
                    <div className="space-y-4 mb-6 border-l-4 border-green-500 pl-4">
                      <div>
                        <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                          3️⃣ Mitigate Harms (4-Layer Defense Strategy)
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Apply mitigation techniques at each layer of your AI solution:
                        </p>

                        {/* Layer 1: Model */}
                        <div className="space-y-3 mb-4">
                          <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded border border-green-200/50">
                            <div className="flex gap-2 mb-2">
                              <span className="text-lg">🤖</span>
                              <div>
                                <p className="font-semibold text-sm">Layer 1: Model Selection & Fine-tuning</p>
                              </div>
                            </div>
                            <ul className="text-xs space-y-1 text-muted-foreground pl-6">
                              <li>• <strong>Model Selection:</strong> Choose models appropriate for your use case (e.g., simpler models for classification reduce harm risk)</li>
                              <li>• <strong>Fine-tuning:</strong> Train on your domain data to produce more relevant, scoped responses</li>
                            </ul>
                          </div>
                        </div>

                        {/* Layer 2: Safety System */}
                        <div className="space-y-3 mb-4">
                          <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded border border-green-200/50">
                            <div className="flex gap-2 mb-2">
                              <span className="text-lg">🛡️</span>
                              <div>
                                <p className="font-semibold text-sm">Layer 2: Safety System & Guardrails</p>
                              </div>
                            </div>
                            <ul className="text-xs space-y-1 text-muted-foreground pl-6">
                              <li>• <strong>Content Filters:</strong> Classify content by severity (safe, low, medium, high) across 5 harm categories</li>
                              <li>• <strong>Guardrails:</strong> Suppress prompts/responses based on harm classification</li>
                              <li>• <strong>Prompt Shields:</strong> Detect systematic abuse attempts & jailbreak patterns</li>
                            </ul>
                          </div>
                        </div>

                        {/* Layer 3: System Message & Grounding */}
                        <div className="space-y-3 mb-4">
                          <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded border border-green-200/50">
                            <div className="flex gap-2 mb-2">
                              <span className="text-lg">💬</span>
                              <div>
                                <p className="font-semibold text-sm">Layer 3: System Message & Grounding</p>
                              </div>
                            </div>
                            <ul className="text-xs space-y-1 text-muted-foreground pl-6">
                              <li>• <strong>System Prompts:</strong> Define behavioral parameters & boundaries for the model</li>
                              <li>• <strong>Prompt Engineering:</strong> Structure inputs to minimize harmful outputs</li>
                              <li>• <strong>RAG (Retrieval-Augmented Generation):</strong> Ground responses in trusted data sources to reduce hallucination</li>
                            </ul>
                          </div>
                        </div>

                        {/* Layer 4: User Experience */}
                        <div className="space-y-3">
                          <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded border border-green-200/50">
                            <div className="flex gap-2 mb-2">
                              <span className="text-lg">👤</span>
                              <div>
                                <p className="font-semibold text-sm">Layer 4: User Experience & Transparency</p>
                              </div>
                            </div>
                            <ul className="text-xs space-y-1 text-muted-foreground pl-6">
                              <li>• <strong>Input Constraints:</strong> Restrict user inputs to specific subjects/types via UI design</li>
                              <li>• <strong>Input/Output Validation:</strong> Validate and sanitize data at application boundaries</li>
                              <li>• <strong>Documentation:</strong> Be transparent about system capabilities, limitations, and remaining risks</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stage 4: Manage */}
                    <div className="space-y-4 border-l-4 border-red-500 pl-4">
                      <div>
                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                          4️⃣ Manage Responsibly (Deployment & Monitoring)
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Ensure safe production usage:
                        </p>
                        <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded border border-red-200/50">
                          <ul className="text-sm space-y-2">
                            <li>📊 <strong>Monitoring:</strong> Track unsafe outputs, detect anomalies</li>
                            <li>📝 <strong>Logging:</strong> Audit all prompts and responses</li>
                            <li>👤 <strong>Human-in-Loop:</strong> Critical decisions require approval</li>
                            <li>⚡ <strong>Fallback:</strong> Block or provide safe alternative responses</li>
                            <li>💬 <strong>Transparency:</strong> Show disclaimers and limitations</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong>💼 For Interviews:</strong> This framework demonstrates enterprise-grade AI governance. Use it to explain how you implement guardrails, mitigate risks, handle bias, and ensure responsible deployment in production systems.
                    </p>
                  </div>
                </div>
              )}

              {/* Guardrails Section */}
              {activeSubsection === "security-guardrails" && (
                <div className="space-y-6">
                  <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50 rounded-lg p-4">
                    <p className="text-sm">
                      <strong>Guardrails</strong> are safety mechanisms that detect and suppress harmful content in both user inputs and model outputs. They work as a protective layer to ensure AI systems remain safe and compliant.
                    </p>
                  </div>

                  {/* What are Guardrails */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">What Are Guardrails?</h3>
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
                    <h3 className="text-lg font-semibold">5 Harm Categories</h3>
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
                    <h3 className="text-lg font-semibold">Severity Levels</h3>
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
                    <h3 className="text-lg font-semibold">How to Implement</h3>
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
              )}

              {/* AI Principles Section */}
              {activeSubsection === "security-principles" && (
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
                      <strong>💡 Discussion Point:</strong> Use these principles to evaluate your AI systems. How does each principle help mitigate the OWASP vulnerabilities?
                    </p>
                  </div>
                </div>
              )}

              {/* OWASP Top 10 Section */}
              {activeSubsection === "security-owasp" && (
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
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6 border border-border">
                <h2 className="font-semibold mb-4">Key Topics:</h2>
                <ul className="space-y-3">
                  {content.topics?.map((topic, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm leading-relaxed">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <Button>View Details</Button>
                <Button variant="outline">Download Slides</Button>
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-border text-xs text-muted-foreground">
            <p>
              💡 Tip: Use the sidebar to navigate between topics. Each section
              contains key concepts to explain to your team.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
