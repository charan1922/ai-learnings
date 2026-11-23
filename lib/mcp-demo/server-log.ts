/**
 * Server-side request log: every JSON-RPC message that ARRIVES at /api/mcp/[server]
 * and every response sent back — from ANY host (our browser demo, VS Code, Claude Code,
 * MCP Inspector, the Agent SDK). The browser log only sees our own host's traffic.
 */
export interface ServerLogEntry {
  id: number
  time: string
  server: string
  /** 'in' = request from a host, 'out' = our response. */
  direction: 'in' | 'out'
  /** HTTP method (POST / GET / DELETE). */
  method?: string
  /** MCP-Protocol-Version header — shows which era the host speaks. */
  protocolVersion?: string
  /** Mcp-Method header, e.g. "tools/call" (2026-07-28 requests). */
  mcpMethod?: string
  /** Mcp-Name header, e.g. the tool name. */
  mcpName?: string
  userAgent?: string
  status?: number
  contentType?: string
  body?: unknown
}

type Store = { nextId: number; entries: ServerLogEntry[] }

const MAX_ENTRIES = 500

// Kept on globalThis so every route module — and Next.js dev reloads — share ONE log.
const g = globalThis as typeof globalThis & { __mcpDemoServerLog?: Store }
const store: Store = (g.__mcpDemoServerLog ??= { nextId: 1, entries: [] })

export function appendServerLog(entry: Omit<ServerLogEntry, 'id' | 'time'>): ServerLogEntry {
  const full: ServerLogEntry = { ...entry, id: store.nextId++, time: new Date().toISOString() }
  store.entries = [...store.entries, full].slice(-MAX_ENTRIES)
  return full
}

/** Entries newer than `since` (an entry id), optionally for one server. */
export function readServerLog(since = 0, server?: string): ServerLogEntry[] {
  return store.entries.filter((e) => e.id > since && (!server || e.server === server))
}

export function clearServerLog(): void {
  store.entries = []
}
