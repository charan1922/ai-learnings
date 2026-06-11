"use client"

import { Sidebar } from "@/components/sidebar"
import { usePathname } from "next/navigation"
import { handleNav } from "@/lib/navigate"

export default function GuardrailsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const getActiveSubsection = () => {
    if (pathname.includes("/guardrails-ai")) return "guardrails-ai"
    if (pathname.includes("/nemo")) return "guardrails-nemo"
    if (pathname.includes("/safe-chatbot")) return "guardrails-safe-chatbot"
    return "guardrails-openai"
  }

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar
        activeSection="guardrails"
        activeSubsection={getActiveSubsection()}
        onSectionChange={handleNav}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-4xl">{children}</div>
      </main>
    </div>
  )
}
