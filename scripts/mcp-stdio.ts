/**
 * The SAME MCP servers, served over stdio instead of HTTP (Spec 6).
 *
 *   pnpm mcp:stdio travel      (or weather / calendar)
 *
 * stdin  = JSON-RPC messages in, one per line.
 * stdout = JSON-RPC messages out, one per line — so this file must NEVER console.log (that would corrupt stdout).
 * stderr = our own messages.
 */
import { serveStdio } from '@modelcontextprotocol/server/stdio'

import type { Notifier } from '../lib/mcp-demo/servers/types'
import { isServerName } from '../lib/mcp-demo/server-info'
import { createServer } from '../lib/mcp-demo/servers'

const name = process.argv[2] ?? ''
if (!isServerName(name)) {
  console.error('Usage: pnpm mcp:stdio <travel|weather|calendar>')
  process.exit(1)
}

// This process has no HTTP handler to publish through, and admin actions only run in the dev server.
const notify: Notifier = { toolsChanged: () => {}, resourceUpdated: () => {} }

// Same factory as the HTTP route → the same tools, resources and prompts.
serveStdio(() => createServer(name, { notify }), { onerror: (error) => console.error('[mcp-stdio]', error.message) })
console.error(`[mcp-stdio] ${name} server ready on stdio`)
