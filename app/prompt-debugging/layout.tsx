"use client"

import { Sidebar } from "@/components/sidebar"
import { usePathname } from "next/navigation"
import { handleNav } from "@/lib/navigate"

export default function PromptDebuggingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const getActiveSubsection = () => {
    if (pathname.includes("/debugging-steps")) return "prompt-debugging-steps"
    if (pathname.includes("/versioning")) return "prompt-versioning"
    if (pathname.includes("/playground")) return "prompt-playground"
    return "prompt-debugging-overview"
  }

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar
        activeSection="prompt-debugging"
        activeSubsection={getActiveSubsection()}
        onSectionChange={handleNav}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-4xl">{children}</div>
      </main>
    </div>
  )
}
