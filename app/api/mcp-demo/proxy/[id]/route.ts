import { findRemote } from '@/lib/mcp-demo/remotes'
import { guardLocalhost } from '@/lib/mcp-demo/serve'

/** Only these request headers go to the remote server (no cookies, no auth from our side). */
const REQUEST_HEADERS = ['content-type', 'accept', 'mcp-protocol-version', 'mcp-method', 'mcp-name', 'mcp-session-id', 'last-event-id']
/** Only these response headers come back to the browser. */
const RESPONSE_HEADERS = ['content-type', 'mcp-session-id', 'mcp-protocol-version', 'cache-control']

/** How long we wait for the remote server to START answering. A long-lived stream may then stay open. */
const CONNECT_TIMEOUT_MS = 20_000

/**
 * /api/mcp-demo/proxy/<id> — forwards MCP traffic to ONE allow-listed remote server (Spec 7).
 * Why: a browser may only call another site if that site allows it (CORS). Our server has no such limit,
 * so the page talks to us (same origin) and we talk to the remote.
 */
async function handle(request: Request, ctx: RouteContext<'/api/mcp-demo/proxy/[id]'>): Promise<Response> {
  const rejected = guardLocalhost(request)
  if (rejected) return rejected

  const { id } = await ctx.params
  const remote = findRemote(id)
  if (!remote) return Response.json({ error: `Unknown remote server: ${id}` }, { status: 404 })

  const headers = new Headers()
  for (const name of REQUEST_HEADERS) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }

  const abort = new AbortController()
  const timer = setTimeout(() => abort.abort(), CONNECT_TIMEOUT_MS)
  let upstream: Response
  try {
    upstream = await fetch(remote.url, {
      method: request.method,
      headers,
      body: request.method === 'POST' ? await request.text() : undefined,
      signal: abort.signal,
      redirect: 'manual',
    })
  } catch (error) {
    const reason = abort.signal.aborted ? `no answer within ${CONNECT_TIMEOUT_MS / 1000} s` : String(error)
    return Response.json({ error: `${remote.title} could not be reached: ${reason}` }, { status: 502 })
  } finally {
    clearTimeout(timer) // the answer has started — streams may now run as long as they like
  }

  const out = new Headers()
  for (const name of RESPONSE_HEADERS) {
    const value = upstream.headers.get(name)
    if (value) out.set(name, value)
  }
  // Pass the body through as a stream (no buffering), so SSE replies arrive message by message.
  return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: out })
}

export const GET = handle
export const POST = handle
export const DELETE = handle
