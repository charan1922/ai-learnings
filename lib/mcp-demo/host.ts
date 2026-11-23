import { Client, StreamableHTTPClientTransport, type ClientOptions, type FetchLike } from '@modelcontextprotocol/client'

import { createLoggingFetch } from './logging-fetch'
import { SERVER_INFO, SERVER_NAMES } from './server-info'

/** A server the host can connect to. */
export interface HostTarget {
  id: string
  title: string
  /** Absolute URL, or a path resolved against the page origin (local servers). */
  url: string
}

/** Our three local servers: travel, weather, calendar. */
export const LOCAL_TARGETS: HostTarget[] = SERVER_NAMES.map((name) => ({
  id: name,
  title: SERVER_INFO[name].title,
  url: SERVER_INFO[name].path,
}))

export type ClientStatus = 'connecting' | 'connected' | 'error' | 'disconnected'

/** One row in the host: a target, its MCP Client, and what we learned when connecting. */
export interface HostClient {
  target: HostTarget
  status: ClientStatus
  client?: Client
  era?: ReturnType<Client['getProtocolEra']>
  serverVersion?: ReturnType<Client['getServerVersion']>
  capabilities?: ReturnType<Client['getServerCapabilities']>
  error?: string
}

export interface HostApi {
  connect(target: HostTarget): Promise<void>
  disconnect(id: string): Promise<void>
  reconnect(id: string): Promise<void>
  setClientCapabilities(capabilities: ClientOptions['capabilities']): Promise<void>
  getClients(): readonly HostClient[]
  subscribe(listener: () => void): () => void
}

export interface HostOptions {
  /** Override the transport fetch per target. Defaults to the logging browser fetch. */
  fetchFor?: (target: HostTarget) => FetchLike
  /** Feature hooks run on every new Client before it connects (e.g. an elicitation handler). */
  clientSetup?: Array<(client: Client, host: HostApi) => void>
  capabilities?: ClientOptions['capabilities']
}

function pageOrigin(): string {
  return typeof window === 'undefined' ? 'http://localhost:6060' : window.location.origin
}

/**
 * The demo's MCP host: ONE host, ONE Client per server (the MCP Client lesson).
 * Observable like log-store, so React can use it with useSyncExternalStore.
 */
export function createHost(options: HostOptions = {}): HostApi {
  const clients = new Map<string, HostClient>()
  const listeners = new Set<() => void>()
  let capabilities = options.capabilities ?? {}
  let snapshot: readonly HostClient[] = []

  // Each connect/disconnect bumps the server's attempt number. A connect that finishes
  // after a newer attempt started is stale: it closes its own client and changes nothing.
  // (React dev mode runs connect → disconnect → connect right away, so this really happens.)
  const attempts = new Map<string, number>()
  const nextAttempt = (id: string) => {
    const attempt = (attempts.get(id) ?? 0) + 1
    attempts.set(id, attempt)
    return attempt
  }

  const emit = () => {
    snapshot = [...clients.values()]
    listeners.forEach((listener) => listener())
  }
  const update = (id: string, patch: Partial<HostClient>) => {
    const current = clients.get(id)
    if (!current) return
    clients.set(id, { ...current, ...patch })
    emit()
  }
  const closeQuietly = async (client: Client | undefined) => {
    try {
      await client?.close()
    } catch {
      // Already closed.
    }
  }

  const host: HostApi = {
    async connect(target) {
      const attempt = nextAttempt(target.id)
      await closeQuietly(clients.get(target.id)?.client)
      clients.set(target.id, { target, status: 'connecting' })
      emit()

      const client = new Client(
        { name: 'ai-learnings-host', version: '1.0.0' },
        { versionNegotiation: { mode: 'auto' }, capabilities },
      )
      for (const setup of options.clientSetup ?? []) setup(client, host)

      const fetchImpl = options.fetchFor?.(target) ?? createLoggingFetch(target.id)
      try {
        await client.connect(new StreamableHTTPClientTransport(new URL(target.url, pageOrigin()), { fetch: fetchImpl }))
        if (attempts.get(target.id) !== attempt) return void (await closeQuietly(client))
        update(target.id, {
          status: 'connected',
          client,
          era: client.getProtocolEra(),
          serverVersion: client.getServerVersion(),
          capabilities: client.getServerCapabilities(),
          error: undefined,
        })
      } catch (error) {
        if (attempts.get(target.id) !== attempt) return
        update(target.id, { status: 'error', client: undefined, error: error instanceof Error ? error.message : String(error) })
      }
    },
    async disconnect(id) {
      nextAttempt(id)
      await closeQuietly(clients.get(id)?.client)
      update(id, { status: 'disconnected', client: undefined })
    },
    async reconnect(id) {
      const current = clients.get(id)
      if (current) await host.connect(current.target)
    },
    async setClientCapabilities(next) {
      capabilities = next ?? {}
      await Promise.all([...clients.values()].map((c) => host.connect(c.target)))
    },
    getClients: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
  return host
}
