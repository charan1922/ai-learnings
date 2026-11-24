import type { HostClient } from '@/lib/mcp-demo/host'

const DOT: Record<HostClient['status'], string> = {
  connecting: 'bg-amber-400 animate-pulse',
  connected: 'bg-emerald-500',
  error: 'bg-red-500',
  disconnected: 'bg-muted-foreground/40',
}

/**
 * The host's clients as small pills: status dot, name, era. Click a pill for the details
 * (URL, transport, protocol version, capabilities, session id, error).
 */
export function HostPanel({ clients }: { clients: readonly HostClient[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-muted-foreground">Host · one client per server:</span>
      {clients.map((c) => (
        <details key={c.target.id} className="relative">
          <summary
            className="list-none [&::-webkit-details-marker]:hidden cursor-pointer flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 hover:bg-accent/60"
            title={c.error ?? `${c.target.title}: ${c.status}`}
          >
            <span className={`h-2 w-2 rounded-full ${DOT[c.status]}`} />
            <span className="font-medium">{c.target.title}</span>
            {c.era && <span className="text-muted-foreground">{c.era}</span>}
            <span className="sr-only">{c.status}</span>
          </summary>
          <div className="absolute left-0 z-20 mt-1 w-72 rounded-lg border border-border bg-background p-3 shadow-lg space-y-1">
            <p>
              Status: <strong>{c.status}</strong>
            </p>
            <p className="font-mono text-muted-foreground break-all">{c.target.url}</p>
            <p>
              Transport: <strong>Streamable HTTP</strong>
              {c.target.url.startsWith('/api/mcp-demo/proxy/') && ' (via our proxy)'}
            </p>
            {c.era && (
              <p>
                Era: <strong>{c.era}</strong> {c.era === 'modern' ? '(2026-07-28)' : '(2025)'}
              </p>
            )}
            {c.capabilities && (
              <p className="text-muted-foreground">Capabilities: {Object.keys(c.capabilities).join(', ') || 'none yet'}</p>
            )}
            {c.sessionId && (
              <p className="truncate" title={c.sessionId}>
                Mcp-Session-Id: <span className="font-mono">{c.sessionId.slice(0, 16)}…</span>
              </p>
            )}
            {c.error && <p className="text-red-600 dark:text-red-400 break-words">{c.error}</p>}
          </div>
        </details>
      ))}
    </div>
  )
}
