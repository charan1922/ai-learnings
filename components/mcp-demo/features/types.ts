import type { Client, ClientOptions } from '@modelcontextprotocol/client'
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

/** Where a panel goes on the page: a lesson tab on the left, or the side column on the right. */
export type PanelSection = 'server' | 'client' | 'architecture' | 'hosts' | 'side'

/**
 * The browser-side plug-in contract (the server side is organised by domain in lib/mcp-demo/servers/).
 * Each feature spec (2–9) creates one of these in components/mcp-demo/features/<id>/index.tsx
 * and adds ONE line to ui-registry.ts.
 */
export interface UiFeature {
  id: string
  tabs?: { id: string; label: string; Component: ComponentType<TabProps> }[]
  panels?: { id: string; label: string; section: PanelSection; Component: ComponentType<PanelProps> }[]
  clientSetup?: (client: Client, host: HostApi) => void
  /** Client capabilities this feature needs declared from the first connect, e.g. { elicitation: {...} }. */
  capabilities?: ClientOptions['capabilities']
}
