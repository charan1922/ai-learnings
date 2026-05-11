"use client"

import { Sidebar } from "@/components/sidebar"
import { handleNav } from "@/lib/navigate"
import { usePathname } from "next/navigation" 

export default function VectorDbLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const activeSubsection =
    pathname.includes("/considerations") ? "vector-db-considerations" :
    pathname.includes("/demo") ? "vector-db-demo" :
    pathname.includes("/rag-example-2") ? "vector-db-rag-example-2" :
    pathname.includes("/rag-example") ? "vector-db-rag-example" :
    "vector-db-intro"

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar activeSection="vector-db" activeSubsection={activeSubsection} onSectionChange={handleNav} />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-4xl">{children}</div>
      </main>
    </div>
  )
}
