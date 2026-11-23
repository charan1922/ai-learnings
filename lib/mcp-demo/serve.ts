import {
  hostHeaderValidationResponse,
  localhostAllowedHostnames,
  localhostAllowedOrigins,
  originValidationResponse,
} from '@modelcontextprotocol/server'

import { getHandler } from './handlers'
import { isServerName } from './server-info'
import { appendServerLog } from './server-log'

/**
 * Security check: only allow callers from localhost (blocks DNS-rebinding attacks).
 * Returns a 403 Response to send back, or undefined if the request is fine.
 * A request with no Origin header (e.g. VS Code, curl) always passes.
 */
export function guardLocalhost(request: Request): Response | undefined {
  return (
    hostHeaderValidationResponse(request, localhostAllowedHostnames()) ??
    originValidationResponse(request, localhostAllowedOrigins())
  )
}

/**
 * The single entry point for /api/mcp/[server]:
 * check the server name → guard → log the request → hand it to the handler → log the response.
 */
export async function serveMcp(server: string, request: Request): Promise<Response> {
  if (!isServerName(server)) {
    return Response.json({ error: `Unknown MCP server: ${server}` }, { status: 404 })
  }

  const rejected = guardLocalhost(request)
  if (rejected) return rejected

  await logInbound(server, request)
  const response = await getHandler(server).fetch(request)
  await logOutbound(server, response)
  return response
}

/** The log keeps at most this much of any body, so huge requests can't fill memory. */
const MAX_LOGGED_BODY = 64 * 1024

function parseMaybeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * Reads a COPY (clone) of the body for the log — the handler still gets the original.
 * Reads chunk by chunk and stops at MAX_LOGGED_BODY, so we never read more than that,
 * even if the sender lies about (or omits) content-length.
 */
async function readBodyForLog(source: Request | Response): Promise<unknown> {
  const stream = source.clone().body
  if (!stream) return undefined

  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let text = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    text += decoder.decode(value, { stream: true })
    if (text.length > MAX_LOGGED_BODY) {
      // Stop reading our copy. NOT awaited: with clone() (a tee) the cancel promise only
      // settles once BOTH copies are cancelled, and the handler's copy never is.
      void reader.cancel().catch(() => undefined)
      return `${text.slice(0, MAX_LOGGED_BODY)}… [truncated — body is over ${MAX_LOGGED_BODY / 1024} KB]`
    }
  }
  text += decoder.decode()
  return text ? parseMaybeJson(text) : undefined
}

async function logInbound(server: string, request: Request): Promise<void> {
  const body = request.method === 'POST' ? await readBodyForLog(request) : undefined
  appendServerLog({
    server,
    direction: 'in',
    method: request.method,
    protocolVersion: request.headers.get('mcp-protocol-version') ?? undefined,
    mcpMethod: request.headers.get('mcp-method') ?? undefined,
    mcpName: request.headers.get('mcp-name') ?? undefined,
    userAgent: request.headers.get('user-agent') ?? undefined,
    body,
  })
}

async function logOutbound(server: string, response: Response): Promise<void> {
  const contentType = response.headers.get('content-type') ?? undefined
  // Only JSON bodies are logged. SSE streams (like a long-lived subscriptions/listen)
  // are never read here — reading would block until the stream ends.
  const body = contentType?.includes('application/json') ? await readBodyForLog(response) : undefined
  appendServerLog({ server, direction: 'out', status: response.status, contentType, body })
}
