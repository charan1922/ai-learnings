"use client"

import { Sidebar } from "@/components/sidebar"

export default function VectorDbLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar
        activeSection="vector-db"
        onSectionChange={(section, subsection) => {
          if (section === "security") {
            window.location.href = subsection === "security-guardrails" ? "/security/guardrails"
              : subsection === "security-agent" ? "/security/agent-security"
              : subsection === "security-principles" ? "/security/principles"
              : subsection === "security-owasp" ? "/security/owasp"
              : "/security/introduction"
          } else if (section === "vector-db") {
            window.location.href = "/vector-db"
          } else if (section === "embeddings") {
            window.location.href = "/embeddings"
          } else if (section === "chunking") {
            window.location.href = "/chunking"
          } else if (section === "graph-rag") {
            window.location.href = "/graph-rag"
          }
        }}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-4xl">{children}</div>
      </main>
    </div>
  )
}
