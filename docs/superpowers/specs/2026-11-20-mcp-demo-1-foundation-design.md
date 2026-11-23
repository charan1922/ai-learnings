# MCP Demo — Spec 1: Foundation (shared base)

Date: 2026-11-20 · Status: Draft · Parent: [MCP Live Demo overview](2026-11-20-mcp-live-demo-design.md)
Depends on: nothing · **Every other spec depends only on this one.**

## Goal

Build the shared base that every feature plugs into:

- the three local MCP servers (as shells)
- the browser host
- the protocol log
- the Explorer shell
- the feature plug-in contract
- notification plumbing
- the admin route
- the concept checklist
- the smoke runner

After this spec, Specs 2–8 can be built **in any order, independently**. Each one only adds its own folder plus one line in each registry.

## Concepts covered

- Host with three clients for three servers
- `tools/list` (`inputSchema`, `outputSchema`)
- `tools/call` (`structuredContent` and `content`)
- The protocol fields `id`, `_meta`, `resultType`

## Step 0 — Read before building

These SDK v2 pages were not read during research. Read them first, using `https://ts.sdk.modelcontextprotocol.io/v2/llms-full.txt` for full text:

- `serving/sessions-state-scaling.html`
- `servers/notifications.html`
- `clients/subscriptions.html`
- `clients/server-requests.html`
- `testing.html`
- API reference: `createMcpHandler` (`notify`, `bus`), `hostHeaderValidationResponse`, `originValidationResponse`, and the `Transport` interface

Write any findings that change a feature spec into that spec.

## Dependencies

- `@modelcontextprotocol/server`
- `@modelcontextprotocol/client`
- `zod` ^4.2, imported as `zod/v4`
- `tsx` (dev)

Check for ESM/CJS issues with Next 16.

## The feature plug-in contract

Each feature lives in its own folders and touches shared code **only** through two registries.

```ts
// lib/mcp-demo/features/types.ts  (server side)
export type ServerName = 'travel' | 'weather' | 'calendar'
export interface ServerFeature {
  id: string                                                     // e.g. 'elicitation'
  register?: Partial<Record<ServerName, (server: McpServer, ctx: FeatureContext) => void>>
  serverOptions?: Partial<Record<ServerName, Partial<ServerOptions>>>   // e.g. requestState codec
  adminActions?: Record<string, () => void | Promise<void>>       // demo buttons, e.g. 'add-meeting'
  smoke?: (t: SmokeContext) => Promise<void>                      // checks for the smoke script
}
// FeatureContext: { requestInfo, notify } — notify = the plumbing below
```

```ts
// components/mcp-demo/features/types.ts  (browser side)
export interface UiFeature {
  id: string
  tabs?: { id: string; label: string; Component: ComponentType<TabProps> }[]   // Explorer tabs
  panels?: { id: string; label: string; Component: ComponentType<PanelProps> }[] // page sections
  clientSetup?: (client: Client, host: HostApi) => void           // e.g. elicitation handler
}
```

Registries, where each feature spec adds **one line**:

- `lib/mcp-demo/features/server-registry.ts`: `export const serverFeatures: ServerFeature[] = [ /* specs add here */ ]`
- `components/mcp-demo/features/ui-registry.ts`: `export const uiFeatures: UiFeature[] = [ /* specs add here */ ]`

Each server factory builds `new McpServer(info, mergedOptions)` and calls every feature's `register[serverName]`. Feature state lives in the feature's own folder (`lib/mcp-demo/features/<id>/state.ts`).

## Files

| File | Responsibility |
| --- | --- |
| `lib/mcp-demo/servers.ts` | `createServer(name)` builds the `McpServer` (Travel / Weather / Calendar-Email info) and applies the registered features. The **Travel** shell includes `searchFlights` (the base tool). Weather and Calendar start empty. |
| `lib/mcp-demo/searchFlights.ts` | Input `{ origin, destination, date }`, output `{ flights: [{ flightNumber, price }] }`. New York → Barcelona returns EX101 at 640 in both `structuredContent` and `content`. |
| `app/api/mcp/[server]/route.ts` | Module-level cache of `createMcpHandler(() => createServer(name))` per server. `GET`/`POST`/`DELETE`: Host/Origin check (localhost) → `handler.fetch(request)`. Unknown server → 404. `runtime = 'nodejs'`. |
| `lib/mcp-demo/notify.ts` | `notifyToolsListChanged(server)` and `notifyResourceUpdated(server, uri)`, wired to the cached handlers' `notify` / `bus`. **Spike:** prove one notification reaches an open `subscriptions/listen` stream. |
| `app/api/mcp-demo/admin/route.ts` | `POST { feature, action }` runs `serverFeatures[...].adminActions[action]`. Localhost only. Unknown → 404. |
| `lib/mcp-demo/server-log.ts` | **Server-side request log:** an in-memory ring buffer (last ~500) of every JSON-RPC message that **arrives at** `/api/mcp/[server]` and every response sent: time, server, `MCP-Protocol-Version`, `Mcp-Method`, `Mcp-Name`, `User-Agent`, body. The route records each request by reading a clone. This makes traffic from **any** host visible, including VS Code, Claude Code and the Agent SDK (Spec 9). |
| `app/api/mcp-demo/server-log/route.ts` | `GET ?since=<id>&server=<name>` returns new entries. Localhost only. |
| `lib/mcp-demo/log-store.ts` | Subscribable store of `{ id, time, server, direction, transport, httpStatus?, headers?, json }` |
| `lib/mcp-demo/logging-fetch.ts` | Wraps `fetch`. Logs the outgoing JSON and MCP headers (`MCP-Protocol-Version`, `Mcp-Method`, `Mcp-Name`, `Mcp-Session-Id`). Logs the response from a clone (JSON or SSE `data:` lines) and returns the original untouched. |
| `lib/mcp-demo/host.ts` | `HostApi`: `connect(serverName \| remote)`, `disconnect`, `reconnect`, `clients`. Uses `new Client(info, { versionNegotiation: { mode: 'auto' }, capabilities })` with `StreamableHTTPClientTransport(url, { fetch: loggingFetch })`, and runs each `uiFeature.clientSetup`. |
| `lib/mcp-demo/concepts.ts` | The full concept catalog from the overview's coverage map: `{ id, label, lesson, spec, detect: (logEntry) => boolean }`. Detection is by method name or result shape. |
| `app/mcp/live-demo/page.tsx` | Layout: HostPanel · Explorer · feature panels · ConceptChecklist · ProtocolLog |
| `components/mcp-demo/host-panel.tsx` | Card per client: name, URL, transport, era, status, capabilities, error |
| `components/mcp-demo/protocol-log.tsx` | Newest-first log with server and direction badges and expandable JSON. Highlights `id`, `_meta` and `resultType`. Has Clear. Two views: **Browser host** (from `log-store`) and **Server side** (polls `/api/mcp-demo/server-log`, showing every host's traffic). |
| `components/mcp-demo/explorer.tsx` | Server selector, the built-in **Tools** tab, and the tabs from `uiFeatures` |
| `components/mcp-demo/explorer/tools-tab.tsx` | List tools, show the schemas, JSON args (pre-filled), Call, and show the result in `content` and `structuredContent` panels |
| `components/mcp-demo/concept-checklist.tsx` | Ticks concepts live from the log. Unticked concepts show "Spec N" so you can see what's not built yet. |
| `scripts/mcp-demo-smoke.ts` | Connects a `Client` to each server in-process (`fetch: (u, i) => handler.fetch(new Request(u, i))`). Runs the base checks plus every `serverFeatures[].smoke`. `pnpm mcp:smoke`. |
| Sidebar, nav and layout | "Live Demo" sub-item, `/mcp/live-demo` route, active-state detection |

## Done when (hands-on checkpoints)

1. `npx @modelcontextprotocol/inspector` connects to `http://localhost:6060/api/mcp/travel` and lists `searchFlights`.
2. `/mcp/live-demo` shows **three** clients, all connected, with era **modern**.
3. Tools tab: `searchFlights` schemas are visible, and the call returns EX101 for $640 in both panels.
4. The log shows `server/discover`, `tools/list` and `tools/call` with `_meta`, and responses with `resultType: "complete"`.
5. The notification spike works, and an admin call to an unknown feature returns 404.
6. Connecting MCP Inspector (or VS Code) to `/api/mcp/travel` makes its requests appear in the **Server side** log view, with that host's `MCP-Protocol-Version`.
7. `pnpm mcp:smoke` passes. A non-localhost Origin is rejected. Lint and type check are clean.

## Risks

- No Next.js recipe exists in the docs. If `handler.fetch` can't run in a route handler, stop and redesign.
- If notifications can't reach listen streams with cached stateless handlers, Specs 2 and 5 fall back to "poll after admin action". Record that in both specs.
