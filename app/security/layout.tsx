"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import type { SecuritySubsection } from "@/components/sidebar"
import { usePathname } from "next/navigation"

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const getActiveSubsection = (): SecuritySubsection => {
    if (pathname.includes("/introduction")) return "security-intro"
    if (pathname.includes("/guardrails")) return "security-guardrails"
    if (pathname.includes("/principles")) return "security-principles"
    if (pathname.includes("/owasp")) return "security-owasp"
    return "security-intro"
  }

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar
        activeSection="security"
        activeSubsection={getActiveSubsection()}
        onSectionChange={(section, subsection) => {
          if (subsection === "security-intro") {
            window.location.href = "/security/introduction"
          } else if (subsection === "security-guardrails") {
            window.location.href = "/security/guardrails"
          } else if (subsection === "security-principles") {
            window.location.href = "/security/principles"
          } else if (subsection === "security-owasp") {
            window.location.href = "/security/owasp"
          }
        }}
      />

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-4xl">{children}</div>
      </main>
    </div>
  )
}
