"use client"

import { useState } from "react"
import {
  Shield,
  Database,
  Scissors,
  GitBranch,
  ChevronRight,
  ChevronDown,
  Bot,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type SidebarTopic =
  | "security"
  | "vector-db"
  | "embeddings"
  | "chunking"
  | "graph-rag"
  | "agent-it"
  | "agent-it-langgraph"
  | "prompt-engineering"

export type SecuritySubsection =
  | "security-intro"
  | "security-guardrails"
  | "security-agent"
  | "security-principles"
  | "security-owasp"
  | "career-advisor"

export type VectorDbSubsection =
  | "vector-db-intro"
  | "vector-db-considerations"

interface SidebarProps {
  activeSection?: SidebarTopic
  activeSubsection?: string
  onSectionChange?: (section: SidebarTopic, subsection?: string) => void
}

const subItems: Record<string, { id: string; label: string; description: string }[]> = {
  security: [
    { id: "security-intro",       label: "Introduction",   description: "4-Stage Lifecycle Framework" },
    { id: "security-guardrails",  label: "Guardrails",     description: "Content Safety & Controls" },
    { id: "security-agent",       label: "Agent Security", description: "Risks & Mitigations" },
    { id: "security-principles",  label: "AI Principles",  description: "Fairness, Safety, Privacy..." },
    { id: "security-owasp",       label: "OWASP Top 10",   description: "LLM Security Vulnerabilities" },
    { id: "career-advisor",       label: "Career Advisor AI", description: "End-to-end responsible AI demo" },
  ],
  "agent-it": [
    { id: "agent-it-main",          label: "Tickets & Classify", description: "Classify tickets with vector similarity" },
    { id: "agent-it-knowledgebase", label: "Knowledgebase",      description: "6 RAG versioning concepts" },
  ],
  "prompt-engineering": [
    { id: "prompt-patterns",          label: "Prompt Patterns",          description: "Vanderbilt reusable prompt patterns" },
    { id: "prompt-engineering-guide", label: "Prompt Engineering Guide",  description: "OpenAI strategies & best practices" },
    { id: "smart-qa",                 label: "Smart Q&A Assistant",       description: "Role prompting & few-shot demo" },
    { id: "context-engineering",      label: "Context Engineering",        description: "Anthropic guide for AI agents" },
  ],
  "vector-db": [
    { id: "vector-db-intro",          label: "Introduction",      description: "Problem, Solution & RAG Flow" },
    { id: "vector-db-considerations", label: "What to Consider",  description: "Security & Optimization" },
    { id: "vector-db-rag-example",    label: "RAG Example",       description: "LangChain, Pinecone, Azure OpenAI" },
    { id: "vector-db-rag-example-2",  label: "RAG Example 2",     description: "File Upload, @azure/openai" },
    { id: "vector-db-demo",           label: "Live Demo",          description: "Interactive RAG Walkthrough" },
  ],
}

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
    id: "vector-db",
    label: "Vector Databases",
    description: "Storage & Retrieval",
    icon: Database,
    color: "text-blue-500",
    hasSubItems: true,
  },
  {
    id: "chunking",
    label: "Chunking Strategies",
    description: "Text Segmentation",
    icon: Scissors,
    color: "text-green-500",
  },
  {
    id: "agent-it",
    label: "Agent IT",
    description: "Agent Integration & Tools",
    icon: Bot,
    color: "text-indigo-500",
    hasSubItems: true,
  },
  {
    id: "agent-it-langgraph",
    label: "Agent IT (LangGraph)",
    description: "Graph-based ticket routing",
    icon: GitBranch,
    color: "text-violet-500",
  },
  {
    id: "prompt-engineering",
    label: "Prompt & Context Engineering",
    description: "Patterns & Best Practices",
    icon: BookOpen,
    color: "text-amber-500",
    hasSubItems: true,
  },
] as const

export function Sidebar({ activeSection, activeSubsection, onSectionChange }: SidebarProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(activeSection || null)

  return (
    <aside className="w-64 border-r border-border bg-muted/40 p-6 sticky top-0 h-screen overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-lg font-semibold tracking-tight">AI/RAG Concepts</h2>
        <p className="text-xs text-muted-foreground mt-1">Presentation & Learning Guide</p>
      </div>

      <nav className="space-y-2">
        {topics.map((topic) => {
          const Icon = topic.icon
          const isExpanded = expandedItem === topic.id
          const isActive = activeSection === topic.id
          const hasSubItems = "hasSubItems" in topic && topic.hasSubItems
          const items = subItems[topic.id] ?? []

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
                    <Icon className={cn("h-5 w-5 flex-shrink-0", topic.color)} />
                    <div className="min-w-0">
                      <div className="font-medium text-sm">{topic.label}</div>
                      <div className="text-xs text-muted-foreground">{topic.description}</div>
                    </div>
                  </div>
                  {hasSubItems && (
                    <div className="flex-shrink-0">
                      {isExpanded
                        ? <ChevronDown className="h-4 w-4 transition-transform" />
                        : <ChevronRight className="h-4 w-4 transition-transform" />}
                    </div>
                  )}
                </div>
              </button>

              {hasSubItems && isExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l border-border/50 pl-2">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSectionChange?.(topic.id as SidebarTopic, item.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded text-sm transition-colors",
                        "hover:bg-accent/50 hover:text-accent-foreground",
                        activeSubsection === item.id && "bg-accent text-accent-foreground font-medium"
                      )}
                    >
                      <div className="font-medium text-xs text-blue-600 dark:text-blue-400 mb-0.5">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
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
          Use this sidebar to navigate through key concepts and explain each topic to your team.
        </p>
      </div>
    </aside>
  )
}
