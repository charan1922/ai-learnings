# MCP Demo — Spec 1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the shared base of the MCP Live Demo:

- three local MCP servers over Streamable HTTP inside Next.js
- a browser host with a live protocol log
- a server-side request log
- an Explorer with a Tools tab
- the feature plug-in contract
- notification plumbing
- an admin route
- a concept checklist
- a smoke runner

**Architecture:**

- **Server side:** `createMcpHandler` (one cached handler per server, held on `globalThis` so it survives Next.js module reloads) serves a factory that builds a fresh `McpServer` per request from a base shell plus registered features. A localhost guard and an inbound logger sit in front of `handler.fetch`.
- **Browser side:** a small host creates one `Client` per server, whose transport `fetch` is wrapped to log every JSON-RPC message.
- **Tests:** they drive the same `serveMcp` function in-process, without sockets.

**Tech Stack:**

- Next.js 16.4 App Router, React 19.3, TypeScript, Tailwind v4
- `@modelcontextprotocol/server` 2.4.0, `@modelcontextprotocol/client` 2.4.0
- `zod` 4.6.7 (imported as `zod/v4`), `tsx` 4.23.15
- Tests: `node:test` + `node:assert/strict`

**Spec:** [`docs/superpowers/specs/2026-11-20-mcp-demo-1-foundation-design.md`](../specs/2026-11-20-mcp-demo-1-foundation-design.md)

## Global Constraints

- SDK packages are already installed: `@modelcontextprotocol/server@^2.4.0`, `@modelcontextprotocol/client@^2.4.0`, `zod@^4.6.7`, `tsx@^4.23.15` (dev). **Do not change dependency versions**: another session owns package upgrades. Only add the two `scripts` entries in Task 1 and Task 8.
- Import Zod as `import * as z from 'zod/v4'` (SDK docs requirement).
- Server-only modules (`lib/mcp-demo/servers.ts`, `handlers.ts`, `serve.ts`, `server-log.ts`, `admin.ts`, `in-process.ts`, `search-flights.ts`, `features/server-registry.ts`) must never be imported from a `'use client'` file. Browser modules (`log-store.ts`, `logging-fetch.ts`, `host.ts`, `concepts.ts`, `server-info.ts`) import only `@modelcontextprotocol/client` and other browser modules.
- Every route under `app/api/mcp/**` and `app/api/mcp-demo/**` is localhost-only (`guardLocalhost`). No `runtime` / `dynamic` exports: Next 16 route handlers already run on Node.js and are never cached by default (and `dynamic` is removed under Cache Components). Type the context with the global `RouteContext<'/route/path'>` helper (run `pnpm next typegen` after adding a route).
- Path alias: `@/…` maps to the repo root (`tsconfig.json`).
- Dev server: `pnpm dev` on port **6060**.
- Lesson values: `searchFlights` New York → Barcelona returns `EX101` at `640`. Protocol version `2026-07-28`.
- Tests: `pnpm test:mcp` runs `tsx --test tests/mcp-demo/*.test.ts`.
- Git: work on branch `feat/mcp-live-demo`. Stage per task. **Commit only when the user asks.**

---

### Task 0: Branch

- [ ] **Step 1: Create the working branch**

```bash
git switch -c feat/mcp-live-demo
```

Expected: `Switched to a new branch 'feat/mcp-live-demo'`. Uncommitted changes (specs, `package.json`) come along.

---

### Task 1: Server shells, `searchFlights`, feature contract

**Files:**
- Create: `lib/mcp-demo/server-info.ts`
- Create: `lib/mcp-demo/features/types.ts`
- Create: `lib/mcp-demo/features/server-registry.ts`
- Create: `lib/mcp-demo/search-flights.ts`
- Create: `lib/mcp-demo/servers.ts`
- Create: `tests/mcp-demo/servers.test.ts`
- Modify: `package.json` (add the `test:mcp` script)

**Interfaces:**
- Produces:
  - `SERVER_NAMES`, `type ServerName = 'travel' | 'weather' | 'calendar'`, `SERVER_INFO: Record<ServerName, { title; version; path }>`, `isServerName(value: string): value is ServerName`
  - `interface Notifier { toolsChanged(server: ServerName): void; resourceUpdated(server: ServerName, uri: string): void }`
  - `interface FeatureContext { requestInfo?: Request; notify: Notifier }`
  - `interface AdminContext { notify: Notifier }`
  - `interface SmokeContext { connect(server: ServerName): Promise<Client>; check(name: string, fn: () => Promise<void>): Promise<void> }`
  - `interface ServerFeature { id; register?; serverOptions?; adminActions?; smoke? }`
  - `serverFeatures: ServerFeature[]`
  - `createServer(name: ServerName, ctx: FeatureContext): McpServer`
  - `registerSearchFlights(server: McpServer): void`

- [ ] **Step 1: Add the test script to `package.json`**

In `"scripts"`, add after `"typecheck"`:

```json
    "test:mcp": "tsx --test tests/mcp-demo/*.test.ts"
```

(Add a comma after the previous entry. If another session has edited `package.json`, merge by hand. Don't overwrite its changes.)

- [ ] **Step 2: Write the failing test** — `tests/mcp-demo/servers.test.ts`

```ts
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client'
import { createMcpHandler } from '@modelcontextprotocol/server'

import type { Notifier } from '@/lib/mcp-demo/features/types'
import type { ServerName } from '@/lib/mcp-demo/server-info'
import { createServer } from '@/lib/mcp-demo/servers'

const noopNotifier: Notifier = { toolsChanged() {}, resourceUpdated() {} }

async function connectDirect(name: ServerName) {
  const handler = createMcpHandler(({ requestInfo }) => createServer(name, { requestInfo, notify: noopNotifier }))
  const transport = new StreamableHTTPClientTransport(new URL(`http://localhost:6060/api/mcp/${name}`), {
    fetch: (url, init) => handler.fetch(new Request(url, init)),
  })
  const client = new Client({ name: 'test', version: '1.0.0' }, { versionNegotiation: { mode: 'auto' } })
  await client.connect(transport)
  return {
    client,
    close: async () => {
      await client.close()
      await handler.close()
    },
  }
}

const LESSON_ARGS = { origin: 'New York', destination: 'Barcelona', date: '2027-06-15' }
const LESSON_RESULT = { flights: [{ flightNumber: 'EX101', price: 640 }] }

test('travel server speaks 2026-07-28 and lists searchFlights with both schemas', async () => {
  const { client, close } = await connectDirect('travel')
  try {
    assert.equal(client.getProtocolEra(), 'modern')
    const { tools } = await client.listTools()
    const tool = tools.find((t) => t.name === 'searchFlights')
    assert.ok(tool, 'searchFlights missing from tools/list')
    assert.deepEqual([...(tool.inputSchema.required ?? [])].sort(), ['date', 'destination', 'origin'])
    assert.ok(tool.outputSchema, 'outputSchema missing')
  } finally {
    await close()
  }
})

test('searchFlights returns EX101 for $640 in structuredContent and content', async () => {
  const { client, close } = await connectDirect('travel')
  try {
    const result = await client.callTool({ name: 'searchFlights', arguments: LESSON_ARGS })
    assert.deepEqual(result.structuredContent, LESSON_RESULT)
    const first = (result.content as Array<{ type: string; text?: string }>)[0]
    assert.equal(first.type, 'text')
    assert.deepEqual(JSON.parse(first.text ?? ''), LESSON_RESULT)
  } finally {
    await close()
  }
})

test('searchFlights returns an empty list for an unknown route', async () => {
  const { client, close } = await connectDirect('travel')
  try {
    const result = await client.callTool({
      name: 'searchFlights',
      arguments: { origin: 'Oslo', destination: 'Lima', date: '2027-06-15' },
    })
    assert.deepEqual(result.structuredContent, { flights: [] })
  } finally {
    await close()
  }
})

test('weather and calendar shells connect with no tools yet', async () => {
  for (const name of ['weather', 'calendar'] as const) {
    const { client, close } = await connectDirect(name)
    try {
      const { tools } = await client.listTools()
      assert.equal(tools.length, 0, `${name} should start empty`)
    } finally {
      await close()
    }
  }
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm test:mcp`
Expected: FAIL. `Cannot find module '@/lib/mcp-demo/servers'` (or similar).

- [ ] **Step 4: Write the implementation**

`lib/mcp-demo/server-info.ts` (browser-safe data):

```ts
export const SERVER_NAMES = ['travel', 'weather', 'calendar'] as const
export type ServerName = (typeof SERVER_NAMES)[number]

export const SERVER_INFO: Record<ServerName, { title: string; version: string; path: string }> = {
  travel: { title: 'Travel Server', version: '1.0.0', path: '/api/mcp/travel' },
  weather: { title: 'Weather Server', version: '1.0.0', path: '/api/mcp/weather' },
  calendar: { title: 'Calendar/Email Server', version: '1.0.0', path: '/api/mcp/calendar' },
}

export function isServerName(value: string): value is ServerName {
  return (SERVER_NAMES as readonly string[]).includes(value)
}
```

`lib/mcp-demo/features/types.ts`:

```ts
import type { Client } from '@modelcontextprotocol/client'
import type { McpServer, McpServerOptions } from '@modelcontextprotocol/server'

import type { ServerName } from '../server-info'

/** Publishes change notifications to open `subscriptions/listen` streams (see Task 2). */
export interface Notifier {
  toolsChanged(server: ServerName): void
  resourceUpdated(server: ServerName, uri: string): void
}

/** Passed to every feature's `register` call, once per request. */
export interface FeatureContext {
  requestInfo?: Request
  notify: Notifier
}

/** Passed to admin actions (demo buttons such as "Add searchHotels"). */
export interface AdminContext {
  notify: Notifier
}

/** Passed to each feature's smoke checks by `pnpm mcp:smoke`. */
export interface SmokeContext {
  connect(server: ServerName): Promise<Client>
  check(name: string, fn: () => Promise<void>): Promise<void>
}

/**
 * The server-side plug-in contract. Each feature spec (2–9) creates one of these in
 * lib/mcp-demo/features/<id>/server.ts and adds ONE line to server-registry.ts.
 */
export interface ServerFeature {
  id: string
  register?: Partial<Record<ServerName, (server: McpServer, ctx: FeatureContext) => void>>
  serverOptions?: Partial<Record<ServerName, Partial<McpServerOptions>>>
  adminActions?: Record<string, (ctx: AdminContext) => void | Promise<void>>
  smoke?: (t: SmokeContext) => Promise<void>
}
```

`lib/mcp-demo/features/server-registry.ts`:

```ts
import type { ServerFeature } from './types'

/** Each feature spec adds exactly one line here. No feature imports another feature. */
export const serverFeatures: ServerFeature[] = []
```

`lib/mcp-demo/search-flights.ts`:

```ts
import type { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'

type Flight = { flightNumber: string; price: number }

/** Mock flight data using the lesson's values. Keys are "origin->destination", lowercase. */
const FLIGHTS: Record<string, Flight[]> = {
  'new york->barcelona': [{ flightNumber: 'EX101', price: 640 }],
}

export function registerSearchFlights(server: McpServer): void {
  server.registerTool(
    'searchFlights',
    {
      title: 'Search flights',
      description: 'Search flights between two cities on a given date',
      inputSchema: z.object({
        origin: z.string().describe('Departure city, e.g. New York'),
        destination: z.string().describe('Arrival city, e.g. Barcelona'),
        date: z.string().describe('Travel date, YYYY-MM-DD'),
      }),
      outputSchema: z.object({
        flights: z.array(z.object({ flightNumber: z.string(), price: z.number() })),
      }),
      annotations: { readOnlyHint: true },
    },
    async ({ origin, destination }) => {
      const key = `${origin.trim().toLowerCase()}->${destination.trim().toLowerCase()}`
      const output = { flights: FLIGHTS[key] ?? [] }
      return {
        content: [{ type: 'text', text: JSON.stringify(output) }],
        structuredContent: output,
      }
    },
  )
}
```

`lib/mcp-demo/servers.ts`:

```ts
import { McpServer, type McpServerOptions } from '@modelcontextprotocol/server'

import { serverFeatures } from './features/server-registry'
import type { FeatureContext } from './features/types'
import { registerSearchFlights } from './search-flights'
import { SERVER_INFO, type ServerName } from './server-info'

/**
 * Builds one fresh McpServer for one request (createMcpHandler calls this per request).
 * Base shell: Travel has searchFlights; Weather and Calendar start empty.
 * Every registered feature then adds its tools/resources/prompts.
 */
export function createServer(name: ServerName, ctx: FeatureContext): McpServer {
  const options: McpServerOptions = {}
  for (const feature of serverFeatures) Object.assign(options, feature.serverOptions?.[name])

  const server = new McpServer({ name: `ai-learnings-${name}`, version: SERVER_INFO[name].version }, options)

  if (name === 'travel') registerSearchFlights(server)
  for (const feature of serverFeatures) feature.register?.[name]?.(server, ctx)

  return server
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm test:mcp`
Expected: 4 tests pass.

- [ ] **Step 6: Typecheck and stage**

Run: `pnpm typecheck 2>&1 | grep -E "lib/mcp-demo|tests/mcp-demo" ; echo done`
Expected: no lines before `done`.

```bash
git add package.json lib/mcp-demo tests/mcp-demo
```

---

### Task 2: Handlers, notifier, localhost guard, server-side log, MCP route

**Files:**
- Create: `lib/mcp-demo/server-log.ts`
- Create: `lib/mcp-demo/handlers.ts`
- Create: `lib/mcp-demo/serve.ts`
- Create: `lib/mcp-demo/in-process.ts`
- Create: `app/api/mcp/[server]/route.ts`
- Create: `app/api/mcp-demo/server-log/route.ts`
- Create: `tests/mcp-demo/serve.test.ts`

**Interfaces:**
- Consumes: `createServer`, `isServerName`, `Notifier`, `ServerName` (Task 1)
- Produces:
  - `interface ServerLogEntry { id: number; time: string; server: string; direction: 'in' | 'out'; method?: string; protocolVersion?: string; mcpMethod?: string; mcpName?: string; userAgent?: string; status?: number; contentType?: string; body?: unknown }`
  - `appendServerLog(entry: Omit<ServerLogEntry, 'id' | 'time'>): ServerLogEntry`
  - `readServerLog(since?: number, server?: string): ServerLogEntry[]`
  - `clearServerLog(): void`
  - `getHandler(name: ServerName): McpHttpHandler`
  - `notifier: Notifier`
  - `closeAllHandlers(): Promise<void>`
  - `guardLocalhost(request: Request): Response | undefined`
  - `serveMcp(server: string, request: Request): Promise<Response>`
  - `LOCAL_ORIGIN = 'http://localhost:6060'`
  - `inProcessFetch(server: string): FetchLike`
  - `connectInProcess(server: string, options?: ClientOptions): Promise<Client>`

- [ ] **Step 1: Write the failing test** — `tests/mcp-demo/serve.test.ts`

```ts
import assert from 'node:assert/strict'
import { after, test } from 'node:test'

import { closeAllHandlers, notifier } from '@/lib/mcp-demo/handlers'
import { connectInProcess } from '@/lib/mcp-demo/in-process'
import { serveMcp } from '@/lib/mcp-demo/serve'
import { clearServerLog, readServerLog } from '@/lib/mcp-demo/server-log'

after(async () => {
  await closeAllHandlers()
})

function post(url: string, headers: Record<string, string>) {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', ...headers },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
  })
}

test('rejects a non-localhost Host header with 403', async () => {
  const res = await serveMcp('travel', post('http://evil.example.com/api/mcp/travel', { host: 'evil.example.com' }))
  assert.equal(res.status, 403)
})

test('rejects a foreign Origin header with 403', async () => {
  const res = await serveMcp(
    'travel',
    post('http://localhost:6060/api/mcp/travel', { host: 'localhost:6060', origin: 'https://evil.example.com' }),
  )
  assert.equal(res.status, 403)
})

test('unknown server name returns 404', async () => {
  const res = await serveMcp('nope', post('http://localhost:6060/api/mcp/nope', { host: 'localhost:6060' }))
  assert.equal(res.status, 404)
})

test('a client connected through serveMcp is logged server-side with its protocol version', async () => {
  clearServerLog()
  const client = await connectInProcess('travel')
  try {
    await client.callTool({
      name: 'searchFlights',
      arguments: { origin: 'New York', destination: 'Barcelona', date: '2027-06-15' },
    })
    const call = readServerLog(0, 'travel').find(
      (e) => e.direction === 'in' && (e.body as { method?: string } | undefined)?.method === 'tools/call',
    )
    assert.ok(call, 'inbound tools/call not logged')
    assert.equal(call.protocolVersion, '2026-07-28')
    assert.equal(call.mcpMethod, 'tools/call')
  } finally {
    await client.close()
  }
})

test('notifier.toolsChanged reaches an open subscriptions/listen stream', async () => {
  const client = await connectInProcess('travel')
  try {
    const received = new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('no notifications/tools/list_changed within 3s')), 3000)
      client.setNotificationHandler('notifications/tools/list_changed', () => {
        clearTimeout(timer)
        resolve()
      })
    })
    const subscription = await client.listen({ toolsListChanged: true })
    assert.equal(subscription.honoredFilter.toolsListChanged, true)
    notifier.toolsChanged('travel')
    await received
    await subscription.close()
  } finally {
    await client.close()
  }
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test:mcp`
Expected: FAIL. `Cannot find module '@/lib/mcp-demo/handlers'`.

- [ ] **Step 3: Write the implementation**

`lib/mcp-demo/server-log.ts`:

```ts
export interface ServerLogEntry {
  id: number
  time: string
  server: string
  direction: 'in' | 'out'
  method?: string
  protocolVersion?: string
  mcpMethod?: string
  mcpName?: string
  userAgent?: string
  status?: number
  contentType?: string
  body?: unknown
}

type Store = { nextId: number; entries: ServerLogEntry[] }
const MAX_ENTRIES = 500

// Held on globalThis so every route module (and Next.js dev reloads) share one log.
const g = globalThis as typeof globalThis & { __mcpDemoServerLog?: Store }
const store: Store = (g.__mcpDemoServerLog ??= { nextId: 1, entries: [] })

export function appendServerLog(entry: Omit<ServerLogEntry, 'id' | 'time'>): ServerLogEntry {
  const full: ServerLogEntry = { ...entry, id: store.nextId++, time: new Date().toISOString() }
  store.entries.push(full)
  if (store.entries.length > MAX_ENTRIES) store.entries.splice(0, store.entries.length - MAX_ENTRIES)
  return full
}

export function readServerLog(since = 0, server?: string): ServerLogEntry[] {
  return store.entries.filter((e) => e.id > since && (!server || e.server === server))
}

export function clearServerLog(): void {
  store.entries.length = 0
}
```

`lib/mcp-demo/handlers.ts`:

```ts
import { createMcpHandler, type McpHttpHandler } from '@modelcontextprotocol/server'

import type { Notifier } from './features/types'
import type { ServerName } from './server-info'
import { createServer } from './servers'

type Globals = typeof globalThis & {
  __mcpDemoHandlers?: Map<ServerName, McpHttpHandler>
  __mcpDemoCreateServer?: typeof createServer
}
const g = globalThis as Globals

// Handlers live on globalThis so open subscription streams survive Next.js module reloads,
// while the factory always calls the LATEST createServer (refreshed on every module load).
const handlers: Map<ServerName, McpHttpHandler> = (g.__mcpDemoHandlers ??= new Map())
g.__mcpDemoCreateServer = createServer

export const notifier: Notifier = {
  toolsChanged: (server) => getHandler(server).notify.toolsChanged(),
  resourceUpdated: (server, uri) => getHandler(server).notify.resourceUpdated(uri),
}

export function getHandler(name: ServerName): McpHttpHandler {
  let handler = handlers.get(name)
  if (!handler) {
    handler = createMcpHandler(({ requestInfo }) =>
      (g.__mcpDemoCreateServer ?? createServer)(name, { requestInfo, notify: notifier }),
    )
    handlers.set(name, handler)
  }
  return handler
}

export async function closeAllHandlers(): Promise<void> {
  await Promise.all([...handlers.values()].map((h) => h.close()))
  handlers.clear()
}
```

`lib/mcp-demo/serve.ts`:

```ts
import {
  hostHeaderValidationResponse,
  localhostAllowedHostnames,
  localhostAllowedOrigins,
  originValidationResponse,
} from '@modelcontextprotocol/server'

import { getHandler } from './handlers'
import { isServerName } from './server-info'
import { appendServerLog } from './server-log'

/** 403 unless Host and Origin are localhost (DNS-rebinding protection). A request without Origin passes. */
export function guardLocalhost(request: Request): Response | undefined {
  return (
    hostHeaderValidationResponse(request, localhostAllowedHostnames()) ??
    originValidationResponse(request, localhostAllowedOrigins())
  )
}

/** The single entry point for /api/mcp/[server]: guard → log in → handler.fetch → log out. */
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

function parseMaybeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function logInbound(server: string, request: Request): Promise<void> {
  const body = request.method === 'POST' ? parseMaybeJson(await request.clone().text()) : undefined
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
  // JSON bodies are logged. SSE bodies (including long-lived subscriptions/listen streams)
  // are never read here, because that would block the stream. Only the status is logged.
  const body = contentType?.includes('application/json') ? parseMaybeJson(await response.clone().text()) : undefined
  appendServerLog({ server, direction: 'out', status: response.status, contentType, body })
}
```

`lib/mcp-demo/in-process.ts` (server-side helper for tests and the smoke script):

```ts
import { Client, StreamableHTTPClientTransport, type ClientOptions, type FetchLike } from '@modelcontextprotocol/client'

import { serveMcp } from './serve'

export const LOCAL_ORIGIN = 'http://localhost:6060'

/** A fetch that serves requests in-process through serveMcp, the same path the Next.js route uses. */
export function inProcessFetch(server: string): FetchLike {
  return (url, init) => {
    const headers = new Headers(init?.headers)
    headers.set('host', 'localhost:6060')
    return serveMcp(server, new Request(url, { ...init, headers }))
  }
}

export async function connectInProcess(server: string, options: ClientOptions = {}): Promise<Client> {
  const client = new Client(
    { name: 'in-process', version: '1.0.0' },
    { versionNegotiation: { mode: 'auto' }, ...options },
  )
  await client.connect(
    new StreamableHTTPClientTransport(new URL(`${LOCAL_ORIGIN}/api/mcp/${server}`), { fetch: inProcessFetch(server) }),
  )
  return client
}
```

`app/api/mcp/[server]/route.ts`:

```ts
import { serveMcp } from '@/lib/mcp-demo/serve'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteContext = { params: Promise<{ server: string }> }

async function handle(request: Request, { params }: RouteContext): Promise<Response> {
  const { server } = await params
  return serveMcp(server, request)
}

export const GET = handle
export const POST = handle
export const DELETE = handle
```

`app/api/mcp-demo/server-log/route.ts`:

```ts
import { guardLocalhost } from '@/lib/mcp-demo/serve'
import { clearServerLog, readServerLog } from '@/lib/mcp-demo/server-log'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request): Promise<Response> {
  const rejected = guardLocalhost(request)
  if (rejected) return rejected
  const url = new URL(request.url)
  const since = Number(url.searchParams.get('since') ?? 0) || 0
  const server = url.searchParams.get('server') ?? undefined
  return Response.json({ entries: readServerLog(since, server) })
}

export async function DELETE(request: Request): Promise<Response> {
  const rejected = guardLocalhost(request)
  if (rejected) return rejected
  clearServerLog()
  return new Response(null, { status: 204 })
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test:mcp`
Expected: all tests pass (Task 1: 4, Task 2: 5). If the notification test times out, the notify path is broken. Stop and report it, because Specs 2 and 5 depend on it.

- [ ] **Step 5: Verify the route in the running app**

With `pnpm dev` running:

```bash
curl -s -X POST http://localhost:6060/api/mcp/travel -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}"
curl -s "http://localhost:6060/api/mcp-demo/server-log?server=travel"
```

Expected:
- The first command returns a `tools/list` result containing `searchFlights`. This bare request is legacy-era, which is served statelessly by default.
- The second returns `{"entries":[…]}` with that request logged.

- [ ] **Step 6: Typecheck, lint and stage**

Run: `pnpm typecheck 2>&1 | grep -E "lib/mcp-demo|tests/mcp-demo|app/api/mcp" ; npx eslint lib/mcp-demo app/api/mcp app/api/mcp-demo tests/mcp-demo`
Expected: no typecheck lines and no lint errors.

```bash
git add lib/mcp-demo app/api/mcp app/api/mcp-demo tests/mcp-demo
```

---

### Task 3: Admin action runner and route

**Files:**
- Create: `lib/mcp-demo/admin.ts`
- Create: `app/api/mcp-demo/admin/route.ts`
- Create: `tests/mcp-demo/admin.test.ts`

**Interfaces:**
- Consumes: `serverFeatures`, `ServerFeature`, `AdminContext` (Task 1), `notifier`, `guardLocalhost` (Task 2)
- Produces:
  - `type AdminResult = { ok: true } | { ok: false; status: 404; error: string }`
  - `runAdminAction(featureId: string, action: string, features?: ServerFeature[]): Promise<AdminResult>`

- [ ] **Step 1: Write the failing test** — `tests/mcp-demo/admin.test.ts`

```ts
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { runAdminAction } from '@/lib/mcp-demo/admin'
import type { ServerFeature } from '@/lib/mcp-demo/features/types'

test('unknown feature or action returns a 404 result', async () => {
  assert.deepEqual(await runAdminAction('nope', 'go', []), {
    ok: false,
    status: 404,
    error: 'Unknown admin action: nope/go',
  })
})

test('runs a registered action with the notifier', async () => {
  let ran = false
  const feature: ServerFeature = {
    id: 'demo',
    adminActions: {
      go: ({ notify }) => {
        assert.equal(typeof notify.toolsChanged, 'function')
        ran = true
      },
    },
  }
  assert.deepEqual(await runAdminAction('demo', 'go', [feature]), { ok: true })
  assert.equal(ran, true)
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test:mcp`
Expected: FAIL. `Cannot find module '@/lib/mcp-demo/admin'`.

- [ ] **Step 3: Write the implementation**

`lib/mcp-demo/admin.ts`:

```ts
import { serverFeatures } from './features/server-registry'
import type { ServerFeature } from './features/types'
import { notifier } from './handlers'

export type AdminResult = { ok: true } | { ok: false; status: 404; error: string }

/** Runs a feature's demo action (e.g. "add-meeting"). Features register actions in their ServerFeature. */
export async function runAdminAction(
  featureId: string,
  action: string,
  features: ServerFeature[] = serverFeatures,
): Promise<AdminResult> {
  const run = features.find((f) => f.id === featureId)?.adminActions?.[action]
  if (!run) return { ok: false, status: 404, error: `Unknown admin action: ${featureId}/${action}` }
  await run({ notify: notifier })
  return { ok: true }
}
```

`app/api/mcp-demo/admin/route.ts`:

```ts
import { runAdminAction } from '@/lib/mcp-demo/admin'
import { guardLocalhost } from '@/lib/mcp-demo/serve'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<Response> {
  const rejected = guardLocalhost(request)
  if (rejected) return rejected

  let payload: { feature?: unknown; action?: unknown }
  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: 'Body must be JSON: { feature, action }' }, { status: 400 })
  }
  if (typeof payload.feature !== 'string' || typeof payload.action !== 'string') {
    return Response.json({ error: 'Body must be JSON: { feature, action }' }, { status: 400 })
  }

  const result = await runAdminAction(payload.feature, payload.action)
  return result.ok ? Response.json({ ok: true }) : Response.json({ error: result.error }, { status: result.status })
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test:mcp`
Expected: all tests pass (11).

- [ ] **Step 5: Stage**

```bash
git add lib/mcp-demo/admin.ts app/api/mcp-demo/admin tests/mcp-demo/admin.test.ts
```

---

### Task 4: Browser host core (log store, logging fetch, host)

**Files:**
- Create: `lib/mcp-demo/log-store.ts`
- Create: `lib/mcp-demo/logging-fetch.ts`
- Create: `lib/mcp-demo/host.ts`
- Create: `tests/mcp-demo/host.test.ts`

**Interfaces:**
- Consumes: `SERVER_NAMES`, `SERVER_INFO` (Task 1), `inProcessFetch`, `closeAllHandlers` (Task 2, tests only)
- Produces:
  - `interface LogEntry { id: number; time: string; server: string; direction: 'out' | 'in'; transport: 'http' | 'stdio'; httpStatus?: number; headers?: Record<string, string>; json: unknown }`
  - `logStore: { append(e: Omit<LogEntry, 'id' | 'time'>): void; clear(): void; getSnapshot(): readonly LogEntry[]; subscribe(listener: () => void): () => void }`
  - `createSseParser(onMessage: (json: unknown) => void): (text: string) => void`
  - `pickMcpHeaders(headers: Headers): Record<string, string>`
  - `createLoggingFetch(server: string, baseFetch?: FetchLike): FetchLike`
  - `interface HostTarget { id: string; title: string; url: string }`
  - `LOCAL_TARGETS: HostTarget[]`
  - `type ClientStatus = 'connecting' | 'connected' | 'error' | 'disconnected'`
  - `interface HostClient { target: HostTarget; status: ClientStatus; client?: Client; era?: ReturnType<Client['getProtocolEra']>; serverVersion?: ReturnType<Client['getServerVersion']>; capabilities?: ReturnType<Client['getServerCapabilities']>; error?: string }`
  - `interface HostApi { connect(target: HostTarget): Promise<void>; disconnect(id: string): Promise<void>; reconnect(id: string): Promise<void>; setClientCapabilities(capabilities: ClientOptions['capabilities']): Promise<void>; getClients(): readonly HostClient[]; subscribe(listener: () => void): () => void }`
  - `interface HostOptions { fetchFor?: (target: HostTarget) => FetchLike; clientSetup?: Array<(client: Client, host: HostApi) => void>; capabilities?: ClientOptions['capabilities'] }`
  - `createHost(options?: HostOptions): HostApi`

- [ ] **Step 1: Write the failing test** — `tests/mcp-demo/host.test.ts`

```ts
import assert from 'node:assert/strict'
import { after, beforeEach, test } from 'node:test'

import { closeAllHandlers } from '@/lib/mcp-demo/handlers'
import { createHost, LOCAL_TARGETS } from '@/lib/mcp-demo/host'
import { inProcessFetch } from '@/lib/mcp-demo/in-process'
import { logStore, type LogEntry } from '@/lib/mcp-demo/log-store'
import { createLoggingFetch, createSseParser } from '@/lib/mcp-demo/logging-fetch'

after(async () => {
  await closeAllHandlers()
})
beforeEach(() => logStore.clear())

const methodOf = (e: LogEntry) => (e.json as { method?: string } | null)?.method

test('SSE parser handles split chunks and CRLF line endings', () => {
  const seen: unknown[] = []
  const feed = createSseParser((json) => seen.push(json))
  feed('event: message\r\ndata: {"a":')
  feed('1}\r\n\r\nevent: message\ndata: {"b":2}\n\n')
  assert.deepEqual(seen, [{ a: 1 }, { b: 2 }])
})

test('host connects all three local servers in the modern era', async () => {
  const host = createHost({ fetchFor: (t) => createLoggingFetch(t.id, inProcessFetch(t.id)) })
  await Promise.all(LOCAL_TARGETS.map((t) => host.connect(t)))
  const clients = host.getClients()
  assert.equal(clients.length, 3)
  for (const c of clients) {
    assert.equal(c.status, 'connected', `${c.target.id}: ${c.error}`)
    assert.equal(c.era, 'modern')
  }
  await Promise.all(LOCAL_TARGETS.map((t) => host.disconnect(t.id)))
})

test('logging fetch records the request with _meta and MCP headers, and the response', async () => {
  const host = createHost({ fetchFor: (t) => createLoggingFetch(t.id, inProcessFetch(t.id)) })
  const travel = LOCAL_TARGETS.find((t) => t.id === 'travel')!
  await host.connect(travel)
  const client = host.getClients()[0].client!
  await client.callTool({
    name: 'searchFlights',
    arguments: { origin: 'New York', destination: 'Barcelona', date: '2027-06-15' },
  })

  const entries = logStore.getSnapshot()
  const out = entries.find((e) => e.direction === 'out' && methodOf(e) === 'tools/call')
  assert.ok(out, 'outgoing tools/call not logged')
  const meta = (out.json as { params: { _meta?: Record<string, unknown> } }).params._meta
  assert.equal(meta?.['io.modelcontextprotocol/protocolVersion'], '2026-07-28')
  assert.equal(out.headers?.['mcp-method'], 'tools/call')

  const reply = entries.find(
    (e) => e.direction === 'in' && (e.json as { result?: { structuredContent?: unknown } })?.result?.structuredContent,
  )
  assert.ok(reply, 'tools/call response not logged')
  await host.disconnect('travel')
})

test('a connection failure sets status "error" and keeps the host usable', async () => {
  const host = createHost({ fetchFor: (t) => createLoggingFetch(t.id, inProcessFetch(t.id)) })
  await host.connect({ id: 'nope', title: 'Missing', url: '/api/mcp/nope' })
  const [entry] = host.getClients()
  assert.equal(entry.status, 'error')
  assert.ok(entry.error)
})

test('clientSetup runs once per connect', async () => {
  let calls = 0
  const host = createHost({
    fetchFor: (t) => createLoggingFetch(t.id, inProcessFetch(t.id)),
    clientSetup: [() => calls++],
  })
  const travel = LOCAL_TARGETS.find((t) => t.id === 'travel')!
  await host.connect(travel)
  await host.reconnect('travel')
  assert.equal(calls, 2)
  await host.disconnect('travel')
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test:mcp`
Expected: FAIL. `Cannot find module '@/lib/mcp-demo/host'`.

- [ ] **Step 3: Write the implementation**

`lib/mcp-demo/log-store.ts`:

```ts
export interface LogEntry {
  id: number
  time: string
  server: string
  direction: 'out' | 'in'
  transport: 'http' | 'stdio'
  httpStatus?: number
  headers?: Record<string, string>
  json: unknown
}

type Listener = () => void
const MAX_ENTRIES = 1000

let entries: readonly LogEntry[] = []
let nextId = 1
const listeners = new Set<Listener>()
const emit = () => listeners.forEach((l) => l())

/** Browser-side protocol log. Works with React's useSyncExternalStore (stable snapshots). */
export const logStore = {
  append(entry: Omit<LogEntry, 'id' | 'time'>): void {
    entries = [...entries, { ...entry, id: nextId++, time: new Date().toISOString() }].slice(-MAX_ENTRIES)
    emit()
  },
  clear(): void {
    entries = []
    emit()
  },
  getSnapshot(): readonly LogEntry[] {
    return entries
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
```

`lib/mcp-demo/logging-fetch.ts`:

```ts
import type { FetchLike } from '@modelcontextprotocol/client'

import { logStore } from './log-store'

const MCP_HEADERS = ['mcp-protocol-version', 'mcp-method', 'mcp-name', 'mcp-session-id'] as const

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

/** Incremental SSE parser: feed raw text chunks, get each `data:` payload once its event is complete. */
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
    // Stream closed or aborted. Nothing more to log.
  }
}

/** Wraps a transport fetch so every JSON-RPC message in and out lands in the browser protocol log. */
export function createLoggingFetch(server: string, baseFetch: FetchLike = (url, init) => fetch(url, init)): FetchLike {
  return async (url, init) => {
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

    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('text/event-stream') && response.body) {
      // Tee the stream: one branch for the SDK, one we read as messages arrive (works for long-lived listen streams).
      const [forClient, forLog] = response.body.tee()
      void drainSse(forLog, (json) => logStore.append({ ...meta, json }))
      return new Response(forClient, { status: response.status, statusText: response.statusText, headers: response.headers })
    }

    const text = await response.clone().text()
    if (text) logStore.append({ ...meta, json: parseMaybeJson(text) })
    return response
  }
}
```

`lib/mcp-demo/host.ts`:

```ts
import { Client, StreamableHTTPClientTransport, type ClientOptions, type FetchLike } from '@modelcontextprotocol/client'

import { createLoggingFetch } from './logging-fetch'
import { SERVER_INFO, SERVER_NAMES } from './server-info'

export interface HostTarget {
  id: string
  title: string
  /** Absolute URL, or a path resolved against the page origin (local servers). */
  url: string
}

export const LOCAL_TARGETS: HostTarget[] = SERVER_NAMES.map((name) => ({
  id: name,
  title: SERVER_INFO[name].title,
  url: SERVER_INFO[name].path,
}))

export type ClientStatus = 'connecting' | 'connected' | 'error' | 'disconnected'

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
  /** Override the transport fetch per target (tests use in-process fetch). Defaults to a logging browser fetch. */
  fetchFor?: (target: HostTarget) => FetchLike
  /** Feature hooks run on every new Client before it connects (e.g. registering an elicitation handler). */
  clientSetup?: Array<(client: Client, host: HostApi) => void>
  capabilities?: ClientOptions['capabilities']
}

function pageOrigin(): string {
  return typeof window === 'undefined' ? 'http://localhost:6060' : window.location.origin
}

/** The demo's MCP host: one Client per target, with an observable list for React. */
export function createHost(options: HostOptions = {}): HostApi {
  const clients = new Map<string, HostClient>()
  const listeners = new Set<() => void>()
  let capabilities = options.capabilities ?? {}
  let snapshot: readonly HostClient[] = []

  const emit = () => {
    snapshot = [...clients.values()]
    listeners.forEach((l) => l())
  }
  const update = (id: string, patch: Partial<HostClient>) => {
    const current = clients.get(id)
    if (!current) return
    clients.set(id, { ...current, ...patch })
    emit()
  }
  const closeClient = async (id: string) => {
    const client = clients.get(id)?.client
    if (!client) return
    try {
      await client.close()
    } catch {
      // Already closed.
    }
  }

  const host: HostApi = {
    async connect(target) {
      await closeClient(target.id)
      clients.set(target.id, { target, status: 'connecting' })
      emit()

      const client = new Client(
        { name: 'ai-learnings-host', version: '1.0.0' },
        { versionNegotiation: { mode: 'auto' }, capabilities },
      )
      for (const setup of options.clientSetup ?? []) setup(client, host)

      const fetchImpl = options.fetchFor?.(target) ?? createLoggingFetch(target.id)
      try {
        await client.connect(
          new StreamableHTTPClientTransport(new URL(target.url, pageOrigin()), { fetch: fetchImpl }),
        )
        update(target.id, {
          status: 'connected',
          client,
          era: client.getProtocolEra(),
          serverVersion: client.getServerVersion(),
          capabilities: client.getServerCapabilities(),
          error: undefined,
        })
      } catch (error) {
        update(target.id, { status: 'error', client: undefined, error: error instanceof Error ? error.message : String(error) })
      }
    },
    async disconnect(id) {
      await closeClient(id)
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test:mcp`
Expected: all tests pass (16).

- [ ] **Step 5: Typecheck, lint and stage**

Run: `pnpm typecheck 2>&1 | grep -E "lib/mcp-demo|tests/mcp-demo" ; npx eslint lib/mcp-demo tests/mcp-demo`
Expected: no typecheck lines and no lint errors.

```bash
git add lib/mcp-demo tests/mcp-demo
```

---

### Task 5: Concept catalog and the UI feature contract

**Files:**
- Create: `lib/mcp-demo/concepts.ts`
- Create: `components/mcp-demo/features/types.ts`
- Create: `components/mcp-demo/features/ui-registry.ts`
- Create: `tests/mcp-demo/concepts.test.ts`

**Interfaces:**
- Consumes: `LogEntry` (Task 4), `isServerName` (Task 1), `HostApi`, `HostClient` (Task 4)
- Produces:
  - `type Lesson = 'server' | 'client' | 'architecture'`
  - `interface Concept { id: string; label: string; lesson: Lesson; spec: number; detect?: (entries: readonly LogEntry[]) => boolean }`, where a missing `detect` means it's checked by hand
  - `CONCEPTS: Concept[]`
  - `detectedConceptIds(entries: readonly LogEntry[]): Set<string>`
  - `interface TabProps { client: Client; target: HostClient; host: HostApi }`
  - `interface PanelProps { host: HostApi; clients: readonly HostClient[] }`
  - `interface UiFeature { id: string; tabs?: { id: string; label: string; Component: ComponentType<TabProps> }[]; panels?: { id: string; label: string; Component: ComponentType<PanelProps> }[]; clientSetup?: (client: Client, host: HostApi) => void }`
  - `uiFeatures: UiFeature[]`

- [ ] **Step 1: Write the failing test** — `tests/mcp-demo/concepts.test.ts`

```ts
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { CONCEPTS, detectedConceptIds } from '@/lib/mcp-demo/concepts'
import type { LogEntry } from '@/lib/mcp-demo/log-store'

let id = 1
const entry = (server: string, direction: 'out' | 'in', json: unknown): LogEntry => ({
  id: id++,
  time: '',
  server,
  direction,
  transport: 'http',
  json,
})

test('concept ids are unique and every concept names a spec 1–9', () => {
  const ids = CONCEPTS.map((c) => c.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const c of CONCEPTS) assert.ok(c.spec >= 1 && c.spec <= 9, c.id)
})

test('detects Foundation concepts from a typical log', () => {
  const entries = [
    entry('travel', 'out', { method: 'tools/list', params: { _meta: {} } }),
    entry('travel', 'out', { method: 'tools/call', params: { name: 'searchFlights', _meta: {} } }),
    entry('travel', 'in', { result: { resultType: 'complete', structuredContent: {}, content: [] } }),
    entry('weather', 'out', { method: 'server/discover', params: { _meta: {} } }),
    entry('calendar', 'out', { method: 'server/discover', params: { _meta: {} } }),
  ]
  const found = detectedConceptIds(entries)
  for (const idToFind of ['tools-list', 'tools-call', 'protocol-fields', 'host-clients', 'server-discover']) {
    assert.ok(found.has(idToFind), `expected ${idToFind}`)
  }
  assert.ok(!found.has('resources-read'))
  assert.ok(!found.has('remote-http'))
})

test('remote traffic and the legacy initialize are detected', () => {
  const found = detectedConceptIds([entry('deepwiki', 'out', { method: 'initialize', params: {} })])
  assert.ok(found.has('remote-http'))
  assert.ok(found.has('legacy-era'))
})

test('manual concepts are never auto-detected', () => {
  const manual = CONCEPTS.filter((c) => !c.detect).map((c) => c.id)
  assert.ok(manual.includes('barcelona-trip'))
  const found = detectedConceptIds([entry('travel', 'out', { method: 'tools/list' })])
  for (const m of manual) assert.ok(!found.has(m), m)
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm test:mcp`
Expected: FAIL. `Cannot find module '@/lib/mcp-demo/concepts'`.

- [ ] **Step 3: Write the implementation**

`lib/mcp-demo/concepts.ts`:

```ts
import type { LogEntry } from './log-store'
import { isServerName } from './server-info'

export type Lesson = 'server' | 'client' | 'architecture'

export interface Concept {
  id: string
  label: string
  lesson: Lesson
  /** The spec that demonstrates it (shown while it's not ticked yet). */
  spec: number
  /** Auto-detection from the browser protocol log. Missing → checked by hand. */
  detect?: (entries: readonly LogEntry[]) => boolean
}

type Json = Record<string, unknown>
const asObject = (value: unknown): Json | undefined =>
  value && typeof value === 'object' ? (value as Json) : undefined
const methodOf = (e: LogEntry) => {
  const m = asObject(e.json)?.method
  return typeof m === 'string' ? m : undefined
}
const resultOf = (e: LogEntry) => asObject(asObject(e.json)?.result)
const paramsOf = (e: LogEntry) => asObject(asObject(e.json)?.params)

const sent = (method: string) => (entries: readonly LogEntry[]) =>
  entries.some((e) => e.direction === 'out' && methodOf(e) === method)
const received = (method: string) => (entries: readonly LogEntry[]) =>
  entries.some((e) => e.direction === 'in' && methodOf(e) === method)
const textMatches = (direction: 'out' | 'in', pattern: RegExp) => (entries: readonly LogEntry[]) =>
  entries.some((e) => e.direction === direction && pattern.test(JSON.stringify(e.json)))

export const CONCEPTS: Concept[] = [
  // MCP Server lesson
  { id: 'tools-list', label: 'tools/list — inputSchema & outputSchema', lesson: 'server', spec: 1, detect: sent('tools/list') },
  {
    id: 'tools-call',
    label: 'tools/call — structuredContent + content',
    lesson: 'server',
    spec: 1,
    detect: (entries) => entries.some((e) => e.direction === 'in' && resultOf(e)?.structuredContent !== undefined),
  },
  {
    id: 'protocol-fields',
    label: 'Protocol fields — id, _meta, resultType',
    lesson: 'server',
    spec: 1,
    detect: (entries) =>
      entries.some((e) => e.direction === 'out' && paramsOf(e)?._meta !== undefined) &&
      entries.some((e) => e.direction === 'in' && resultOf(e)?.resultType !== undefined),
  },
  { id: 'resources-list', label: 'resources/list', lesson: 'server', spec: 2, detect: sent('resources/list') },
  { id: 'resources-read', label: 'resources/read', lesson: 'server', spec: 2, detect: sent('resources/read') },
  { id: 'templates', label: 'resources/templates/list — fill a template', lesson: 'server', spec: 2, detect: sent('resources/templates/list') },
  { id: 'prompts-list', label: 'prompts/list — the empty form', lesson: 'server', spec: 2, detect: sent('prompts/list') },
  { id: 'prompts-get', label: 'prompts/get — user message', lesson: 'server', spec: 2, detect: sent('prompts/get') },
  { id: 'completion', label: 'completion/complete — "Bar" → Barcelona', lesson: 'server', spec: 2, detect: sent('completion/complete') },
  { id: 'resource-updated', label: 'notifications/resources/updated → re-read', lesson: 'server', spec: 2, detect: received('notifications/resources/updated') },
  { id: 'barcelona-trip', label: 'The 5-step Barcelona trip', lesson: 'server', spec: 8 },

  // MCP Client lesson
  {
    id: 'host-clients',
    label: 'One host, one client per server',
    lesson: 'client',
    spec: 1,
    detect: (entries) => new Set(entries.map((e) => e.server)).size >= 3,
  },
  { id: 'elicitation-capability', label: 'Elicitation capability {} vs {form, url}', lesson: 'client', spec: 4, detect: textMatches('out', /"elicitation"/) },
  {
    id: 'mrtr',
    label: 'MRTR — input_required → inputResponses + requestState',
    lesson: 'client',
    spec: 4,
    detect: (entries) =>
      entries.some((e) => e.direction === 'in' && resultOf(e)?.resultType === 'input_required') &&
      entries.some((e) => e.direction === 'out' && paramsOf(e)?.inputResponses !== undefined),
  },
  { id: 'elicitation-actions', label: 'accept / decline / cancel', lesson: 'client', spec: 4, detect: textMatches('out', /"action":"(decline|cancel)"/) },
  { id: 'url-mode', label: 'URL mode — airline sign-in', lesson: 'client', spec: 4, detect: textMatches('in', /"mode":"url"/) },
  { id: 'closing-app', label: 'Closing the app before / after confirming', lesson: 'client', spec: 4 },
  { id: 'roots-sampling', label: 'Roots & sampling (deprecated)', lesson: 'client', spec: 4 },

  // MCP Architecture lesson
  { id: 'data-vs-transport', label: 'Same message over stdio and HTTP', lesson: 'architecture', spec: 6, detect: (entries) => entries.some((e) => e.transport === 'stdio') },
  { id: 'server-discover', label: 'server/discover', lesson: 'architecture', spec: 5, detect: sent('server/discover') },
  { id: 'stateless-request', label: 'Stateless request without discover (Raw JSON-RPC)', lesson: 'architecture', spec: 5 },
  { id: 'subscriptions-listen', label: 'subscriptions/listen', lesson: 'architecture', spec: 5, detect: sent('subscriptions/listen') },
  { id: 'tools-list-changed', label: 'notifications/tools/list_changed → tools/list', lesson: 'architecture', spec: 5, detect: received('notifications/tools/list_changed') },
  { id: 'missed-update', label: 'Missed update → reconnect → tools/list', lesson: 'architecture', spec: 5 },
  {
    id: 'remote-http',
    label: 'Remote Streamable HTTP server',
    lesson: 'architecture',
    spec: 7,
    detect: (entries) => entries.some((e) => !isServerName(e.server)),
  },
  { id: 'legacy-era', label: 'Legacy era — initialize fallback', lesson: 'architecture', spec: 7, detect: sent('initialize') },
  { id: 'other-hosts', label: 'Same servers, a different host (Agent SDK)', lesson: 'architecture', spec: 9 },
]

export function detectedConceptIds(entries: readonly LogEntry[]): Set<string> {
  return new Set(CONCEPTS.filter((c) => c.detect?.(entries)).map((c) => c.id))
}
```

`components/mcp-demo/features/types.ts`:

```ts
import type { Client } from '@modelcontextprotocol/client'
import type { ComponentType } from 'react'

import type { HostApi, HostClient } from '@/lib/mcp-demo/host'

export interface TabProps {
  client: Client
  target: HostClient
  host: HostApi
}

export interface PanelProps {
  host: HostApi
  clients: readonly HostClient[]
}

/**
 * The browser-side plug-in contract. Each feature spec (2–9) creates one of these in
 * components/mcp-demo/features/<id>/index.tsx and adds ONE line to ui-registry.ts.
 */
export interface UiFeature {
  id: string
  tabs?: { id: string; label: string; Component: ComponentType<TabProps> }[]
  panels?: { id: string; label: string; Component: ComponentType<PanelProps> }[]
  clientSetup?: (client: Client, host: HostApi) => void
}
```

`components/mcp-demo/features/ui-registry.ts`:

```ts
import type { UiFeature } from './types'

/** Each feature spec adds exactly one line here. No feature imports another feature. */
export const uiFeatures: UiFeature[] = []
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test:mcp`
Expected: all tests pass (20).

- [ ] **Step 5: Stage**

```bash
git add lib/mcp-demo/concepts.ts components/mcp-demo/features tests/mcp-demo/concepts.test.ts
```

---

### Task 6: Live Demo page shell, host panel, protocol log, sidebar

**Files:**
- Create: `components/mcp-demo/use-host.ts`
- Create: `components/mcp-demo/json-view.tsx`
- Create: `components/mcp-demo/host-panel.tsx`
- Create: `components/mcp-demo/protocol-log.tsx`
- Create: `components/mcp-demo/live-demo.tsx`
- Create: `app/mcp/live-demo/page.tsx`
- Modify: `components/sidebar.tsx` (MCP `subItems`)
- Modify: `lib/navigate.ts` (`mcp` branch)
- Modify: `app/mcp/layout.tsx` (`getActiveSubsection`)

**Interfaces:**
- Consumes: `createHost`, `LOCAL_TARGETS`, `HostApi`, `HostClient` (Task 4), `logStore`, `LogEntry` (Task 4), `ServerLogEntry` (Task 2), `uiFeatures` (Task 5)
- Produces:
  - `useHost(): { host: HostApi; clients: readonly HostClient[] }`
  - `useLogEntries(): readonly LogEntry[]`
  - `<JsonView value: unknown />`
  - `<HostPanel clients />`
  - `<ProtocolLog />`
  - `<LiveDemo />`

UI tasks are verified in the running app, not with unit tests. The project has no React test setup, and adding one is out of scope.

- [ ] **Step 1: Write `components/mcp-demo/use-host.ts`**

```ts
'use client'

import { useEffect, useMemo, useSyncExternalStore } from 'react'

import { createHost, LOCAL_TARGETS, type HostApi, type HostClient } from '@/lib/mcp-demo/host'
import { logStore, type LogEntry } from '@/lib/mcp-demo/log-store'

import { uiFeatures } from './features/ui-registry'

const NO_CLIENTS: readonly HostClient[] = []
const NO_ENTRIES: readonly LogEntry[] = []

/** One host per page: connects the three local servers on mount and closes them on unmount. */
export function useHost(): { host: HostApi; clients: readonly HostClient[] } {
  const host = useMemo(
    () => createHost({ clientSetup: uiFeatures.flatMap((f) => (f.clientSetup ? [f.clientSetup] : [])) }),
    [],
  )
  const clients = useSyncExternalStore(host.subscribe, host.getClients, () => NO_CLIENTS)

  useEffect(() => {
    for (const target of LOCAL_TARGETS) void host.connect(target)
    return () => {
      for (const target of LOCAL_TARGETS) void host.disconnect(target.id)
    }
  }, [host])

  return { host, clients }
}

export function useLogEntries(): readonly LogEntry[] {
  return useSyncExternalStore(logStore.subscribe, logStore.getSnapshot, () => NO_ENTRIES)
}
```

- [ ] **Step 2: Write `components/mcp-demo/json-view.tsx`**

```tsx
const HIGHLIGHT = /"(id|_meta|resultType)":/

/** Pretty JSON with the lesson's protocol fields (id, _meta, resultType) highlighted. */
export function JsonView({ value }: { value: unknown }) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  return (
    <pre className="bg-slate-900 text-slate-100 rounded-md p-3 text-[11px] leading-relaxed overflow-x-auto max-h-80">
      {text.split('\n').map((line, i) => (
        <div key={i} className={HIGHLIGHT.test(line) ? 'bg-amber-500/25 -mx-3 px-3' : undefined}>
          {line || ' '}
        </div>
      ))}
    </pre>
  )
}
```

- [ ] **Step 3: Write `components/mcp-demo/host-panel.tsx`**

```tsx
import type { HostClient } from '@/lib/mcp-demo/host'

const STATUS_STYLE: Record<HostClient['status'], string> = {
  connecting: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  connected: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  disconnected: 'bg-muted text-muted-foreground',
}

export function HostPanel({ clients }: { clients: readonly HostClient[] }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Host — one client per server</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {clients.map((c) => (
          <div key={c.target.id} className="rounded-lg border border-border p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-sm truncate">{c.target.title}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_STYLE[c.status]}`}>{c.status}</span>
            </div>
            <div className="font-mono text-muted-foreground truncate">{c.target.url}</div>
            <div>
              Transport: <strong>Streamable HTTP</strong>
            </div>
            {c.era && (
              <div>
                Era: <strong>{c.era}</strong> {c.era === 'modern' ? '(2026-07-28)' : '(2025)'}
              </div>
            )}
            {c.capabilities && (
              <div className="text-muted-foreground">Capabilities: {Object.keys(c.capabilities).join(', ') || 'none yet'}</div>
            )}
            {c.error && <div className="text-red-600 dark:text-red-400 break-words">{c.error}</div>}
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Write `components/mcp-demo/protocol-log.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'

import { logStore } from '@/lib/mcp-demo/log-store'
import type { ServerLogEntry } from '@/lib/mcp-demo/server-log'

import { JsonView } from './json-view'
import { useLogEntries } from './use-host'

type View = 'browser' | 'server'

function useServerLog(active: boolean): { entries: ServerLogEntry[]; clear: () => Promise<void> } {
  const [entries, setEntries] = useState<ServerLogEntry[]>([])
  useEffect(() => {
    if (!active) return
    let since = 0
    let stopped = false
    const poll = async () => {
      try {
        const res = await fetch(`/api/mcp-demo/server-log?since=${since}`)
        if (!res.ok) return
        const { entries: fresh } = (await res.json()) as { entries: ServerLogEntry[] }
        if (stopped || fresh.length === 0) return
        since = fresh[fresh.length - 1].id
        setEntries((prev) => [...prev, ...fresh].slice(-500))
      } catch {
        // Dev server restarting. Try again on the next tick.
      }
    }
    void poll()
    const timer = setInterval(poll, 1500)
    return () => {
      stopped = true
      clearInterval(timer)
    }
  }, [active])
  return {
    entries,
    clear: async () => {
      await fetch('/api/mcp-demo/server-log', { method: 'DELETE' })
      setEntries([])
    },
  }
}

function summary(json: unknown): string {
  const obj = (json && typeof json === 'object' ? json : {}) as Record<string, unknown>
  if (typeof obj.method === 'string') return obj.method
  const result = obj.result as Record<string, unknown> | undefined
  if (result) return `result${typeof result.resultType === 'string' ? ` · ${result.resultType}` : ''}`
  if (obj.error) return 'error'
  return typeof json === 'string' ? json.slice(0, 40) : '—'
}

export function ProtocolLog() {
  const [view, setView] = useState<View>('browser')
  const browserEntries = useLogEntries()
  const server = useServerLog(view === 'server')

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-lg font-semibold">Protocol log</h2>
        <div className="flex items-center gap-1 text-xs">
          {(['browser', 'server'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2.5 py-1 rounded border border-border ${view === v ? 'bg-accent font-medium' : 'hover:bg-accent/60'}`}
            >
              {v === 'browser' ? 'Browser host' : 'Server side (all hosts)'}
            </button>
          ))}
          <button
            onClick={() => (view === 'browser' ? logStore.clear() : void server.clear())}
            className="px-2.5 py-1 rounded border border-border hover:bg-accent/60"
          >
            Clear
          </button>
        </div>
      </div>

      <ol className="space-y-1.5">
        {view === 'browser'
          ? [...browserEntries].reverse().map((e) => (
              <li key={e.id}>
                <details className="rounded border border-border text-xs">
                  <summary className="cursor-pointer px-2 py-1.5 flex items-center gap-2">
                    <span className={e.direction === 'out' ? 'text-blue-600' : 'text-emerald-600'}>{e.direction === 'out' ? '→' : '←'}</span>
                    <span className="font-mono text-muted-foreground w-20 truncate">{e.server}</span>
                    <span className="font-mono">{summary(e.json)}</span>
                    {e.httpStatus && <span className="ml-auto text-muted-foreground">HTTP {e.httpStatus}</span>}
                  </summary>
                  <div className="p-2 space-y-2">
                    {e.headers && Object.keys(e.headers).length > 0 && <JsonView value={e.headers} />}
                    <JsonView value={e.json} />
                  </div>
                </details>
              </li>
            ))
          : [...server.entries].reverse().map((e) => (
              <li key={e.id}>
                <details className="rounded border border-border text-xs">
                  <summary className="cursor-pointer px-2 py-1.5 flex items-center gap-2">
                    <span className={e.direction === 'in' ? 'text-blue-600' : 'text-emerald-600'}>{e.direction === 'in' ? '⇢ in' : '⇠ out'}</span>
                    <span className="font-mono text-muted-foreground w-20 truncate">{e.server}</span>
                    <span className="font-mono">{e.direction === 'in' ? e.mcpMethod ?? summary(e.body) : `HTTP ${e.status}`}</span>
                    {e.protocolVersion && <span className="ml-auto text-muted-foreground">{e.protocolVersion}</span>}
                  </summary>
                  <div className="p-2">
                    <JsonView value={e} />
                  </div>
                </details>
              </li>
            ))}
      </ol>
    </section>
  )
}
```

- [ ] **Step 5: Write `components/mcp-demo/live-demo.tsx` and the page**

`components/mcp-demo/live-demo.tsx`:

```tsx
'use client'

import { HostPanel } from './host-panel'
import { ProtocolLog } from './protocol-log'
import { useHost } from './use-host'
import { uiFeatures } from './features/ui-registry'

export function LiveDemo() {
  const { host, clients } = useHost()

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-950/40 dark:to-sky-950/40 border-2 border-cyan-200 dark:border-cyan-800/50 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">MCP Live Demo</h1>
        <p className="text-sm text-cyan-800 dark:text-cyan-200 mt-1">
          This page is the <strong>host</strong>. It runs one MCP client per server and logs every message.
        </p>
      </div>

      <HostPanel clients={clients} />

      {uiFeatures.flatMap((f) => f.panels ?? []).map(({ id, label, Component }) => (
        <section key={id} className="space-y-3">
          <h2 className="text-lg font-semibold">{label}</h2>
          <Component host={host} clients={clients} />
        </section>
      ))}

      <ProtocolLog />
    </div>
  )
}
```

`app/mcp/live-demo/page.tsx`:

```tsx
import { LiveDemo } from '@/components/mcp-demo/live-demo'

export default function McpLiveDemoPage() {
  return <LiveDemo />
}
```

- [ ] **Step 6: Wire the sidebar, navigation and layout**

`components/sidebar.tsx`, in `subItems.mcp`, add after the `mcp-architecture` line:

```ts
    { id: "mcp-live-demo", label: "Live Demo", description: "Hands-on MCP host, servers & protocol log" },
```

`lib/navigate.ts`, in the `mcp` branch, add before the `else` default:

```ts
    else if (subsection === "mcp-live-demo") window.location.href = "/mcp/live-demo"
```

`app/mcp/layout.tsx`, in `getActiveSubsection`, add before `return "mcp-server"`:

```ts
    if (pathname.includes("/live-demo")) return "mcp-live-demo"
```

- [ ] **Step 7: Verify in the running app**

Run `pnpm dev` and open `http://localhost:6060/mcp/live-demo`.

Expected:
- the sidebar shows **Live Demo** under MCP, highlighted
- three host cards, all **connected**, era **modern (2026-07-28)**
- the Protocol log (Browser host) shows `server/discover` out and results in for each server
- switching to **Server side** shows the inbound requests with `2026-07-28`

- [ ] **Step 8: Typecheck, lint and stage**

Run: `pnpm typecheck 2>&1 | grep -E "mcp-demo|app/mcp|sidebar|navigate" ; npx eslint components/mcp-demo app/mcp components/sidebar.tsx lib/navigate.ts`
Expected: no typecheck lines and no lint errors.

```bash
git add components/mcp-demo app/mcp components/sidebar.tsx lib/navigate.ts
```

---

### Task 7: Explorer with the Tools tab, and the concept checklist

**Files:**
- Create: `components/mcp-demo/explorer.tsx`
- Create: `components/mcp-demo/explorer/tools-tab.tsx`
- Create: `components/mcp-demo/concept-checklist.tsx`
- Modify: `components/mcp-demo/live-demo.tsx` (render Explorer and ConceptChecklist)

**Interfaces:**
- Consumes: `TabProps`, `uiFeatures` (Task 5), `HostApi`, `HostClient` (Task 4), `CONCEPTS`, `detectedConceptIds` (Task 5), `useLogEntries` (Task 6), `JsonView` (Task 6)
- Produces:
  - `<Explorer host clients />`
  - `<ToolsTab client target host />`
  - `<ConceptChecklist />`

- [ ] **Step 1: Write `components/mcp-demo/explorer/tools-tab.tsx`**

```tsx
'use client'

import { useCallback, useEffect, useState } from 'react'

import type { TabProps } from '../features/types'
import { JsonView } from '../json-view'

type Tool = Awaited<ReturnType<TabProps['client']['listTools']>>['tools'][number]
type CallResult = Awaited<ReturnType<TabProps['client']['callTool']>>

/** Pre-filled arguments using the lesson's values. */
const EXAMPLE_ARGS: Record<string, unknown> = {
  searchFlights: { origin: 'New York', destination: 'Barcelona', date: '2027-06-15' },
}

function argsTemplate(tool: Tool): string {
  if (EXAMPLE_ARGS[tool.name]) return JSON.stringify(EXAMPLE_ARGS[tool.name], null, 2)
  const props = Object.keys((tool.inputSchema.properties ?? {}) as Record<string, unknown>)
  return JSON.stringify(Object.fromEntries(props.map((p) => [p, ''])), null, 2)
}

export function ToolsTab({ client }: TabProps) {
  const [tools, setTools] = useState<Tool[]>([])
  const [selected, setSelected] = useState<Tool | undefined>()
  const [args, setArgs] = useState('{}')
  const [result, setResult] = useState<CallResult | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    setError(undefined)
    try {
      const { tools: list } = await client.listTools()
      setTools(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [client])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const select = (tool: Tool) => {
    setSelected(tool)
    setArgs(argsTemplate(tool))
    setResult(undefined)
    setError(undefined)
  }

  const call = async () => {
    if (!selected) return
    setBusy(true)
    setError(undefined)
    try {
      setResult(await client.callTool({ name: selected.name, arguments: JSON.parse(args) as Record<string, unknown> }))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => void refresh()} className="text-xs px-2.5 py-1 rounded border border-border hover:bg-accent/60">
          tools/list
        </button>
        {tools.map((t) => (
          <button
            key={t.name}
            onClick={() => select(t)}
            className={`text-xs px-2.5 py-1 rounded border border-border font-mono ${selected?.name === t.name ? 'bg-accent font-semibold' : 'hover:bg-accent/60'}`}
          >
            {t.name}
          </button>
        ))}
        {tools.length === 0 && <span className="text-xs text-muted-foreground">No tools on this server yet.</span>}
      </div>

      {selected && (
        <div className="space-y-3">
          {selected.description && <p className="text-sm text-muted-foreground">{selected.description}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold mb-1">inputSchema</p>
              <JsonView value={selected.inputSchema} />
            </div>
            <div>
              <p className="text-xs font-semibold mb-1">outputSchema</p>
              <JsonView value={selected.outputSchema ?? 'none'} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold mb-1">arguments</p>
            <textarea
              value={args}
              onChange={(e) => setArgs(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-border bg-background p-2 font-mono text-xs"
            />
          </div>
          <button
            onClick={() => void call()}
            disabled={busy}
            className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
          >
            {busy ? 'Calling…' : `tools/call ${selected.name}`}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400 break-words">{error}</p>}

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold mb-1">content {result.isError ? '(isError: true)' : ''}</p>
            <JsonView value={result.content} />
          </div>
          <div>
            <p className="text-xs font-semibold mb-1">structuredContent</p>
            <JsonView value={result.structuredContent ?? 'none'} />
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write `components/mcp-demo/explorer.tsx`**

```tsx
'use client'

import { useState, type ComponentType } from 'react'

import type { HostApi, HostClient } from '@/lib/mcp-demo/host'

import { ToolsTab } from './explorer/tools-tab'
import type { TabProps } from './features/types'
import { uiFeatures } from './features/ui-registry'

const BUILT_IN_TABS: { id: string; label: string; Component: ComponentType<TabProps> }[] = [
  { id: 'tools', label: 'Tools', Component: ToolsTab },
]

export function Explorer({ host, clients }: { host: HostApi; clients: readonly HostClient[] }) {
  const connected = clients.filter((c) => c.status === 'connected' && c.client)
  const [serverId, setServerId] = useState<string>('travel')
  const [tabId, setTabId] = useState<string>('tools')

  const tabs = [...BUILT_IN_TABS, ...uiFeatures.flatMap((f) => f.tabs ?? [])]
  const target = connected.find((c) => c.target.id === serverId) ?? connected[0]
  const tab = tabs.find((t) => t.id === tabId) ?? tabs[0]

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Explorer</h2>
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-muted-foreground">Server:</span>
        {connected.map((c) => (
          <button
            key={c.target.id}
            onClick={() => setServerId(c.target.id)}
            className={`px-2.5 py-1 rounded border border-border ${target?.target.id === c.target.id ? 'bg-accent font-semibold' : 'hover:bg-accent/60'}`}
          >
            {c.target.title}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1 border-b border-border text-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTabId(t.id)}
            className={`px-3 py-1.5 -mb-px border-b-2 ${tab.id === t.id ? 'border-primary font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {target?.client ? (
        <tab.Component key={`${target.target.id}:${tab.id}`} client={target.client} target={target} host={host} />
      ) : (
        <p className="text-sm text-muted-foreground">Waiting for a connected server…</p>
      )}
    </section>
  )
}
```

- [ ] **Step 3: Write `components/mcp-demo/concept-checklist.tsx`**

```tsx
'use client'

import { useMemo } from 'react'

import { CONCEPTS, detectedConceptIds, type Lesson } from '@/lib/mcp-demo/concepts'

import { useLogEntries } from './use-host'

const LESSONS: { id: Lesson; title: string }[] = [
  { id: 'server', title: 'MCP Server lesson' },
  { id: 'client', title: 'MCP Client lesson' },
  { id: 'architecture', title: 'MCP Architecture lesson' },
]

export function ConceptChecklist() {
  const entries = useLogEntries()
  const detected = useMemo(() => detectedConceptIds(entries), [entries])

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Concept checklist</h2>
      <p className="text-xs text-muted-foreground">Concepts tick automatically as their messages appear in the protocol log.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {LESSONS.map((lesson) => (
          <div key={lesson.id} className="rounded-lg border border-border p-3">
            <p className="text-sm font-semibold mb-2">{lesson.title}</p>
            <ul className="space-y-1">
              {CONCEPTS.filter((c) => c.lesson === lesson.id).map((c) => {
                const done = detected.has(c.id)
                return (
                  <li key={c.id} className="text-xs flex gap-2">
                    <span className={done ? 'text-emerald-600' : 'text-muted-foreground'}>{done ? '✔' : c.detect ? '○' : '◇'}</span>
                    <span className={done ? '' : 'text-muted-foreground'}>
                      {c.label}
                      {!done && <span className="ml-1 opacity-70">({c.detect ? `Spec ${c.spec}` : `check by hand · Spec ${c.spec}`})</span>}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Render them in `components/mcp-demo/live-demo.tsx`**

Add the imports:

```tsx
import { ConceptChecklist } from './concept-checklist'
import { Explorer } from './explorer'
```

Then change the body so Explorer follows HostPanel and ConceptChecklist comes before ProtocolLog:

```tsx
      <HostPanel clients={clients} />

      <Explorer host={host} clients={clients} />

      {uiFeatures.flatMap((f) => f.panels ?? []).map(({ id, label, Component }) => (
        <section key={id} className="space-y-3">
          <h2 className="text-lg font-semibold">{label}</h2>
          <Component host={host} clients={clients} />
        </section>
      ))}

      <ConceptChecklist />

      <ProtocolLog />
```

- [ ] **Step 5: Verify in the running app**

Open `http://localhost:6060/mcp/live-demo`. Expected:
- Explorer: the server selector shows all three. The Tools tab on Travel shows `searchFlights`.
- Selecting it shows `inputSchema` and `outputSchema`, with arguments pre-filled with the lesson values.
- **tools/call** shows `EX101`/`640` in both **content** and **structuredContent**.
- The checklist ticks `tools/list`, `tools/call`, protocol fields, one host with one client per server, and `server/discover`. The rest show "Spec N".
- In the log, `_meta` and `resultType` lines are highlighted.

- [ ] **Step 6: Typecheck, lint and stage**

Run: `pnpm typecheck 2>&1 | grep -E "mcp-demo" ; npx eslint components/mcp-demo`
Expected: no typecheck lines and no lint errors.

```bash
git add components/mcp-demo
```

---

### Task 8: Smoke runner and final verification

**Files:**
- Create: `scripts/mcp-demo-smoke.ts`
- Modify: `package.json` (add the `mcp:smoke` script)

**Interfaces:**
- Consumes: `connectInProcess` (Task 2), `closeAllHandlers` (Task 2), `serverFeatures`, `SmokeContext` (Task 1)
- Produces: `pnpm mcp:smoke` exits 0 when every check passes, 1 otherwise.

- [ ] **Step 1: Add the script to `package.json`**

In `"scripts"`, after `"test:mcp"`:

```json
    "mcp:smoke": "tsx scripts/mcp-demo-smoke.ts"
```

- [ ] **Step 2: Write `scripts/mcp-demo-smoke.ts`**

```ts
import assert from 'node:assert/strict'

import { serverFeatures } from '@/lib/mcp-demo/features/server-registry'
import type { SmokeContext } from '@/lib/mcp-demo/features/types'
import { closeAllHandlers } from '@/lib/mcp-demo/handlers'
import { connectInProcess } from '@/lib/mcp-demo/in-process'
import type { Client } from '@modelcontextprotocol/client'

let failures = 0
const opened: Client[] = []

const check: SmokeContext['check'] = async (name, fn) => {
  try {
    await fn()
    console.log(`✔ ${name}`)
  } catch (error) {
    failures++
    console.error(`✘ ${name}\n    ${error instanceof Error ? error.message : String(error)}`)
  }
}

const t: SmokeContext = {
  async connect(server) {
    const client = await connectInProcess(server)
    opened.push(client)
    return client
  },
  check,
}

await check('base: all three servers connect in the modern era', async () => {
  for (const server of ['travel', 'weather', 'calendar'] as const) {
    const client = await t.connect(server)
    assert.equal(client.getProtocolEra(), 'modern', server)
  }
})

await check('base: searchFlights returns EX101 for $640', async () => {
  const client = await t.connect('travel')
  const result = await client.callTool({
    name: 'searchFlights',
    arguments: { origin: 'New York', destination: 'Barcelona', date: '2027-06-15' },
  })
  assert.deepEqual(result.structuredContent, { flights: [{ flightNumber: 'EX101', price: 640 }] })
})

for (const feature of serverFeatures) {
  if (feature.smoke) await feature.smoke(t)
}

await Promise.all(opened.map((c) => c.close().catch(() => undefined)))
await closeAllHandlers()
console.log(failures ? `\n${failures} check(s) failed` : '\nAll smoke checks passed')
process.exit(failures ? 1 : 0)
```

- [ ] **Step 3: Run it**

Run: `pnpm mcp:smoke`
Expected: two `✔` lines, then `All smoke checks passed`, exit code 0.

- [ ] **Step 4: Run the full verification**

Run: `pnpm test:mcp && pnpm mcp:smoke && pnpm typecheck 2>&1 | grep -E "mcp-demo|app/api/mcp|app/mcp|scripts/mcp" ; npx eslint lib/mcp-demo components/mcp-demo app/api/mcp app/api/mcp-demo app/mcp scripts tests/mcp-demo`
Expected: tests pass, smoke passes, no typecheck lines for these paths, no lint errors. (Pre-existing typecheck errors elsewhere in the repo are not part of this spec.)

- [ ] **Step 5: Stage, then hand over the checkpoints**

```bash
git add package.json scripts/mcp-demo-smoke.ts
```

Hand over to the user for the **hands-on checkpoints** from the spec:

1. `npx @modelcontextprotocol/inspector`, connected to `http://localhost:6060/api/mcp/travel` (Streamable HTTP), lists `searchFlights`.
2. `/mcp/live-demo` shows three connected clients, era **modern**.
3. Tools tab: the call returns EX101 for $640 in both panels.
4. The log shows `server/discover`, `tools/list` and `tools/call` with `_meta`, and responses with `resultType: "complete"`.
5. The notification spike passed (the Task 2 test). The admin route returns 404 for an unknown feature: `curl -s -X POST http://localhost:6060/api/mcp-demo/admin -H "Content-Type: application/json" -d "{\"feature\":\"x\",\"action\":\"y\"}"`.
6. With MCP Inspector connected, its requests appear in **Server side** with its `MCP-Protocol-Version`.
7. `pnpm mcp:smoke` passes, and a non-localhost Origin is rejected (Task 2 tests).

Commit only when the user asks.
