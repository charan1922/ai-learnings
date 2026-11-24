import { randomUUID } from 'node:crypto'

import { WebStandardStreamableHTTPServerTransport, type McpServer, type RegisteredTool } from '@modelcontextprotocol/server'

import type { ServerName } from './server-info'
import { emptyServer, SERVERS } from './servers'
import type { Notifier, ServerContext } from './servers/types'

/**
 * Sessions for 2025-era hosts (VS Code, Claude Desktop, MCP Inspector…).
 *
 * The modern protocol (2026-07-28) is served stateless by createMcpHandler — see handlers.ts.
 * A 2025-era host instead starts with `initialize`, gets an Mcp-Session-Id, and expects the server to
 * send it requests (elicitation/create) and notifications (list_changed, resources/updated) on
 * that session. So each session keeps ONE McpServer + transport alive until the host ends it.
 */

type Registration = Parameters<McpServer['registerTool']>

interface Session {
  name: ServerName
  server: McpServer
  transport: WebStandardStreamableHTTPServerTransport
  ctx: ServerContext
  /** The tools this session's server has right now, so tool changes can be applied to it. */
  tools: Map<string, RegisteredTool>
  /** URIs the host subscribed to with resources/subscribe. */
  subscribed: Set<string>
}

/** Enough for a few hosts on a dev machine; the oldest session is dropped beyond this. */
const MAX_SESSIONS = 50

// On globalThis so open sessions survive Next.js reloads.
const g = globalThis as typeof globalThis & { __mcpDemoLegacySessions?: Map<string, Session> }
const sessions: Map<string, Session> = (g.__mcpDemoLegacySessions ??= new Map())

const jsonRpcError = (status: number, message: string) =>
  Response.json({ jsonrpc: '2.0', error: { code: -32000, message }, id: null }, { status })

/**
 * Runs a server's `register` and reports every tool it registers (name → registerTool arguments + handle).
 * Lets us learn which tools the server offers RIGHT NOW without changing any register function.
 */
function recordTools(server: McpServer, run: () => void): Map<string, { args: Registration; handle: RegisteredTool }> {
  const recorded = new Map<string, { args: Registration; handle: RegisteredTool }>()
  const original = server.registerTool.bind(server) as (...args: Registration) => RegisteredTool
  server.registerTool = ((...args: Registration) => {
    const handle = original(...args)
    recorded.set(args[0], { args, handle })
    return handle
  }) as McpServer['registerTool']
  run()
  server.registerTool = original as McpServer['registerTool']
  return recorded
}

/** Answers one HTTP request from a 2025-era host: `initialize` opens a session, later requests use it. */
export async function serveLegacy(name: ServerName, request: Request, notify: Notifier): Promise<Response> {
  const sessionId = request.headers.get('mcp-session-id')
  if (sessionId) {
    const session = sessions.get(sessionId)
    // 404 tells the host its session is gone, so it starts a new one with initialize.
    if (!session || session.name !== name) return jsonRpcError(404, 'Session not found')
    return session.transport.handleRequest(request)
  }

  // No session yet: this must be `initialize` (the transport rejects anything else itself).
  const ctx: ServerContext = { requestInfo: request, notify }
  const server = emptyServer(name)
  const tools = new Map([...recordTools(server, () => SERVERS[name].register(server, ctx))].map(([tool, { handle }]) => [tool, handle]))
  const subscribed = new Set<string>()

  // resources/subscribe is a 2025 request; the per-request (modern) path uses subscriptions/listen instead.
  if (SERVERS[name].options?.capabilities?.resources?.subscribe) {
    server.server.setRequestHandler('resources/subscribe', (req) => (subscribed.add(req.params.uri), {}))
    server.server.setRequestHandler('resources/unsubscribe', (req) => (subscribed.delete(req.params.uri), {}))
  }

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (id) => {
      sessions.set(id, { name, server, transport, ctx, tools, subscribed })
      if (sessions.size > MAX_SESSIONS) void closeSession(sessions.keys().next().value!)
    },
    onsessionclosed: (id) => void closeSession(id),
  })
  await server.connect(transport)
  return transport.handleRequest(request)
}

async function closeSession(id: string): Promise<void> {
  const session = sessions.get(id)
  if (!session) return
  sessions.delete(id)
  await session.server.close().catch(() => undefined)
}

/** The server's tools changed: bring every open session of that server up to date (the SDK then sends list_changed). */
export function legacyToolsChanged(name: ServerName): void {
  for (const session of sessions.values()) {
    if (session.name !== name) continue
    // What a fresh server would offer now, from a throwaway server that is never connected.
    const scratch = emptyServer(name)
    const now = recordTools(scratch, () => SERVERS[name].register(scratch, session.ctx))

    for (const [tool, handle] of session.tools) {
      if (!now.has(tool)) {
        handle.remove()
        session.tools.delete(tool)
      }
    }
    for (const [tool, { args }] of now) {
      if (!session.tools.has(tool)) session.tools.set(tool, (session.server.registerTool as (...a: Registration) => RegisteredTool)(...args))
    }
  }
}

/** A resource changed: tell the sessions that subscribed to it. */
export function legacyResourceUpdated(name: ServerName, uri: string): void {
  for (const session of sessions.values()) {
    if (session.name === name && session.subscribed.has(uri)) void session.server.server.sendResourceUpdated({ uri })
  }
}
