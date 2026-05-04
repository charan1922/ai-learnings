import type { SidebarTopic } from "@/components/sidebar"

export function handleNav(section: SidebarTopic, subsection?: string) {
  if (section === "security") {
    if (subsection === "security-guardrails") window.location.href = "/security/guardrails"
    else if (subsection === "security-agent") window.location.href = "/security/agent-security"
    else if (subsection === "security-principles") window.location.href = "/security/principles"
    else if (subsection === "security-owasp") window.location.href = "/security/owasp"
    else window.location.href = "/security/introduction"
  } else if (section === "vector-db") {
    if (subsection === "vector-db-considerations") window.location.href = "/vector-db/considerations"
    else window.location.href = "/vector-db/introduction"
  } else if (section === "embeddings") {
    window.location.href = "/embeddings"
  } else if (section === "chunking") {
    window.location.href = "/chunking"
  } else if (section === "graph-rag") {
    window.location.href = "/graph-rag"
  }
}
