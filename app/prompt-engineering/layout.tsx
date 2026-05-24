"use client"

import { Sidebar } from "@/components/sidebar"
import { usePathname } from "next/navigation"
import { handleNav } from "@/lib/navigate"

export default function PromptEngineeringLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const getActiveSubsection = () => {
    if (pathname.includes("/prompt-engineering-guide")) return "prompt-engineering-guide"
    if (pathname.includes("/smart-qa")) return "smart-qa"
    if (pathname.includes("/context-engineering")) return "context-engineering"
    return "prompt-patterns"
  }

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar
        activeSection="prompt-engineering"
        activeSubsection={getActiveSubsection()}
        onSectionChange={handleNav}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-4xl">{children}</div>
      </main>
    </div>
  )
}
