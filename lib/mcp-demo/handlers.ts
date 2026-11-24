import { createMcpHandler, type McpHttpHandler } from '@modelcontextprotocol/server'

import { legacyResourceUpdated, legacyToolsChanged } from './legacy-sessions'
import type { ServerName } from './server-info'
import { appendServerLog } from './server-log'
import { createServer } from './servers'
import type { Notifier } from './servers/types'

type Globals = typeof globalThis & {
  __mcpDemoHandlers?: Map<ServerName, McpHttpHandler>
  __mcpDemoCreateServer?: typeof createServer
  __mcpDemoHandlerFactory?: typeof createMcpHandler
}
const g = globalThis as Globals

// One handler per server, kept on globalThis (same trick as server-log.ts) so that
// open `subscriptions/listen` streams survive Next.js reloads and are shared by all routes.
// BUT if the SDK module itself was loaded again, old handlers belong to the old copy of the SDK
// and fail with "Internal server error" — so start fresh then.
if (g.__mcpDemoHandlerFactory !== createMcpHandler) {
  g.__mcpDemoHandlers = new Map()
  g.__mcpDemoHandlerFactory = createMcpHandler
}
const handlers: Map<ServerName, McpHttpHandler> = (g.__mcpDemoHandlers ??= new Map())

// The handler outlives reloads, so it must always call the NEWEST createServer.
g.__mcpDemoCreateServer = createServer

/**
 * The handler for one server's MODERN (2026-07-28) traffic: `handler.fetch(request)` answers one request.
 * 2025-era traffic never reaches it (`legacy: 'reject'`) — serve.ts sends that to legacy-sessions.ts.
 */
export function getHandler(name: ServerName): McpHttpHandler {
  let handler = handlers.get(name)
  if (!handler) {
    // The factory runs once PER REQUEST and returns a fresh McpServer (stateless).
    handler = createMcpHandler(
      ({ requestInfo }) => (g.__mcpDemoCreateServer ?? createServer)(name, { requestInfo, notify: notifier }),
      {
        legacy: 'reject',
        // The client only ever sees a generic -32603; the real reason goes to the terminal and the server log.
        onerror: (error) => {
          console.error(`[mcp ${name}]`, error)
          appendServerLog({ server: name, direction: 'out', error: error.message })
        },
      },
    )
    handlers.set(name, handler)
  }
  return handler
}

/**
 * Pushes change notifications to every client:
 * - modern clients with an open `subscriptions/listen` stream (published through the handler —
 *   a per-request server can't push by itself);
 * - 2025-era hosts on their sessions (legacy-sessions.ts).
 */
export const notifier: Notifier = {
  toolsChanged: (server) => {
    getHandler(server).notify.toolsChanged()
    legacyToolsChanged(server)
  },
  resourceUpdated: (server, uri) => {
    getHandler(server).notify.resourceUpdated(uri)
    legacyResourceUpdated(server, uri)
  },
}
