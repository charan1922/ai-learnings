"use client"

import { useState } from "react"
import {
  Shield,
  Database,
  Zap,
  Scissors,
  GitBranch,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type SidebarTopic =
  | "security"
  | "vector-db"
  | "embeddings"
  | "chunking"
  | "graph-rag"

interface SidebarProps {
  activeSection?: SidebarTopic
  onSectionChange?: (section: SidebarTopic) => void
}

const topics = [
  {
    id: "security",
    label: "Security & Responsible AI",
    description: "Guardrails & Safety",
    icon: Shield,
    color: "text-red-500",
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

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [expandedItem, setExpandedItem] = useState<SidebarTopic | null>(
    activeSection || null
  )

  return (
    <aside className="w-64 border-r border-border bg-muted/40 p-6">
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
          const isActive = expandedItem === topic.id
          return (
            <button
              key={topic.id}
              onClick={() => {
                setExpandedItem(isActive ? null : (topic.id as SidebarTopic))
                onSectionChange?.(topic.id as SidebarTopic)
              }}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={cn("h-5 w-5 flex-shrink-0", topic.color)} />
                  <div className="min-w-0">
                    <div className="font-medium text-sm">{topic.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {topic.description}
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 flex-shrink-0 transition-transform",
                    isActive && "rotate-90"
                  )}
                />
              </div>
            </button>
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
