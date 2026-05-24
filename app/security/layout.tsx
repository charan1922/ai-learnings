"use client"

import { Sidebar } from "@/components/sidebar"
import type { SecuritySubsection } from "@/components/sidebar"
import { usePathname } from "next/navigation"
import { handleNav } from "@/lib/navigate"

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const getActiveSubsection = (): SecuritySubsection => {
    if (pathname.includes("/introduction")) return "security-intro"
    if (pathname.includes("/guardrails")) return "security-guardrails"
    if (pathname.includes("/agent-security")) return "security-agent"
    if (pathname.includes("/principles")) return "security-principles"
    if (pathname.includes("/owasp")) return "security-owasp"
    if (pathname.includes("/career-advisor")) return "career-advisor"
    return "security-intro"
  }

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar
        activeSection="security"
        activeSubsection={getActiveSubsection()}
        onSectionChange={handleNav}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-4xl">{children}</div>
      </main>
    </div>
  )
}
