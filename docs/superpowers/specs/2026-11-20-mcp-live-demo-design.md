# MCP Live Demo — Overview and Spec Index

Date: 2026-11-20
Status: Draft, awaiting review
Location in app: MCP → **Live Demo** (new sidebar sub-item)

## 1. Goal

A hands-on demo inside the ai-learnings app that shows every concept from the three MCP lessons working for real:

- MCP Server: `app/mcp/mcp-server`
- MCP Client: `app/mcp/mcp-client`
- MCP Architecture: `app/mcp/mcp-architecture`

It uses the official **MCP TypeScript SDK v2**, which implements protocol `2026-07-28`, and the same Barcelona trip example as the lessons.

## 2. Decisions already made

| Topic | Decision |
| --- | --- |
| Where | Inside this Next.js app (no separate project) |
| Modes | **Explorer**: you click each MCP request and see the raw JSON. **Chat**: Claude (`claude-opus-5-5`, via the **Claude API SDK** `@anthropic-ai/sdk`) picks the tools while our browser host runs MCP. |
| Second host | The **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`, Claude Code as a library) connects to the same servers from the server side, so we can compare a host we wrote with one we didn't. Both Claude SDKs are included so you learn how they differ. |
| Local servers | Three: **Travel**, **Weather**, **Calendar/Email** |
| Data | Weather is real ([Open-Meteo](https://open-meteo.com), free, no key). Flights, hotels, calendar and email are mocked in memory using the lesson values. |
| Transports | Streamable HTTP (Next.js routes) **and** stdio (spawned child process) |
| Host | The **browser** is the host: the demo page creates one MCP `Client` per server |
| Remote servers | Free public MCP servers, probed 2026-11-20 (see Spec 7) |
| Structure | **Spec 1 Foundation** is the shared base. **Specs 2–8 are independent features**: each depends only on Foundation, can be built in any order, and touches shared code only by adding one line to each feature registry. |

## 3. Architecture

```text
Browser (the HOST) — app/mcp/live-demo/page.tsx
 ├─ Client → /api/mcp/travel      ┐
 ├─ Client → /api/mcp/weather     ├─ Streamable HTTP, local (createMcpHandler)
 ├─ Client → /api/mcp/calendar    ┘     └─ servers = shell + registered features
 ├─ Client → remote MCP servers   (direct, or /api/mcp-demo/proxy/[id] for no-CORS)  [Spec 7]
 ├─ fetch  → /api/mcp-demo/stdio  (spawns the stdio server, returns captured lines)  [Spec 6]
 ├─ fetch  → /api/mcp-demo/admin  (demo buttons: add meeting, add searchHotels…)     [Spec 1]
 ├─ fetch  → /api/mcp-demo/server-log (everything ANY host sent to our servers)      [Spec 1]
 ├─ fetch  → /api/mcp-demo/chat   (Claude API SDK; key stays on the server)          [Spec 8]
 └─ fetch  → /api/mcp-demo/agent-host                                                 [Spec 9]
              └─ Claude Agent SDK = a 2nd host ──► /api/mcp/travel|weather|calendar
```

### The two Claude SDKs (what you'll learn)

| | Claude API SDK (`@anthropic-ai/sdk`), Spec 8 | Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`), Spec 9 |
| --- | --- | --- |
| What it is | A client for the Messages API | Claude Code packaged as a library |
| Who runs the agent loop | **We do** (our chat loop) | **The SDK does** |
| Who is the MCP host | **Our browser** | **The Agent SDK** (server side) |
| Where MCP traffic is visible | Browser protocol log | Server-side request log |
| Built-in tools | None. Only the tools we pass. | Shell, files, web, and more. **Disabled here**, only our MCP tools are allowed. |

### Feature plug-in contract (defined in Spec 1)

- **Server side:** `ServerFeature { id, register[server], serverOptions[server], adminActions, smoke }` lives in `lib/mcp-demo/features/<id>/server.ts`, and is listed in `lib/mcp-demo/features/server-registry.ts`.
- **Browser side:** `UiFeature { id, tabs, panels, clientSetup }` lives in `components/mcp-demo/features/<id>/index.tsx`, and is listed in `components/mcp-demo/features/ui-registry.ts`.
- Each feature owns its state (`lib/mcp-demo/features/<id>/state.ts`). No feature imports another feature.

### New dependencies

- `@modelcontextprotocol/server`, `@modelcontextprotocol/client` (SDK v2)
- `zod` ^4.2 (imported as `zod/v4`)
- `tsx` (dev)
- `@anthropic-ai/sdk` (Spec 8), `@anthropic-ai/claude-agent-sdk` (Spec 9)
- Credentials: `ANTHROPIC_API_KEY` or an `ant auth login` profile, server-side only

## 4. Spec index (todo list)

Build Spec 1 first. After that, build Specs 2–8 in **any order**. Each spec ends with hands-on checkpoints that you run and confirm.

- [ ] [**Spec 1 — Foundation**](2026-11-20-mcp-demo-1-foundation-design.md): docs reading and spikes, SDK install, three server shells + `searchFlights`, HTTP routes, host, protocol log, Explorer + Tools tab, plug-in contract, notify plumbing, admin route, concept checklist, smoke runner, sidebar item. *Depends on: nothing.*
- [ ] [**Spec 2 — Resources, templates, prompts, completion**](2026-11-20-mcp-demo-2-resources-prompts-design.md): plus resource subscription → `resources/updated`. *Depends on: Spec 1.*
- [ ] [**Spec 3 — Weather and Calendar/Email tools**](2026-11-20-mcp-demo-3-weather-calendar-tools-design.md): real Open-Meteo `checkWeather`, `createCalendarEvent`, `sendEmail`. *Depends on: Spec 1.*
- [ ] [**Spec 4 — Elicitation**](2026-11-20-mcp-demo-4-elicitation-design.md): MRTR form mode, accept/decline/cancel, capability toggle, URL mode, booking status, notes. *Depends on: Spec 1.*
- [ ] [**Spec 5 — Discovery, stateless requests, tool-list changes**](2026-11-20-mcp-demo-5-discovery-notifications-design.md): Discover tab, Raw JSON-RPC tab, `searchHotels` + `list_changed`, missed update. *Depends on: Spec 1.*
- [ ] [**Spec 6 — stdio transport**](2026-11-20-mcp-demo-6-stdio-transport-design.md): stdio entry, bridge, same message over two transports. *Depends on: Spec 1.*
- [ ] [**Spec 7 — Remote MCP servers**](2026-11-20-mcp-demo-7-remote-servers-design.md): DeepWiki / Context7 / Cloudflare Docs (modern), Microsoft Learn (legacy fallback), MCP Playground (CORS via proxy). *Depends on: Spec 1.*
- [ ] [**Spec 8 — Chat mode**](2026-11-20-mcp-demo-8-chat-mode-design.md): five-step Barcelona trip with Claude via the **Claude API SDK**, our browser as host. Uses whatever features are built. *Depends on: Spec 1.*
- [ ] [**Spec 9 — Claude Agent SDK as a second host**](2026-11-20-mcp-demo-9-agent-sdk-host-design.md): the same servers used by a host we didn't write, with traffic seen in the server-side log and a host comparison. *Depends on: Spec 1.*

## 5. Concept coverage map

### Server lesson

| Concept | Spec |
| --- | --- |
| Tools, resources, prompts | 1 (tools), 2 (resources, prompts) |
| `tools/list`, `inputSchema`, `outputSchema` | 1 |
| `tools/call`, `structuredContent` and `content` | 1 (`searchFlights` → EX101 $640) |
| `resources/list`, `resources/read` | 2 (`calendar://events/2027-06`) |
| `resources/templates/list`, templates | 2 (`travel://activities/{city}/{category}`) |
| `prompts/list`, `prompts/get` → user message | 2 (Plan a vacation) |
| `completion/complete` | 2 ("Bar" → Barcelona) |
| Resource subscription, `notifications/resources/updated` | 2 (Add meeting) |
| `id`, `_meta`, `resultType` | 1 (protocol log) |
| 5-step Barcelona trip | 8 |

### Client lesson

| Concept | Spec |
| --- | --- |
| Host, clients, servers | 1 (three local), 7 (remotes), 9 (a second host) |
| Same servers, different hosts | 9 (Agent SDK), 1 (server log shows VS Code / Claude Code / Inspector too) |
| Tools on different servers | 3 |
| Elicitation capability `{}` vs `{form, url}` | 4 |
| MRTR form flow, both round trips | 4 (`bookVacation`) |
| accept / decline / cancel, `confirmBooking: false` | 4 |
| Closing the app before or after confirming | 4 (`getBookingStatus` + note) |
| URL mode (airline sign-in) | 4 |
| Roots and sampling (deprecated) | 4 (info note) |

### Architecture lesson

| Concept | Spec |
| --- | --- |
| Data layer vs transport layer | 6 |
| stdio, local HTTP, remote HTTP | 6, 1, 7 |
| `server/discover` | 5 |
| Stateless request without discover | 5 (Raw JSON-RPC) |
| `subscriptions/listen` → acknowledged → `tools/list_changed` → `tools/list` | 5 |
| Missed update | 5 |
| Legacy vs modern era | 7 (Microsoft Learn vs others) |

## 6. Cross-cutting rules (apply to every spec)

- **Errors:** one failing server, remote or API never breaks the page. Errors show where they happen (client card, panel, tool result). Tool failures are `isError` results, not thrown protocol errors.
- **Security:**
  - Local MCP, admin, stdio and proxy routes are localhost-only, with Host/Origin validation.
  - The proxy uses an id allow-list.
  - The stdio bridge only spawns a fixed command.
  - Anthropic credentials never reach the browser.
  - The Agent SDK host may use only our MCP tools (built-in tools disabled in config), against fixed local URLs.
  - The mock airline page is labeled as a mock and collects nothing.
- **Testing:** each feature adds `smoke` checks to `pnpm mcp:smoke`. Each spec has hands-on checkpoints. Lint and type check stay clean.

## 7. Out of scope

- Real flight, hotel, calendar or email providers
- Auth/OAuth on the local servers
- Deploying to a public URL (remote HTTP is shown through third-party servers)
- Roots and sampling as working features (deprecated)
