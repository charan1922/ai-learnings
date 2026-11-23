import { guardLocalhost } from '@/lib/mcp-demo/serve'
import { clearServerLog, readServerLog } from '@/lib/mcp-demo/server-log'

/**
 * GET /api/mcp-demo/server-log?since=12&server=travel
 * → { entries: [...] } — log entries newer than id 12, for the travel server only.
 * Both query params are optional.
 */
export async function GET(request: Request): Promise<Response> {
  const rejected = guardLocalhost(request)
  if (rejected) return rejected

  const url = new URL(request.url)
  const since = Number(url.searchParams.get('since') ?? 0) || 0
  const server = url.searchParams.get('server') ?? undefined
  return Response.json({ entries: readServerLog(since, server) })
}

/** DELETE /api/mcp-demo/server-log → empties the log. */
export async function DELETE(request: Request): Promise<Response> {
  const rejected = guardLocalhost(request)
  if (rejected) return rejected

  clearServerLog()
  return new Response(null, { status: 204 })
}
