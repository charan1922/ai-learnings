"use client"

import { useState } from "react"
import {
  Shield,
  Database,
  Zap,
  Scissors,
  GitBranch,
  Bot,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type SidebarTopic =
  | "security"
  | "vector-db"
  | "embeddings"
  | "chunking"
  | "graph-rag"
  | "agent-security"

export type SecuritySubsection =
  | "security-intro"
  | "security-guardrails"
  | "security-principles"
  | "security-owasp"

interface SidebarProps {
  activeSection?: SidebarTopic
  activeSubsection?: SecuritySubsection
  onSectionChange?: (section: SidebarTopic, subsection?: SecuritySubsection) => void
}

const securitySubItems = [
  {
    id: "security-intro",
    label: "Introduction",
    description: "4-Stage Lifecycle Framework",
  },
  {
    id: "security-guardrails",
    label: "Guardrails",
    description: "Content Safety & Controls",
  },
  {
    id: "security-principles",
    label: "AI Principles",
    description: "Fairness, Safety, Privacy...",
  },
  {
    id: "security-owasp",
    label: "OWASP Top 10",
    description: "LLM Security Vulnerabilities",
  },
]

const topics = [
  {
    id: "security",
    label: "Security & Responsible AI",
    description: "Guardrails & Safety",
    icon: Shield,
    color: "text-red-500",
    hasSubItems: true,
  },
  {
    id: "agent-security",
    label: "Agent Security",
    description: "Risks & Mitigations",
    icon: Bot,
    color: "text-slate-500",
  },
  {
    id: "vector-db",
    label: "Vector Databases",
    description: "Storage & Retrieval",
    icon: Database,
    color: "text-blue-500",
  },
  {
    id: "embeddings",
    label: "In-Memory Embeddings",
    description: "Embedding Comparisons",
    icon: Zap,
    color: "text-amber-500",
  },
  {
    id: "chunking",
    label: "Chunking Strategies",
    description: "Text Segmentation",
    icon: Scissors,
    color: "text-green-500",
  },
  {
    id: "graph-rag",
    label: "Graph RAG",
    description: "Knowledge Graphs",
    icon: GitBranch,
    color: "text-purple-500",
  },
] as const

export function Sidebar({
  activeSection,
  activeSubsection,
  onSectionChange,
}: SidebarProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(
    activeSection || null
  )

  return (
    <aside className="w-64 border-r border-border bg-muted/40 p-6 sticky top-0 h-screen overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-lg font-semibold tracking-tight">
          AI/RAG Concepts
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Presentation & Learning Guide
        </p>
      </div>

      <nav className="space-y-2">
        {topics.map((topic) => {
          const Icon = topic.icon
          const isExpanded = expandedItem === topic.id
          const isActive = activeSection === topic.id
          const hasSubItems = "hasSubItems" in topic && topic.hasSubItems

          return (
            <div key={topic.id}>
              <button
                onClick={() => {
                  if (hasSubItems) {
                    setExpandedItem(isExpanded ? null : topic.id)
                  } else {
                    setExpandedItem(topic.id)
                    onSectionChange?.(topic.id as SidebarTopic)
                  }
                }}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  (isExpanded && hasSubItems) || (isActive && !hasSubItems)
                    ? "bg-accent text-accent-foreground"
                    : ""
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={cn("h-5 w-5 flex-shrink-0", topic.color)}
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-sm">{topic.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {topic.description}
                      </div>
                    </div>
                  </div>
                  {hasSubItems && (
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 transition-transform" />
                      ) : (
                        <ChevronRight className="h-4 w-4 transition-transform" />
                      )}
                    </div>
                  )}
                </div>
              </button>

              {/* Sub-items for Security */}
              {hasSubItems && isExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l border-border/50 pl-2">
                  {securitySubItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => {
                        onSectionChange?.(
                          topic.id as SidebarTopic,
                          subItem.id as SecuritySubsection
                        )
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded text-sm transition-colors",
                        "hover:bg-accent/50 hover:text-accent-foreground",
                        activeSubsection === subItem.id &&
                          "bg-accent text-accent-foreground font-medium"
                      )}
                    >
                      <div className="font-medium text-xs text-blue-600 dark:text-blue-400 mb-0.5">
                        {subItem.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {subItem.description}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground font-medium">
          Use this sidebar to navigate through key concepts and explain each
          topic to your team.
        </p>
      </div>
    </aside>
  )
}
