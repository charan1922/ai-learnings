import type { McpServer, McpServerOptions } from '@modelcontextprotocol/server'

import type { ServerName } from '../server-info'

/** Publishes change notifications to clients' open `subscriptions/listen` streams. */
export interface Notifier {
  toolsChanged(server: ServerName): void
  resourceUpdated(server: ServerName, uri: string): void
}

/** Passed to a server's `register`, once per request. */
export interface ServerContext {
  /** The HTTP request being served (e.g. to read the page origin). */
  requestInfo?: Request
  notify: Notifier
}

/** Passed to admin actions — the demo buttons such as "Add searchHotels". */
export interface AdminContext {
  notify: Notifier
}

export type AdminActions = Record<string, (ctx: AdminContext) => void | Promise<void>>

/** One MCP server: what it offers (register), how it is configured (options), and its demo buttons. */
export interface ServerDefinition {
  /** McpServer options, e.g. a requestState codec or `resources.subscribe`. */
  options?: McpServerOptions
  /** Adds the server's tools, resources and prompts. Runs on every request (a fresh server each time). */
  register: (server: McpServer, ctx: ServerContext) => void
  /** Named demo actions, run from POST /api/mcp-demo/admin. */
  adminActions?: AdminActions
}
