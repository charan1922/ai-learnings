'use client'

import { useState } from 'react'

import { JsonView } from '../../json-view'
import type { TabProps } from '../types'

type DiscoverResult = NonNullable<ReturnType<TabProps['client']['getDiscoverResult']>>

/** server/discover: which versions the server speaks, what it can do, and how long the answer may be cached. */
export function DiscoverTab({ client }: TabProps) {
  // The answer the client already got while connecting (the first message on the wire).
  const [result, setResult] = useState<DiscoverResult | undefined>(() => client.getDiscoverResult())
  const [error, setError] = useState<string>()

  const send = async () => {
    setError(undefined)
    try {
      setResult(await client.discover())
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const raw = result as (DiscoverResult & { ttlMs?: number; cacheScope?: string }) | undefined
  const highlights = raw && [
    ['supportedVersions', JSON.stringify(raw.supportedVersions)],
    ['capabilities.tools.listChanged', JSON.stringify(raw.capabilities?.tools?.listChanged ?? false)],
    ['cache hint (ttlMs, cacheScope)', `${raw.ttlMs ?? '—'} ms, ${raw.cacheScope ?? '—'}`],
  ]

  return (
    <div className="space-y-4">
      <button onClick={() => void send()} className="text-xs px-2.5 py-1 rounded border border-border hover:bg-accent/60">
        Send server/discover
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400 break-words">{error}</p>}
      {highlights && (
        <table className="text-xs">
          <tbody>
            {highlights.map(([field, value]) => (
              <tr key={field}>
                <td className="pr-4 py-0.5 font-mono text-muted-foreground">{field}</td>
                <td className="py-0.5 font-mono font-semibold bg-amber-500/15 px-1 rounded">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {result ? <JsonView value={result} /> : <p className="text-xs text-muted-foreground">No discover result yet.</p>}
    </div>
  )
}
