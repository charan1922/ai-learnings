import type { McpServer, McpServerOptions } from '@modelcontextprotocol/server'

import type { ServerName } from '../server-info'

/** Publishes change notifications to clients' open `subscriptions/listen` streams. */
export interface Notifier {
  toolsChanged(server: ServerName): void
  resourceUpdated(server: ServerName, uri: string): void
}

/** Passed to every feature's `register` call, once per request. */
export interface FeatureContext {
  /** The HTTP request being served (e.g. to read the page origin). */
  requestInfo?: Request
  notify: Notifier
}

/** Passed to admin actions — the demo buttons such as "Add searchHotels". */
export interface AdminContext {
  notify: Notifier
}

/**
 * The server-side plug-in contract.
 * Each later spec (2–9) creates one of these in lib/mcp-demo/features/<id>/server.ts
 * and adds ONE line to server-registry.ts. No feature imports another feature.
 */
export interface ServerFeature {
  id: string
  /** Add tools / resources / prompts to a server. Runs on every request (fresh server each time). */
  register?: Partial<Record<ServerName, (server: McpServer, ctx: FeatureContext) => void>>
  /** Extra McpServer options for a server, e.g. a requestState codec (Spec 4). */
  serverOptions?: Partial<Record<ServerName, Partial<McpServerOptions>>>
  /** Named demo actions, called from POST /api/mcp-demo/admin. */
  adminActions?: Record<string, (ctx: AdminContext) => void | Promise<void>>
}
