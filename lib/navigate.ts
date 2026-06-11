import type { SidebarTopic } from "@/components/sidebar"

export function handleNav(section: SidebarTopic, subsection?: string) {
  if (section === "security") {
    if (subsection === "security-guardrails") window.location.href = "/security/guardrails"
    else if (subsection === "security-agent") window.location.href = "/security/agent-security"
    else if (subsection === "security-principles") window.location.href = "/security/principles"
    else if (subsection === "security-owasp") window.location.href = "/security/owasp"
    else if (subsection === "career-advisor") window.location.href = "/security/career-advisor"
    else window.location.href = "/security/introduction"
  } else if (section === "guardrails") {
    if (subsection === "guardrails-ai") window.location.href = "/guardrails/guardrails-ai"
    else if (subsection === "guardrails-nemo") window.location.href = "/guardrails/nemo"
    else if (subsection === "guardrails-safe-chatbot") window.location.href = "/guardrails/safe-chatbot"
    else window.location.href = "/guardrails/openai-moderation"
  } else if (section === "vector-db") {
    if (subsection === "vector-db-considerations") window.location.href = "/vector-db/considerations"
    else if (subsection === "vector-db-demo") window.location.href = "/vector-db/demo"
    else if (subsection === "vector-db-rag-example-2") window.location.href = "/vector-db/rag-example-2"
    else if (subsection === "vector-db-rag-example") window.location.href = "/vector-db/rag-example"
    else window.location.href = "/vector-db/introduction"
  } else if (section === "embeddings") {
    window.location.href = "/embeddings"
  } else if (section === "chunking") {
    if (subsection === "chunking-hybrid") window.location.href = "/chunking/hybrid-retrieval"
    else window.location.href = "/chunking"
  } else if (section === "graph-rag") {
    window.location.href = "/graph-rag"
  } else if (section === "agent-it") {
    if (subsection === "agent-it-knowledgebase") window.location.href = "/agent-it/knowledgebase"
    else window.location.href = "/agent-it"
  } else if (section === "agent-it-langgraph") {
    window.location.href = "/agent-it-langgraph"
  } else if (section === "prompt-engineering") {
    if (subsection === "prompt-engineering-guide") window.location.href = "/prompt-engineering/prompt-engineering-guide"
    else if (subsection === "smart-qa") window.location.href = "/prompt-engineering/smart-qa"
    else if (subsection === "context-engineering") window.location.href = "/prompt-engineering/context-engineering"
    else window.location.href = "/prompt-engineering/prompt-patterns"
  } else if (section === "prompt-debugging") {
    if (subsection === "prompt-debugging-steps") window.location.href = "/prompt-debugging/debugging-steps"
    else if (subsection === "prompt-versioning") window.location.href = "/prompt-debugging/versioning"
    else if (subsection === "prompt-playground") window.location.href = "/prompt-debugging/playground"
    else window.location.href = "/prompt-debugging/debugging"
  }
}
