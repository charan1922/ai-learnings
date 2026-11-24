'use client'

import { useMemo } from 'react'

import type { LogEntry } from '@/lib/mcp-demo/log-store'
import { isServerName } from '@/lib/mcp-demo/server-info'
import type { ServerLogEntry } from '@/lib/mcp-demo/server-log'

import { useLogEntries } from '../../use-host'

export type AgentEvent = { type: string; [key: string]: unknown }

type Summary = { era: string; features: string; requests: number; toolCalls: string }

const FEATURE_METHODS: [string, string][] = [
  ['tools/call', 'tools'],
  ['prompts/get', 'prompts'],
  ['resources/read', 'resources'],
]

function summarize(rows: { method?: string; name?: string; version?: string }[], elicitation: boolean): Summary {
  const methods = new Set(rows.map((r) => r.method))
  const features = FEATURE_METHODS.filter(([m]) => methods.has(m)).map(([, f]) => f)
  if (elicitation) features.push('elicitation')
  const versions = [...new Set(rows.map((r) => r.version).filter(Boolean))]
  const calls = rows.filter((r) => r.method === 'tools/call' && r.name).map((r) => r.name)
  return {
    era: versions.join(', ') || '—',
    features: features.join(', ') || '—',
    requests: rows.length,
    toolCalls: [...new Set(calls)].join(', ') || '—',
  }
}

/** Our browser host vs the Agent SDK host, against the SAME three local servers. */
export function HostCompare({ agentLog, agentEvents }: { agentLog: ServerLogEntry[]; agentEvents: AgentEvent[] }) {
  const browserEntries = useLogEntries()

  const browser = useMemo(() => {
    const out = browserEntries.filter((e: LogEntry) => e.direction === 'out' && e.transport === 'http' && isServerName(e.server))
    const rows = out.map((e) => {
      const json = (e.json ?? {}) as { method?: string; params?: { name?: string } }
      return { method: json.method, name: json.params?.name, version: e.headers?.['mcp-protocol-version'] }
    })
    const elicitation = browserEntries.some(
      (e) => e.direction === 'in' && ((e.json as { result?: { resultType?: string } })?.result?.resultType === 'input_required'),
    )
    return summarize(rows, elicitation)
  }, [browserEntries])

  const agent = useMemo(() => {
    const rows = agentLog
      .filter((e) => e.direction === 'in')
      .map((e) => {
        const body = (e.body ?? {}) as { method?: string; params?: { name?: string } }
        return { method: e.mcpMethod ?? body.method, name: e.mcpName ?? body.params?.name, version: e.protocolVersion }
      })
    return summarize(rows, agentEvents.some((e) => e.type === 'elicitation'))
  }, [agentLog, agentEvents])

  const rows: [string, keyof Summary][] = [
    ['MCP-Protocol-Version used', 'era'],
    ['Features used', 'features'],
    ['MCP requests', 'requests'],
    ['Tool calls made', 'toolCalls'],
  ]
  return (
    <table className="w-full text-xs">
      <thead className="text-left text-muted-foreground">
        <tr>
          <th className="py-1 font-medium" />
          <th className="py-1 font-medium">Our browser host</th>
          <th className="py-1 font-medium">Claude Agent SDK host</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, key]) => (
          <tr key={key} className="border-t border-border">
            <td className="py-1 pr-2 text-muted-foreground">{label}</td>
            <td className="py-1 pr-2 font-mono">{String(browser[key])}</td>
            <td className="py-1 font-mono">{String(agent[key])}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
