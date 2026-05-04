"use client"

import { useState } from "react"
import { Sidebar, SidebarTopic } from "@/components/sidebar"
import { Button } from "@/components/ui/button"

const contentSections = {
  security: {
    title: "Security & Responsible AI",
    subtitle: "Guardrails & Safety Measures",
    topics: [
      "Data privacy and protection",
      "Model safety guardrails",
      "Responsible AI principles",
      "Bias detection and mitigation",
    ],
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

  const content = contentSections[activeSection]

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              {content.title}
            </h1>
            <p className="text-lg text-muted-foreground">{content.subtitle}</p>
          </div>

          <div className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6 border border-border">
              <h2 className="font-semibold mb-4">Key Topics:</h2>
              <ul className="space-y-3">
                {content.topics.map((topic, i) => (
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
