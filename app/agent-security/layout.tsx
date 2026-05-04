"use client"

import { Sidebar } from "@/components/sidebar"

export default function AgentSecurityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar
        activeSection="agent-security"
        onSectionChange={(section) => {
          if (section === "security") window.location.href = "/security/introduction"
          else if (section === "vector-db") window.location.href = "/vector-db"
          else if (section === "embeddings") window.location.href = "/embeddings"
          else if (section === "chunking") window.location.href = "/chunking"
          else if (section === "graph-rag") window.location.href = "/graph-rag"
          else if (section === "agent-security") window.location.href = "/agent-security"
        }}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-4xl">{children}</div>
      </main>
    </div>
  )
}
