'use client'

import { useState, type ComponentType } from 'react'

import type { HostApi, HostClient } from '@/lib/mcp-demo/host'

import { ToolsTab } from './explorer/tools-tab'
import type { TabProps } from './features/types'
import { uiFeatures } from './features/ui-registry'

const BUILT_IN_TABS: { id: string; label: string; Component: ComponentType<TabProps> }[] = [
  { id: 'tools', label: 'Tools', Component: ToolsTab },
]

/** Pick a connected server, pick a tab (Tools now; later specs add Resources, Prompts…). */
export function Explorer({ host, clients }: { host: HostApi; clients: readonly HostClient[] }) {
  const connected = clients.filter((c) => c.status === 'connected' && c.client)
  const [serverId, setServerId] = useState<string>('travel')
  const [tabId, setTabId] = useState<string>('tools')

  const tabs = [...BUILT_IN_TABS, ...uiFeatures.flatMap((f) => f.tabs ?? [])]
  const target = connected.find((c) => c.target.id === serverId) ?? connected[0]
  const tab = tabs.find((t) => t.id === tabId) ?? tabs[0]

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Explorer</h2>
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-muted-foreground">Server:</span>
        {connected.map((c) => (
          <button
            key={c.target.id}
            onClick={() => setServerId(c.target.id)}
            className={`px-2.5 py-1 rounded border border-border ${target?.target.id === c.target.id ? 'bg-accent font-semibold' : 'hover:bg-accent/60'}`}
          >
            {c.target.title}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1 border-b border-border text-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTabId(t.id)}
            className={`px-3 py-1.5 -mb-px border-b-2 ${tab.id === t.id ? 'border-primary font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {target?.client ? (
        <tab.Component key={`${target.target.id}:${tab.id}`} client={target.client} target={target} host={host} />
      ) : (
        <p className="text-sm text-muted-foreground">Waiting for a connected server…</p>
      )}
    </section>
  )
}
