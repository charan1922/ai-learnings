import type { FetchLike } from '@modelcontextprotocol/client'

import { logStore } from './log-store'

const MCP_HEADERS = ['mcp-protocol-version', 'mcp-method', 'mcp-name', 'mcp-session-id'] as const

/** Keeps only the MCP headers, e.g. { 'mcp-method': 'tools/call', 'mcp-name': 'searchFlights' }. */
export function pickMcpHeaders(headers: Headers): Record<string, string> {
  const picked: Record<string, string> = {}
  for (const name of MCP_HEADERS) {
    const value = headers.get(name)
    if (value) picked[name] = value
  }
  return picked
}

function parseMaybeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * Server-Sent Events parser. Feed it raw text chunks; it calls onMessage with each
 * `data:` payload once the event is complete (an event ends at a blank line).
 *
 *   feed('event: message\ndata: {"a":')   → nothing yet (event not finished)
 *   feed('1}\n\n')                         → onMessage({ a: 1 })
 */
export function createSseParser(onMessage: (json: unknown) => void): (text: string) => void {
  let buffer = ''
  return (text) => {
    buffer += text.replace(/\r\n/g, '\n')
    let boundary: number
    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
      const event = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)
      const data = event
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart())
        .join('\n')
      if (data) onMessage(parseMaybeJson(data))
    }
  }
}

/** Reads an SSE stream to the end, logging each message as it arrives. */
async function drainSse(stream: ReadableStream<Uint8Array>, onMessage: (json: unknown) => void): Promise<void> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  const feed = createSseParser(onMessage)
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      feed(decoder.decode(value, { stream: true }))
    }
  } catch {
    // Stream closed or aborted — nothing more to log.
  }
}

/**
 * Wraps the transport's fetch so every JSON-RPC message in and out lands in the browser log.
 * The MCP client never knows: it calls this exactly like the normal fetch.
 */
export function createLoggingFetch(server: string, baseFetch: FetchLike = (url, init) => fetch(url, init)): FetchLike {
  return async (url, init) => {
    // OUT: the transport always sends the JSON-RPC message as a string body.
    if (typeof init?.body === 'string') {
      logStore.append({
        server,
        direction: 'out',
        transport: 'http',
        headers: pickMcpHeaders(new Headers(init.headers)),
        json: parseMaybeJson(init.body),
      })
    }

    const response = await baseFetch(url, init)
    const meta = {
      server,
      direction: 'in' as const,
      transport: 'http' as const,
      httpStatus: response.status,
      headers: pickMcpHeaders(response.headers),
    }

    // IN (stream): split it in two — one copy for the SDK, one we read as messages arrive.
    // Works for long-lived streams too (subscriptions/listen), because we never wait for the end.
    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('text/event-stream') && response.body) {
      const [forClient, forLog] = response.body.tee()
      void drainSse(forLog, (json) => logStore.append({ ...meta, json }))
      return new Response(forClient, { status: response.status, statusText: response.statusText, headers: response.headers })
    }

    // IN (plain JSON or empty 202): read a copy, hand the original to the SDK.
    const text = await response.clone().text()
    if (text) logStore.append({ ...meta, json: parseMaybeJson(text) })
    return response
  }
}
