'use client'

import { ConceptChecklist } from './concept-checklist'
import { Explorer } from './explorer'
import { uiFeatures } from './features/ui-registry'
import { HostPanel } from './host-panel'
import { ProtocolLog } from './protocol-log'
import { useHost } from './use-host'

/** The whole Live Demo page: host cards → explorer → feature panels → checklist → protocol log. */
export function LiveDemo() {
  const { host, clients } = useHost()

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-950/40 dark:to-sky-950/40 border-2 border-cyan-200 dark:border-cyan-800/50 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">MCP Live Demo</h1>
        <p className="text-sm text-cyan-800 dark:text-cyan-200 mt-1">
          This page is the <strong>host</strong>. It runs one MCP client per server and logs every message.
        </p>
      </div>

      <HostPanel clients={clients} />

      <Explorer host={host} clients={clients} />

      {uiFeatures
        .flatMap((f) => f.panels ?? [])
        .map(({ id, label, Component }) => (
          <section key={id} className="space-y-3">
            <h2 className="text-lg font-semibold">{label}</h2>
            <Component host={host} clients={clients} />
          </section>
        ))}

      <ConceptChecklist />

      <ProtocolLog />
    </div>
  )
}
