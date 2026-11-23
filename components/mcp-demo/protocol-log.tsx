'use client'

import { useEffect, useState } from 'react'

import { logStore } from '@/lib/mcp-demo/log-store'
import type { ServerLogEntry } from '@/lib/mcp-demo/server-log'

import { JsonView } from './json-view'
import { useLogEntries } from './use-host'

type View = 'browser' | 'server'

/** Polls /api/mcp-demo/server-log every 1.5 s while the "Server side" view is open. */
function useServerLog(active: boolean): { entries: ServerLogEntry[]; clear: () => Promise<void> } {
  const [entries, setEntries] = useState<ServerLogEntry[]>([])
  useEffect(() => {
    if (!active) return
    let since = 0
    let stopped = false
    const poll = async () => {
      try {
        const res = await fetch(`/api/mcp-demo/server-log?since=${since}`)
        if (!res.ok) return
        const { entries: fresh } = (await res.json()) as { entries: ServerLogEntry[] }
        if (stopped || fresh.length === 0) return
        since = fresh[fresh.length - 1].id
        setEntries((prev) => [...prev, ...fresh].slice(-500))
      } catch {
        // Dev server restarting — try again on the next tick.
      }
    }
    void poll()
    const timer = setInterval(poll, 1500)
    return () => {
      stopped = true
      clearInterval(timer)
    }
  }, [active])
  return {
    entries,
    clear: async () => {
      await fetch('/api/mcp-demo/server-log', { method: 'DELETE' })
      setEntries([])
    },
  }
}

/** A one-line label for a JSON-RPC message: its method, "result · complete", or "error". */
function summary(json: unknown): string {
  const obj = (json && typeof json === 'object' ? json : {}) as Record<string, unknown>
  if (typeof obj.method === 'string') return obj.method
  const result = obj.result as Record<string, unknown> | undefined
  if (result) return `result${typeof result.resultType === 'string' ? ` · ${result.resultType}` : ''}`
  if (obj.error) return 'error'
  return typeof json === 'string' ? json.slice(0, 40) : '—'
}

export function ProtocolLog() {
  const [view, setView] = useState<View>('browser')
  const browserEntries = useLogEntries()
  const server = useServerLog(view === 'server')

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-semibold">Protocol log</h2>
        <div className="flex items-center gap-1 text-xs">
          {(['browser', 'server'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2.5 py-1 rounded border border-border ${view === v ? 'bg-accent font-medium' : 'hover:bg-accent/60'}`}
            >
              {v === 'browser' ? 'Browser host' : 'Server side (all hosts)'}
            </button>
          ))}
          <button
            onClick={() => (view === 'browser' ? logStore.clear() : void server.clear())}
            className="px-2.5 py-1 rounded border border-border hover:bg-accent/60"
          >
            Clear
          </button>
        </div>
      </div>

      <ol className="space-y-1.5">
        {view === 'browser'
          ? [...browserEntries].reverse().map((e) => (
              <li key={e.id}>
                <details className="rounded border border-border text-xs">
                  <summary className="cursor-pointer px-2 py-1.5 flex items-center gap-2">
                    <span className={e.direction === 'out' ? 'text-blue-600' : 'text-emerald-600'}>
                      {e.direction === 'out' ? '→' : '←'}
                    </span>
                    <span className="font-mono text-muted-foreground w-20 truncate">{e.server}</span>
                    <span className="font-mono">{summary(e.json)}</span>
                    {e.httpStatus && <span className="ml-auto text-muted-foreground">HTTP {e.httpStatus}</span>}
                  </summary>
                  <div className="p-2 space-y-2">
                    {e.headers && Object.keys(e.headers).length > 0 && <JsonView value={e.headers} />}
                    <JsonView value={e.json} />
                  </div>
                </details>
              </li>
            ))
          : [...server.entries].reverse().map((e) => (
              <li key={e.id}>
                <details className="rounded border border-border text-xs">
                  <summary className="cursor-pointer px-2 py-1.5 flex items-center gap-2">
                    <span className={e.direction === 'in' ? 'text-blue-600' : 'text-emerald-600'}>
                      {e.direction === 'in' ? '⇢ in' : '⇠ out'}
                    </span>
                    <span className="font-mono text-muted-foreground w-20 truncate">{e.server}</span>
                    <span className="font-mono">{e.direction === 'in' ? (e.mcpMethod ?? summary(e.body)) : `HTTP ${e.status}`}</span>
                    {e.protocolVersion && <span className="ml-auto text-muted-foreground">{e.protocolVersion}</span>}
                  </summary>
                  <div className="p-2">
                    <JsonView value={e} />
                  </div>
                </details>
              </li>
            ))}
      </ol>
    </section>
  )
}
