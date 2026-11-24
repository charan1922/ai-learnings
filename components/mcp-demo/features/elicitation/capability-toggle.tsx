'use client'

import type { ClientOptions } from '@modelcontextprotocol/client'
import { useState } from 'react'

import type { HostApi } from '@/lib/mcp-demo/host'

import { JsonView } from '../../json-view'

/** The three choices from the MCP Client lesson. */
export const CAPABILITY_OPTIONS: { id: string; label: string; capabilities: NonNullable<ClientOptions['capabilities']> }[] = [
  { id: 'none', label: 'None', capabilities: {} },
  { id: 'form', label: 'Form only', capabilities: { elicitation: {} } },
  { id: 'both', label: 'Form and URL', capabilities: { elicitation: { form: {}, url: {} } } },
]

/** What our host tells servers it can do. Changing it reconnects every client with the new capabilities. */
export function CapabilityToggle({ host }: { host: HostApi }) {
  const [choice, setChoice] = useState('both') // matches the feature's default declaration
  const [busy, setBusy] = useState(false)
  const current = CAPABILITY_OPTIONS.find((o) => o.id === choice) ?? CAPABILITY_OPTIONS[2]

  const change = async (id: string) => {
    const option = CAPABILITY_OPTIONS.find((o) => o.id === id)
    if (!option) return
    setChoice(id)
    setBusy(true)
    try {
      await host.setClientCapabilities(option.capabilities)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-muted-foreground">Our client declares:</span>
        {CAPABILITY_OPTIONS.map((o) => (
          <button
            key={o.id}
            onClick={() => void change(o.id)}
            disabled={busy}
            className={`px-2.5 py-1 rounded border border-border ${choice === o.id ? 'bg-accent font-semibold' : 'hover:bg-accent/60'}`}
          >
            {o.label}
          </button>
        ))}
        {busy && <span className="text-muted-foreground">reconnecting…</span>}
      </div>
      <JsonView value={{ capabilities: current.capabilities }} />
    </div>
  )
}
