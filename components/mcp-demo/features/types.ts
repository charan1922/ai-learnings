import type { Client } from '@modelcontextprotocol/client'
import type { ComponentType } from 'react'

import type { HostApi, HostClient } from '@/lib/mcp-demo/host'

/** What an Explorer tab gets: the selected server's Client. */
export interface TabProps {
  client: Client
  target: HostClient
  host: HostApi
}

/** What a page panel gets: the whole host and every client. */
export interface PanelProps {
  host: HostApi
  clients: readonly HostClient[]
}

/**
 * The browser-side plug-in contract (twin of lib/mcp-demo/features/types.ts on the server).
 * Each feature spec (2–9) creates one of these in components/mcp-demo/features/<id>/index.tsx
 * and adds ONE line to ui-registry.ts.
 */
export interface UiFeature {
  id: string
  tabs?: { id: string; label: string; Component: ComponentType<TabProps> }[]
  panels?: { id: string; label: string; Component: ComponentType<PanelProps> }[]
  clientSetup?: (client: Client, host: HostApi) => void
}
