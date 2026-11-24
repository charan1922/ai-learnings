'use client'

import { useState } from 'react'

import { REMOTE_SERVERS, type RemoteServer } from '@/lib/mcp-demo/remotes'

import type { PanelProps } from '../types'

const proxyUrl = (id: string) => `/api/mcp-demo/proxy/${id}`

/** One host, many clients: connect the same page to public remote MCP servers, on demand. */
export function RemoteServersPanel({ host, clients }: PanelProps) {
  // Pre-tick "use proxy" for servers that browsers can't call directly.
  const [useProxy, setUseProxy] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(REMOTE_SERVERS.map((r) => [r.id, !r.corsOk])),
  )

  const connect = (remote: RemoteServer) =>
    host.connect({ id: remote.id, title: remote.title, url: useProxy[remote.id] ? proxyUrl(remote.id) : remote.url })

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Connections start only when you press Connect, so the page never waits on other sites. A connected remote joins the
        host cards and the Explorer — its Tools tab works the same way.
      </p>
      {REMOTE_SERVERS.map((remote) => {
        const row = clients.find((c) => c.target.id === remote.id)
        const connected = row?.status === 'connected'
        const directCall = row ? !row.target.url.startsWith('/api/') : !useProxy[remote.id]
        // A browser reports a CORS block only as a generic network failure.
        const corsBlocked = row?.status === 'error' && directCall && !remote.corsOk
        return (
          <div key={remote.id} className="rounded-lg border border-border p-3 text-xs space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{remote.title}</span>
              <span className="font-mono text-muted-foreground truncate">{remote.url}</span>
              {row?.era && (
                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
                  {row.era}
                </span>
              )}
              {row?.sessionId && (
                <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">
                  session {row.sessionId.slice(0, 8)}…
                </span>
              )}
              {row && <span className="text-muted-foreground">{row.status}</span>}
            </div>
            <p className="text-muted-foreground">{remote.note}</p>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={useProxy[remote.id] ?? false}
                  disabled={connected}
                  onChange={(e) => setUseProxy((prev) => ({ ...prev, [remote.id]: e.target.checked }))}
                />
                use our proxy
              </label>
              {connected ? (
                <button onClick={() => void host.disconnect(remote.id)} className="px-2.5 py-1 rounded border border-border hover:bg-accent/60">
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => void connect(remote)}
                  disabled={row?.status === 'connecting'}
                  className="px-2.5 py-1 rounded bg-primary text-primary-foreground disabled:opacity-50"
                >
                  {row?.status === 'connecting' ? 'Connecting…' : 'Connect'}
                </button>
              )}
            </div>
            {corsBlocked && (
              <p className="text-amber-700 dark:text-amber-300">
                Blocked by CORS: the server sent no <span className="font-mono">Access-Control-Allow-Origin</span>, so the browser
                refused the answer. Tick “use our proxy” and connect again.
              </p>
            )}
            {row?.error && <p className="text-red-600 dark:text-red-400 break-words">{row.error}</p>}
          </div>
        )
      })}
    </div>
  )
}
