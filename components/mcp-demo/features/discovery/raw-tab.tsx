'use client'

import { useState } from 'react'

import { createSseParser } from '@/lib/mcp-demo/logging-fetch'

import { JsonView } from '../../json-view'
import type { TabProps } from '../types'

/** Presets from the MCP Architecture lesson, made complete JSON-RPC messages (jsonrpc + id). */
const META = {
  'io.modelcontextprotocol/protocolVersion': '2026-07-28',
  'io.modelcontextprotocol/clientCapabilities': {},
}
const PRESETS: Record<string, unknown> = {
  'tools/list': { jsonrpc: '2.0', id: 1, method: 'tools/list', params: { _meta: META } },
  'stateless tools/call': {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'searchFlights',
      arguments: { origin: 'New York', destination: 'Barcelona', date: '2027-06-15' },
      _meta: META,
    },
  },
  'server/discover': { jsonrpc: '2.0', id: 3, method: 'server/discover', params: { _meta: META } },
}

type RawResponse = { status: number; headers: Record<string, string>; body: unknown[] }

/**
 * Raw JSON-RPC: type the message yourself and send it with plain fetch — no Client, no handshake.
 * Shows that MCP is just JSON over HTTP, plus the headers the 2026-07-28 HTTP transport requires.
 */
export function RawTab({ target }: TabProps) {
  const [body, setBody] = useState(JSON.stringify(PRESETS['stateless tools/call'], null, 2))
  const [dropMethodHeader, setDropMethodHeader] = useState(false)
  const [response, setResponse] = useState<RawResponse>()
  const [sentHeaders, setSentHeaders] = useState<Record<string, string>>()
  const [error, setError] = useState<string>()

  const send = async () => {
    setError(undefined)
    setResponse(undefined)
    let message: { method?: string; params?: { name?: string } }
    try {
      message = JSON.parse(body)
    } catch {
      return setError('That is not valid JSON.')
    }

    // The HTTP transport repeats the method (and the tool name) in headers so proxies can route without parsing.
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      'MCP-Protocol-Version': '2026-07-28',
    }
    if (message.method && !dropMethodHeader) headers['Mcp-Method'] = message.method
    if (message.params?.name) headers['Mcp-Name'] = message.params.name
    setSentHeaders(headers)

    try {
      const res = await fetch(target.target.url, { method: 'POST', headers, body })
      const text = await res.text()
      const messages: unknown[] = []
      if ((res.headers.get('content-type') ?? '').includes('text/event-stream')) {
        createSseParser((json) => messages.push(json))(text) // the reply as SSE events
      } else if (text) {
        messages.push(JSON.parse(text))
      }
      setResponse({ status: res.status, headers: Object.fromEntries(res.headers.entries()), body: messages })
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-muted-foreground">Presets:</span>
        {Object.keys(PRESETS).map((name) => (
          <button
            key={name}
            onClick={() => setBody(JSON.stringify(PRESETS[name], null, 2))}
            className="px-2.5 py-1 rounded border border-border font-mono hover:bg-accent/60"
          >
            {name}
          </button>
        ))}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={14}
        className="w-full rounded-md border border-border bg-background p-2 font-mono text-xs"
      />
      <div className="flex items-center gap-4 text-xs">
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={dropMethodHeader} onChange={(e) => setDropMethodHeader(e.target.checked)} />
          drop the <span className="font-mono">Mcp-Method</span> header
        </label>
        <button onClick={() => void send()} className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground">
          POST {target.target.url}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400 break-words">{error}</p>}
      {sentHeaders && (
        <div>
          <p className="text-xs font-semibold mb-1">request headers</p>
          <JsonView value={sentHeaders} />
        </div>
      )}
      {response && (
        <div className="space-y-2">
          <p className="text-xs font-semibold">HTTP {response.status}</p>
          <JsonView value={response.headers} />
          <p className="text-xs font-semibold">body</p>
          {response.body.map((m, i) => (
            <JsonView key={i} value={m} />
          ))}
        </div>
      )}
    </div>
  )
}
