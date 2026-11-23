import type { HostClient } from '@/lib/mcp-demo/host'

const STATUS_STYLE: Record<HostClient['status'], string> = {
  connecting: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  connected: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  disconnected: 'bg-muted text-muted-foreground',
}

/** One card per client: status, URL, transport, protocol era and server capabilities. */
export function HostPanel({ clients }: { clients: readonly HostClient[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Host — one client per server</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {clients.map((c) => (
          <div key={c.target.id} className="rounded-lg border border-border p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-sm truncate">{c.target.title}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_STYLE[c.status]}`}>{c.status}</span>
            </div>
            <div className="font-mono text-muted-foreground truncate">{c.target.url}</div>
            <div>
              Transport: <strong>Streamable HTTP</strong>
            </div>
            {c.era && (
              <div>
                Era: <strong>{c.era}</strong> {c.era === 'modern' ? '(2026-07-28)' : '(2025)'}
              </div>
            )}
            {c.capabilities && (
              <div className="text-muted-foreground">Capabilities: {Object.keys(c.capabilities).join(', ') || 'none yet'}</div>
            )}
            {c.error && <div className="text-red-600 dark:text-red-400 break-words">{c.error}</div>}
          </div>
        ))}
      </div>
    </section>
  )
}
