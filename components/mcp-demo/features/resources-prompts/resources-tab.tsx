'use client'

import { useCallback, useEffect, useState } from 'react'

import type { TabProps } from '../types'
import { errorText, NotSupported, ResourceContents, type ReadResult } from './shared'

type Resource = Awaited<ReturnType<TabProps['client']['listResources']>>['resources'][number]

/** resources/list → pick one → resources/read → see its contents. */
export function ResourcesTab({ client, target }: TabProps) {
  const supported = !!target.capabilities?.resources
  const [resources, setResources] = useState<Resource[]>([])
  const [selected, setSelected] = useState<string>()
  const [result, setResult] = useState<ReadResult>()
  const [error, setError] = useState<string>()

  const refresh = useCallback(async () => {
    setError(undefined)
    try {
      setResources((await client.listResources()).resources)
    } catch (e) {
      setError(errorText(e))
    }
  }, [client])

  useEffect(() => {
    if (supported) void refresh()
  }, [refresh, supported])

  const read = async (uri: string) => {
    setSelected(uri)
    setResult(undefined)
    setError(undefined)
    try {
      setResult(await client.readResource({ uri }))
    } catch (e) {
      setError(errorText(e))
    }
  }

  if (!supported) return <NotSupported capability="resources" />

  return (
    <div className="space-y-4">
      <button onClick={() => void refresh()} className="text-xs px-2.5 py-1 rounded border border-border hover:bg-accent/60">
        resources/list
      </button>

      <table className="w-full text-xs">
        <thead className="text-left text-muted-foreground">
          <tr>
            <th className="py-1 pr-2 font-medium">uri</th>
            <th className="py-1 pr-2 font-medium">name</th>
            <th className="py-1 pr-2 font-medium">mimeType</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {resources.map((r) => (
            <tr key={r.uri} className={`border-t border-border ${selected === r.uri ? 'bg-accent/50' : ''}`}>
              <td className="py-1 pr-2 font-mono">{r.uri}</td>
              <td className="py-1 pr-2">{r.name}</td>
              <td className="py-1 pr-2 font-mono text-muted-foreground">{r.mimeType ?? '—'}</td>
              <td className="py-1 text-right">
                <button onClick={() => void read(r.uri)} className="px-2 py-0.5 rounded border border-border hover:bg-accent/60">
                  resources/read
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {resources.length === 0 && <p className="text-xs text-muted-foreground">No resources listed.</p>}

      {error && <p className="text-sm text-red-600 dark:text-red-400 break-words">{error}</p>}
      {result && <ResourceContents result={result} />}
    </div>
  )
}
