import { McpServer } from '@modelcontextprotocol/server'

import { SERVER_INFO, type ServerName } from '../server-info'
import { calendarServer } from './calendar'
import type { ServerContext, ServerDefinition } from './types'
import { travelServer } from './travel'
import { weatherServer } from './weather'

/** Our three MCP servers. Each one lists what it offers in its own folder (servers/<name>/index.ts). */
export const SERVERS: Record<ServerName, ServerDefinition> = {
  travel: travelServer,
  weather: weatherServer,
  calendar: calendarServer,
}

/** An empty McpServer with the server's name, version and options — nothing registered yet. */
export const emptyServer = (name: ServerName): McpServer =>
  new McpServer({ name: `ai-learnings-${name}`, version: SERVER_INFO[name].version }, SERVERS[name].options)

/** Builds ONE fresh McpServer for ONE request — createMcpHandler (HTTP) and serveStdio call this per request. */
export function createServer(name: ServerName, ctx: ServerContext): McpServer {
  const server = emptyServer(name)
  SERVERS[name].register(server, ctx)
  return server
}
