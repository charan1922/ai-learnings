import path from 'node:path'

import { Client, type Transport } from '@modelcontextprotocol/client'
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio'

import { guardLocalhost } from '@/lib/mcp-demo/serve'
import { isServerName } from '@/lib/mcp-demo/server-info'

type Line = { dir: 'stdin' | 'stdout'; json: unknown }

/** Wraps a transport so every message written to the child's stdin / read from its stdout is recorded. */
function recording(inner: Transport, lines: Line[]): Transport {
  const outer: Transport = {
    start: () => inner.start(),
    close: () => inner.close(),
    send: (message, options) => {
      lines.push({ dir: 'stdin', json: message })
      return inner.send(message, options)
    },
  }
  inner.onmessage = (message, extra) => {
    lines.push({ dir: 'stdout', json: message })
    outer.onmessage?.(message, extra)
  }
  inner.onclose = () => outer.onclose?.()
  inner.onerror = (error) => outer.onerror?.(error)
  return outer
}

/**
 * POST /api/mcp-demo/stdio   { server: "travel", op: "tools/list" | "tools/call", args?: { name, arguments } }
 * Starts the stdio server as a CHILD PROCESS (fixed command, never user input), runs one operation,
 * stops it, and returns the result plus every stdin/stdout line.
 */
export async function POST(request: Request): Promise<Response> {
  const rejected = guardLocalhost(request)
  if (rejected) return rejected

  let payload: { server?: unknown; op?: unknown; args?: { name?: unknown; arguments?: unknown } }
  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: 'Body must be JSON: { server, op, args? }' }, { status: 400 })
  }
  const server = typeof payload?.server === 'string' ? payload.server : ''
  if (!isServerName(server)) return Response.json({ error: `Unknown MCP server: ${server}` }, { status: 400 })
  if (payload.op !== 'tools/list' && payload.op !== 'tools/call') {
    return Response.json({ error: 'op must be "tools/list" or "tools/call"' }, { status: 400 })
  }

  const lines: Line[] = []
  const started = Date.now()
  // `node --import tsx scripts/mcp-stdio.ts <server>` — the same as `pnpm mcp:stdio <server>`, without a shell.
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['--import', 'tsx', path.join(process.cwd(), 'scripts', 'mcp-stdio.ts'), server],
    cwd: process.cwd(),
    stderr: 'pipe',
  })
  const client = new Client({ name: 'ai-learnings-stdio-bridge', version: '1.0.0' }, { versionNegotiation: { mode: 'auto' } })

  try {
    await client.connect(recording(transport, lines))
    const result =
      payload.op === 'tools/list'
        ? await client.listTools()
        : await client.callTool({
            name: String(payload.args?.name ?? ''),
            arguments: (payload.args?.arguments ?? {}) as Record<string, unknown>,
          })
    return Response.json({ result, lines, durationMs: Date.now() - started })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error), lines, durationMs: Date.now() - started },
      { status: 502 },
    )
  } finally {
    await client.close().catch(() => undefined) // closes stdin → the child exits
  }
}
