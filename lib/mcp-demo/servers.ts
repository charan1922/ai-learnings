import { McpServer, type McpServerOptions } from '@modelcontextprotocol/server'

import { serverFeatures } from './features/server-registry'
import type { FeatureContext } from './features/types'
import { SERVER_INFO, type ServerName } from './server-info'

/**
 * Builds ONE fresh McpServer for ONE request — createMcpHandler calls this per request (stateless).
 * Every tool / resource / prompt comes from a registered feature (server-registry.ts) —
 * including searchFlights, which is the "base" feature.
 */
export function createServer(name: ServerName, ctx: FeatureContext): McpServer {
  // Merge any server options features ask for (e.g. a requestState codec in Spec 4).
  const options: McpServerOptions = serverFeatures.reduce<McpServerOptions>(
    (merged, feature) => ({ ...merged, ...feature.serverOptions?.[name] }),
    {},
  )

  const server = new McpServer({ name: `ai-learnings-${name}`, version: SERVER_INFO[name].version }, options)

  for (const feature of serverFeatures) feature.register?.[name]?.(server, ctx)

  return server
}
