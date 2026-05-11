"use client"

import { Sidebar } from "@/components/sidebar"
import { handleNav } from "@/lib/navigate"

export default function AgentITLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar activeSection="agent-it" onSectionChange={handleNav} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
