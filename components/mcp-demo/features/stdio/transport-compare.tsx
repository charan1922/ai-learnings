'use client'

import { useState } from 'react'

import { logStore, type LogEntry } from '@/lib/mcp-demo/log-store'
import { LOCAL_TARGETS } from '@/lib/mcp-demo/host'

import { JsonView } from '../../json-view'
import type { PanelProps } from '../types'

type Line = { dir: 'stdin' | 'stdout'; json: unknown }
type StdioRun = { tools: unknown[]; lines: Line[]; durationMs: number }
type HttpRun = { tools: unknown[]; entries: LogEntry[] }

/** The tool lists, compared as JSON — request ids never appear in them, so they don't matter. */
const sameTools = (a: unknown[], b: unknown[]) => JSON.stringify(a) === JSON.stringify(b)

/**
 * MCP Architecture lesson: the data layer (the JSON-RPC message) stays the same,
 * only the transport layer (how it travels) changes. One tools/list over stdio, one over HTTP.
 */
export function TransportCompare({ clients }: PanelProps) {
  const [server, setServer] = useState('travel')
  const [stdio, setStdio] = useState<StdioRun>()
  const [http, setHttp] = useState<HttpRun>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()

  const runBoth = async () => {
    const client = clients.find((c) => c.target.id === server && c.status === 'connected')?.client
    if (!client) return setError(`The ${server} client is not connected.`)
    setBusy(true)
    setError(undefined)
    setStdio(undefined)
    setHttp(undefined)
    try {
      // Right: the browser client over Streamable HTTP. Its log entries carry the HTTP headers.
      const before = logStore.getSnapshot().length
      const httpTools = (await client.listTools()).tools
      const entries = logStore.getSnapshot().slice(before).filter((e) => e.server === server)
      setHttp({ tools: httpTools, entries })

      // Left: a separate process over stdio (started by the bridge route, stopped right after).
      const res = await fetch('/api/mcp-demo/stdio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server, op: 'tools/list' }),
      })
      const body = (await res.json()) as { result?: { tools: unknown[] }; lines?: Line[]; durationMs?: number; error?: string }
      if (!res.ok || !body.result) throw new Error(body.error ?? `HTTP ${res.status}`)
      setStdio({ tools: body.result.tools, lines: body.lines ?? [], durationMs: body.durationMs ?? 0 })
      // Into the protocol log too, marked as stdio.
      for (const line of body.lines ?? []) {
        logStore.append({ server, direction: line.dir === 'stdin' ? 'out' : 'in', transport: 'stdio', json: line.json })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const identical = stdio && http ? sameTools(stdio.tools, http.tools) : undefined
  const mcpJson = {
    servers: {
      [`ai-learnings-${server}-stdio`]: { type: 'stdio', command: 'pnpm', args: ['--dir', '${workspaceFolder}', 'mcp:stdio', server] },
      [`ai-learnings-${server}-http`]: { type: 'http', url: `http://localhost:6060/api/mcp/${server}` },
    },
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-muted-foreground">Server:</span>
        {LOCAL_TARGETS.map((t) => (
          <button
            key={t.id}
            onClick={() => setServer(t.id)}
            className={`px-2.5 py-1 rounded border border-border ${server === t.id ? 'bg-accent font-semibold' : 'hover:bg-accent/60'}`}
          >
            {t.title}
          </button>
        ))}
        <button
          onClick={() => void runBoth()}
          disabled={busy}
          className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
        >
          {busy ? 'Running…' : 'Run both (tools/list)'}
        </button>
        {identical !== undefined && (
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${identical ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'}`}
          >
            {identical ? 'Identical tool lists' : 'Tool lists differ'}
          </span>
        )}
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400 break-words">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border p-3 space-y-2">
          <p className="text-sm font-semibold">stdio — lines on stdin / stdout</p>
          {stdio ? (
            <>
              <p className="text-xs text-muted-foreground">Child process, {stdio.durationMs} ms including start-up. No HTTP, no headers.</p>
              {stdio.lines.map((l, i) => (
                <div key={i} className="space-y-0.5">
                  <p className="text-[11px] font-mono text-muted-foreground">{l.dir === 'stdin' ? '→ stdin' : '← stdout'}</p>
                  <JsonView value={l.json} />
                </div>
              ))}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Press Run both.</p>
          )}
        </div>
        <div className="rounded-lg border border-border p-3 space-y-2">
          <p className="text-sm font-semibold">Streamable HTTP — POST with headers</p>
          {http ? (
            http.entries.map((e) => (
              <div key={e.id} className="space-y-0.5">
                <p className="text-[11px] font-mono text-muted-foreground">
                  {e.direction === 'out' ? '→ POST' : `← HTTP ${e.httpStatus ?? ''}`}
                </p>
                {e.headers && Object.keys(e.headers).length > 0 && <JsonView value={e.headers} />}
                <JsonView value={e.json} />
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">Press Run both.</p>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        The stdio server is a <strong>separate process with its own memory</strong>. A change made through the dev server (for
        example Add searchHotels in Tool-list changes) is not there — then the lists differ.
      </p>
      <div>
        <p className="text-xs font-semibold mb-1">VS Code .vscode/mcp.json — the same server, both transports</p>
        <JsonView value={mcpJson} />
      </div>
    </div>
  )
}
