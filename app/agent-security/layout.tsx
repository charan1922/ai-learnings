"use client"

import { Sidebar } from "@/components/sidebar"
import { handleNav } from "@/lib/navigate"

export default function AgentSecurityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar activeSection="security" activeSubsection="security-agent" onSectionChange={handleNav} />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-4xl">{children}</div>
      </main>
    </div>
  )
}
