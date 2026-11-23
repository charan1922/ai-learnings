import { createMcpHandler, type McpHttpHandler } from '@modelcontextprotocol/server'

import type { Notifier } from './features/types'
import type { ServerName } from './server-info'
import { createServer } from './servers'

type Globals = typeof globalThis & {
  __mcpDemoHandlers?: Map<ServerName, McpHttpHandler>
  __mcpDemoCreateServer?: typeof createServer
}
const g = globalThis as Globals

// One handler per server, kept on globalThis (same trick as server-log.ts) so that
// open `subscriptions/listen` streams survive Next.js reloads and are shared by all routes.
const handlers: Map<ServerName, McpHttpHandler> = (g.__mcpDemoHandlers ??= new Map())

// The handler outlives reloads, so it must always call the NEWEST createServer.
g.__mcpDemoCreateServer = createServer

/** The handler for one server: `handler.fetch(request)` answers one MCP HTTP request. */
export function getHandler(name: ServerName): McpHttpHandler {
  let handler = handlers.get(name)
  if (!handler) {
    // The factory runs once PER REQUEST and returns a fresh McpServer (stateless).
    handler = createMcpHandler(({ requestInfo }) =>
      (g.__mcpDemoCreateServer ?? createServer)(name, { requestInfo, notify: notifier }),
    )
    handlers.set(name, handler)
  }
  return handler
}

/**
 * Pushes change notifications to clients that opened a `subscriptions/listen` stream.
 * (A per-request server can't push by itself, so we publish through the handler.)
 */
export const notifier: Notifier = {
  toolsChanged: (server) => getHandler(server).notify.toolsChanged(),
  resourceUpdated: (server, uri) => getHandler(server).notify.resourceUpdated(uri),
}
