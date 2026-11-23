"use client"

import { Sidebar } from "@/components/sidebar"
import { usePathname } from "next/navigation"
import { handleNav } from "@/lib/navigate"

export default function McpLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const getActiveSubsection = () => {
    if (pathname.includes("/mcp-client")) return "mcp-client"
    if (pathname.includes("/mcp-architecture")) return "mcp-architecture"
    if (pathname.includes("/live-demo")) return "mcp-live-demo"
    return "mcp-server"
  }

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar
        activeSection="mcp"
        activeSubsection={getActiveSubsection()}
        onSectionChange={handleNav}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-4xl">{children}</div>
      </main>
    </div>
  )
}
