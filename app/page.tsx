"use client"

import { useState } from "react"
import { Sidebar, SidebarTopic, SecuritySubsection } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { AlertCircle, Shield } from "lucide-react"

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
    setActiveSection(section)
    if (section === "security" && subsection) {
      setActiveSubsection(subsection)
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
                <>
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

                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong>💡 Key Focus:</strong> Responsible AI is the foundation for building systems that are not just capable, but trustworthy. This guides everything from security practices to ethical decision-making.
                    </p>
                  </div>
                </>
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
                      <strong>💡 Discussion Point:</strong> Use these principles to evaluate your AI systems. How does each principle help mitigate the OWASP vulnerabilities? What trade-offs exist between them?
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
