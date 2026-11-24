'use client'

import { useState } from 'react'

import { ConceptChecklist } from './concept-checklist'
import { Explorer } from './explorer'
import type { PanelSection } from './features/types'
import { uiFeatures } from './features/ui-registry'
import { HostPanel } from './host-panel'
import { ProtocolLog } from './protocol-log'
import { useHost, useLogEntries } from './use-host'

type TabId = 'explorer' | Exclude<PanelSection, 'side'> | 'checklist'

/** The left-hand tabs, grouped like the three MCP lessons. */
const TABS: { id: TabId; label: string; hint: string }[] = [
  { id: 'explorer', label: 'Explorer', hint: 'Pick a server, then use its tools, resources, prompts, discover and raw JSON-RPC.' },
  { id: 'server', label: 'Server lesson', hint: 'Watch a resource change, and the trip services the tools create.' },
  { id: 'client', label: 'Client lesson', hint: 'Elicitation: the server asks you mid-booking (form mode and URL mode).' },
  { id: 'architecture', label: 'Architecture', hint: 'Tool-list changes, stdio vs HTTP, and remote servers.' },
  { id: 'hosts', label: 'Another host', hint: 'The Claude Agent SDK as a second host on the same servers.' },
  { id: 'checklist', label: 'Checklist', hint: 'Lesson concepts tick as their messages appear in the log.' },
]

const panelsIn = (section: PanelSection) => uiFeatures.flatMap((f) => f.panels ?? []).filter((p) => p.section === section)

/**
 * The Live Demo page. Left: lesson tabs + the protocol log drawer. Right: the chatbot, always visible.
 * Every tab stays mounted (only hidden), so watches keep running and the booking dialog can always appear.
 */
export function LiveDemo() {
  const { host, clients } = useHost()
  const [tab, setTab] = useState<TabId>('explorer')
  const [logOpen, setLogOpen] = useState(false)
  const logCount = useLogEntries().length
  const side = panelsIn('side')

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start">
      <div className="flex-1 min-w-0 space-y-4 w-full">
        <div>
          <h1 className="text-2xl font-bold">MCP Live Demo</h1>
          <p className="text-sm text-muted-foreground">
            This page is the <strong>host</strong>: one MCP client per server, and every message is logged.
          </p>
        </div>

        <HostPanel clients={clients} />

        <nav className="flex flex-wrap gap-1 border-b border-border text-sm">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 -mb-px border-b-2 ${tab === t.id ? 'border-primary font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <p className="text-xs text-muted-foreground">{TABS.find((t) => t.id === tab)?.hint}</p>

        <div hidden={tab !== 'explorer'}>
          <Explorer host={host} clients={clients} />
        </div>
        {(['server', 'client', 'architecture', 'hosts'] as const).map((section) => (
          <div key={section} hidden={tab !== section} className="space-y-8">
            {panelsIn(section).map(({ id, label, Component }) => (
              <section key={id} className="space-y-3">
                <h2 className="text-lg font-semibold">{label}</h2>
                <Component host={host} clients={clients} />
              </section>
            ))}
          </div>
        ))}
        <div hidden={tab !== 'checklist'}>
          <ConceptChecklist />
        </div>

        {/* The protocol log as a drawer: closed by default, the count shows it's filling up. */}
        <div className="rounded-lg border border-border">
          <button onClick={() => setLogOpen(!logOpen)} className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold">
            <span>
              {logOpen ? '▾' : '▸'} Protocol log <span className="font-normal text-muted-foreground">({logCount} messages)</span>
            </span>
            <span className="text-xs font-normal text-muted-foreground">{logOpen ? 'close' : 'open'}</span>
          </button>
          {logOpen && (
            <div className="px-3 pb-3">
              <ProtocolLog />
            </div>
          )}
        </div>
      </div>

      {/* Right column: the chatbot, sticky so it stays in view while you use the tabs. */}
      {side.length > 0 && (
        <aside className="w-full xl:w-[420px] xl:shrink-0 xl:sticky xl:top-4 xl:h-[calc(100svh-2rem)] rounded-xl border border-border p-3 flex flex-col min-h-0">
          {side.map(({ id, label, Component }) => (
            <section key={id} className="flex flex-col min-h-0 flex-1 gap-1.5">
              <h2 className="text-sm font-semibold">{label}</h2>
              <Component host={host} clients={clients} />
            </section>
          ))}
        </aside>
      )}
    </div>
  )
}
