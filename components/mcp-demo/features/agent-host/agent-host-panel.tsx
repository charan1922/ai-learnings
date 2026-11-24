'use client'

import { useEffect, useRef, useState } from 'react'

import type { ServerLogEntry } from '@/lib/mcp-demo/server-log'

import { JsonView } from '../../json-view'
import { Markdown } from '../../markdown'
import { HostCompare, type AgentEvent } from './host-compare'

/** The lesson's short version of the Barcelona instruction (MCP Server lesson). */
const DEFAULT_PROMPT =
  'Plan a trip for two from New York to Barcelona, June 15–22, 2027, with a $3,000 budget. Search for flights and hotels, check the weather, and propose one package.'

/**
 * A second MCP host we didn't write: the Claude Agent SDK, running on the Next.js server.
 * Left: its event stream. Right: what arrived at OUR servers from it (server-side log).
 */
export function AgentHostPanel() {
  const [available, setAvailable] = useState<boolean>()
  const [model, setModel] = useState<{ provider?: string; model?: string }>({})
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [events, setEvents] = useState<AgentEvent[]>([])
  const [serverLog, setServerLog] = useState<ServerLogEntry[]>([])
  const [running, setRunning] = useState(false)
  const abort = useRef<AbortController | undefined>(undefined)
  const sinceLogId = useRef<number | undefined>(undefined)

  useEffect(() => {
    fetch('/api/mcp-demo/agent-host')
      .then((r) => r.json() as Promise<{ available: boolean; provider?: string; model?: string }>)
      .then((r) => {
        setAvailable(r.available)
        setModel({ provider: r.provider, model: r.model })
      })
      .catch(() => setAvailable(false))
  }, [])

  /** Server-side log since the run started, minus our own browser's requests. */
  const refreshServerLog = async () => {
    if (sinceLogId.current === undefined) return
    const res = await fetch(`/api/mcp-demo/server-log?since=${sinceLogId.current}`)
    if (!res.ok) return
    const { entries } = (await res.json()) as { entries: ServerLogEntry[] }
    // Keep the agent's requests ('in' without a browser user-agent) and the responses to them.
    const agentIds = new Set<number>()
    entries.forEach((e, i) => {
      if (e.direction === 'in' && !e.userAgent?.includes('Mozilla')) {
        agentIds.add(e.id)
        const reply = entries.slice(i + 1).find((r) => r.direction === 'out' && r.server === e.server)
        if (reply) agentIds.add(reply.id)
      }
    })
    setServerLog(entries.filter((e) => agentIds.has(e.id)))
  }

  // While running, poll the server log so the right column fills in live.
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => void refreshServerLog(), 1500)
    return () => clearInterval(timer)
  }, [running])

  const run = async () => {
    const controller = new AbortController()
    abort.current = controller
    setEvents([])
    setServerLog([])
    setRunning(true)
    try {
      const res = await fetch('/api/mcp-demo/agent-host', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      })
      if (!res.ok || !res.body) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setEvents([{ type: 'error', message: body.error ?? `HTTP ${res.status}` }])
        return
      }
      // NDJSON: one JSON event per line, read as it arrives.
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.trim()) continue
          const event = JSON.parse(line) as AgentEvent
          if (event.type === 'start') sinceLogId.current = Number(event.sinceLogId)
          setEvents((prev) => [...prev, event])
        }
      }
    } catch (e) {
      setEvents((prev) => [...prev, { type: 'error', message: controller.signal.aborted ? 'Stopped.' : String(e) }])
    } finally {
      setRunning(false)
      await refreshServerLog()
    }
  }

  if (available === false) {
    return (
      <p className="text-sm text-muted-foreground">
        This host is off: the server has no <span className="font-mono">MIMO_API_KEY</span> or{' '}
        <span className="font-mono">ANTHROPIC_API_KEY</span>. Add one to <span className="font-mono">.env</span> (see{' '}
        <span className="font-mono">.env.example</span>) and restart <span className="font-mono">pnpm dev</span>. It never uses a
        personal Claude login.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        The agent may use <strong>only</strong> our three servers&apos; MCP tools — shell, files and web are switched off in the
        route, not in the prompt. Each run costs real tokens (max 10 turns).
        {model.model && (
          <>
            {' '}
            Model: <span className="font-mono">{model.model}</span> via {model.provider}.
          </>
        )}
      </p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        disabled={running}
        className="w-full rounded-md border border-border bg-background p-2 text-sm"
      />
      <div className="flex gap-2">
        <button
          onClick={() => void run()}
          disabled={running || available === undefined}
          className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
        >
          {running ? 'Running…' : 'Run the Agent SDK host'}
        </button>
        <button onClick={() => abort.current?.abort()} disabled={!running} className="text-sm px-3 py-1.5 rounded-md border border-border disabled:opacity-50">
          Stop
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border p-3 space-y-1.5 text-xs">
          <p className="text-sm font-semibold">The agent&apos;s events</p>
          {events.map((e, i) => (
            <AgentEventLine key={i} event={e} />
          ))}
          {events.length === 0 && <p className="text-muted-foreground">Press Run.</p>}
        </div>
        <div className="rounded-lg border border-border p-3 space-y-1.5 text-xs">
          <p className="text-sm font-semibold">What reached our servers (server-side log)</p>
          {serverLog.map((e) => (
            <details key={e.id}>
              <summary className="cursor-pointer font-mono">
                {e.direction === 'in'
                  ? `⇢ ${e.server} ${e.mcpMethod ?? (e.body as { method?: string } | undefined)?.method ?? e.method}${e.mcpName ? ` ${e.mcpName}` : ''} · ${e.protocolVersion ?? 'no MCP-Protocol-Version'}`
                  : `⇠ ${e.server} HTTP ${e.status}`}
              </summary>
              <JsonView value={e} />
            </details>
          ))}
          {serverLog.length === 0 && <p className="text-muted-foreground">Nothing yet.</p>}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-1">Two hosts, same servers</p>
        <HostCompare agentLog={serverLog} agentEvents={events} />
      </div>
    </div>
  )
}

function AgentEventLine({ event }: { event: AgentEvent }) {
  switch (event.type) {
    case 'init': {
      const servers = (event.mcpServers as { name: string; status: string }[] | undefined) ?? []
      return <p className="text-muted-foreground">init — MCP servers: {servers.map((s) => `${s.name}: ${s.status}`).join(', ')}</p>
    }
    case 'text':
      return <Markdown text={String(event.text)} />
    case 'tool_call':
      return (
        <details>
          <summary className="cursor-pointer font-mono">→ {String(event.name)}</summary>
          <JsonView value={event.input} />
        </details>
      )
    case 'tool_result':
      return (
        <details className={event.isError ? 'text-red-600 dark:text-red-400' : ''}>
          <summary className="cursor-pointer font-mono">← tool result{event.isError ? ' (error)' : ''}</summary>
          <pre className="whitespace-pre-wrap">{String(event.content)}</pre>
        </details>
      )
    case 'elicitation':
      return (
        <p className="text-amber-700 dark:text-amber-300">
          {String(event.server)} asked for input ({String(event.mode)} mode): “{String(event.message)}” — this host has no dialog, so
          it answered {String(event.answered)}.
        </p>
      )
    case 'result':
      return (
        <p className="text-muted-foreground">
          done ({String(event.subtype)}) — {String(event.numTurns)} turns, ${Number(event.costUsd ?? 0).toFixed(4)}
        </p>
      )
    case 'error':
      return <p className="text-red-600 dark:text-red-400 break-words">{String(event.message)}</p>
    default:
      return null
  }
}
