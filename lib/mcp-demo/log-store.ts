/**
 * Browser-side protocol log: every JSON-RPC message OUR host sends and receives.
 * (server-log.ts is the server-side twin — it sees traffic from every host.)
 */
export interface LogEntry {
  id: number
  time: string
  server: string
  /** 'out' = host → server, 'in' = server → host. */
  direction: 'out' | 'in'
  transport: 'http' | 'stdio'
  httpStatus?: number
  /** Only the MCP headers (mcp-protocol-version, mcp-method, mcp-name, mcp-session-id). */
  headers?: Record<string, string>
  json: unknown
}

type Listener = () => void

const MAX_ENTRIES = 1000

let entries: readonly LogEntry[] = []
let nextId = 1
const listeners = new Set<Listener>()
const emit = () => listeners.forEach((listener) => listener())

/**
 * Shaped for React's useSyncExternalStore: `subscribe` + `getSnapshot`.
 * Every change makes a NEW array, so React sees the change and re-renders.
 */
export const logStore = {
  append(entry: Omit<LogEntry, 'id' | 'time'>): void {
    entries = [...entries, { ...entry, id: nextId++, time: new Date().toISOString() }].slice(-MAX_ENTRIES)
    emit()
  },
  clear(): void {
    entries = []
    emit()
  },
  getSnapshot(): readonly LogEntry[] {
    return entries
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
