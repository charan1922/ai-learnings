"use client"

import { useState } from "react"
import {
  Shield,
  ShieldCheck,
  Database,
  Scissors,
  GitBranch,
  ChevronRight,
  ChevronDown,
  Bot,
  BookOpen,
  Bug,
  Plug,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type SidebarTopic =
  | "security"
  | "guardrails"
  | "vector-db"
  | "embeddings"
  | "chunking"
  | "graph-rag"
  | "agent-it"
  | "agent-it-langgraph"
  | "prompt-engineering"
  | "prompt-debugging"
  | "mcp"

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
  guardrails: [
    { id: "guardrails-openai",       label: "OpenAI Moderation",   description: "Free harm-classification API" },
    { id: "guardrails-ai",           label: "Guardrails AI",       description: "Validators, Guards & Hub" },
    { id: "guardrails-nemo",         label: "NeMo Guardrails",     description: "Programmable rails (Colang)" },
    { id: "guardrails-safe-chatbot", label: "Safe Chatbot (Project)", description: "Input/output filtering demo" },
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
  chunking: [
    { id: "chunking-strategies", label: "Chunking Strategies", description: "Fixed · Overlap · Structure · Semantic" },
    { id: "chunking-hybrid",     label: "Hybrid Retrieval",    description: "BM25 + Dense + RRF (Qdrant)" },
  ],
  "prompt-debugging": [
    { id: "prompt-debugging-overview", label: "Prompt Debugging",   description: "Diagnose & refine AI outputs (CodeStringers)" },
    { id: "prompt-debugging-steps",    label: "5 Debugging Steps",  description: "Reproduce → Isolate → Refine → Evaluate (newline)" },
    { id: "prompt-versioning",         label: "Prompt Versioning",  description: "Track, branch & roll back prompts (Agenta)" },
    { id: "prompt-playground",         label: "Testing Playground", description: "Compare prompt versions & outputs (live)" },
  ],
  mcp: [
    { id: "mcp-server", label: "MCP Server", description: "Tools, Resources & Prompts" },
    { id: "mcp-client", label: "MCP Client", description: "Host, Elicitation & Form/URL Modes" },
    { id: "mcp-architecture", label: "MCP Architecture", description: "Coming soon" },
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
    id: "guardrails",
    label: "Guardrails",
    description: "LLM Safety Frameworks",
    icon: ShieldCheck,
    color: "text-teal-500",
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
    hasSubItems: true,
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
  {
    id: "prompt-debugging",
    label: "Prompt Debugging & Versioning",
    description: "Diagnose, Refine & Track Prompts",
    icon: Bug,
    color: "text-rose-500",
    hasSubItems: true,
  },
  {
    id: "mcp",
    label: "MCP",
    description: "Model Context Protocol",
    icon: Plug,
    color: "text-cyan-500",
    hasSubItems: true,
  },
] as const

export function Sidebar({ activeSection, activeSubsection, onSectionChange }: SidebarProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(activeSection || null)

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-muted/30 sticky top-0 h-screen overflow-y-auto flex flex-col">
      <div className="h-11 px-3 flex items-center gap-2 border-b border-border">
        <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
          AI
        </div>
        <div className="min-w-0 leading-tight">
          <div className="text-[13px] font-semibold truncate">AI/RAG Concepts</div>
          <div className="text-[10px] text-muted-foreground truncate">Learning Guide</div>
        </div>
      </div>

      <nav className="flex-1 py-2 px-1.5 space-y-px">
        {topics.map((topic) => {
          const Icon = topic.icon
          const isExpanded = expandedItem === topic.id
          const isActive = activeSection === topic.id
          const hasSubItems = "hasSubItems" in topic && topic.hasSubItems
          const items = subItems[topic.id] ?? []

          return (
            <div key={topic.id}>
              <button
                title={topic.description}
                onClick={() => {
                  if (hasSubItems) {
                    setExpandedItem(isExpanded ? null : topic.id)
                  } else {
                    setExpandedItem(topic.id)
                    onSectionChange?.(topic.id as SidebarTopic)
                  }
                }}
                className={cn(
                  "w-full h-8 px-2 flex items-center gap-2 rounded text-left text-[13px] transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive ? "font-semibold text-foreground" : "text-foreground/80",
                  isActive && !hasSubItems && "bg-accent"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", topic.color)} />
                <span className="flex-1 truncate">{topic.label}</span>
                {hasSubItems &&
                  (isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  ))}
              </button>

              {hasSubItems && isExpanded && (
                <div className="ml-[17px] my-0.5 border-l border-border">
                  {items.map((item) => {
                    const isSubActive = activeSubsection === item.id && isActive
                    return (
                      <button
                        key={item.id}
                        title={item.description}
                        onClick={() => onSectionChange?.(topic.id as SidebarTopic, item.id)}
                        className={cn(
                          "w-full h-7 pl-3 pr-2 -ml-px flex items-center text-left text-[12.5px] border-l-2 transition-colors",
                          isSubActive
                            ? "border-primary bg-accent text-foreground font-medium"
                            : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/60"
                        )}
                      >
                        <span className="truncate">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
