'use client'

import { useEffect, useMemo, useSyncExternalStore } from 'react'

import { createHost, LOCAL_TARGETS, type HostApi, type HostClient } from '@/lib/mcp-demo/host'
import { logStore, type LogEntry } from '@/lib/mcp-demo/log-store'

import { uiFeatures } from './features/ui-registry'

const NO_CLIENTS: readonly HostClient[] = []
const NO_ENTRIES: readonly LogEntry[] = []

/** One host per page: connects the three local servers on mount and closes them on unmount. */
export function useHost(): { host: HostApi; clients: readonly HostClient[] } {
  const host = useMemo(
    () =>
      createHost({
        clientSetup: uiFeatures.flatMap((f) => (f.clientSetup ? [f.clientSetup] : [])),
        // Every feature's declared client capabilities, merged (e.g. elicitation from Spec 4).
        capabilities: uiFeatures.reduce((caps, f) => ({ ...caps, ...f.capabilities }), {}),
      }),
    [],
  )
  const clients = useSyncExternalStore(host.subscribe, host.getClients, () => NO_CLIENTS)

  useEffect(() => {
    for (const target of LOCAL_TARGETS) void host.connect(target)
    return () => {
      for (const target of LOCAL_TARGETS) void host.disconnect(target.id)
    }
  }, [host])

  return { host, clients }
}

/** The browser protocol log, live. */
export function useLogEntries(): readonly LogEntry[] {
  return useSyncExternalStore(logStore.subscribe, logStore.getSnapshot, () => NO_ENTRIES)
}
