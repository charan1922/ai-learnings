# MCP Live Demo

A working **MCP host** with **three MCP servers**, built on the MCP TypeScript SDK v2 (protocol `2026-07-28`).
It shows every idea from the three MCP lessons (Server, Client, Architecture) on one page,
using the lessons' Barcelona trip as the example.

- Page: **<http://localhost:6060/mcp/live-demo>**
- The page is the **host**: one MCP client per server, and every MCP message is logged.
- Learning notes from building it: [LEARNINGS.md](./LEARNINGS.md).

---

## Run it

```bash
pnpm install
pnpm dev                 # http://localhost:6060
```

Optional settings in `.env` (see `.env.example`). Everything except the chatbot and the Agent SDK host works without them.

| Variable | What it is for |
| --- | --- |
| `MIMO_API_KEY`, `MIMO_API_URL`, `MIMO_API_MODEL` | Chatbot + Agent SDK host through Xiaomi MiMo (Claude protocol). Used when set. |
| `ANTHROPIC_API_KEY` | Chatbot + Agent SDK host through Claude. Used when no MiMo key is set. |
| `MCP_DEMO_STATE_KEY` | Fixed HMAC key (32+ chars) for elicitation `requestState`. Random per start if unset. |

> **Watch out:** a variable already set in your shell or Windows environment **wins over `.env`**
> (Next.js rule). If the chat says "invalid credentials", check `echo $env:MIMO_API_KEY` in the terminal
> that started `pnpm dev`. The VS Code launch config (`.vscode/launch.json`) drops the inherited copy for you.

Other commands:

```bash
pnpm typecheck           # tsc --noEmit
pnpm mcp:stdio travel    # the same server over stdio (travel | weather | calendar)
```

---

## Where things live

```text
lib/mcp-demo/                    ← server side + shared logic (this folder)
  servers/                       the three MCP servers, grouped by domain
    index.ts                     SERVERS + createServer(name) — a fresh McpServer per request
    types.ts                     ServerDefinition, ServerContext, Notifier
    shared.ts                    toolText, toolError, jsonContents, startingWith
    travel/
      index.ts                   what the Travel server offers (+ requestState check)
      flights.ts                 searchFlights
      hotels.ts                  searchHotels + its on/off switch (tools/list_changed)
      booking.ts                 bookVacation, signInToAirline, getBookingStatus (elicitation)
      booking-store.ts           bookings + the signed requestState codec
      profile.ts                 travel://preferences, travel://past-trips
      activities.ts              travel://activities/{city}/{category} (template + completion)
      trip-planning.ts           the plan-vacation prompt (+ completion)
    weather/
      forecast.ts, open-meteo.ts checkWeather — real data from Open-Meteo
    calendar/
      availability.ts            calendar://events/2027-06 — watchable resource + "add meeting"
      events.ts                  createCalendarEvent + calendar://created-events
      email.ts                   sendEmail + email://outbox (simulated)
  handlers.ts                    one createMcpHandler per server (modern traffic); pushes notifications
  legacy-sessions.ts             sessions for 2025-era hosts (VS Code…): elicitation + notifications
  serve.ts                       serveMcp() + guardLocalhost()
  admin.ts                       runs a server's demo buttons
  host.ts                        the browser host: one Client per server, observable for React
  logging-fetch.ts, log-store.ts the protocol log (browser side)
  server-log.ts                  the protocol log (server side)
  llm-provider.ts                picks MiMo or Claude from process.env
  remotes.ts                     the allowed public remote MCP servers
  server-info.ts                 names, titles, URLs of our three servers
  concepts.ts                    the lesson checklist

app/api/mcp/[server]/route.ts    POST/GET/DELETE /api/mcp/travel|weather|calendar → the MCP servers
app/api/mcp-demo/                helper routes for the page
  admin/                         demo buttons (e.g. remove searchHotels, add a meeting)
  chat/                          ONE model call for the chatbot (the key stays on the server)
  agent-host/                    the Claude Agent SDK as a second host
  stdio/                         runs the stdio server for the transport comparison
  proxy/[id]/                    forwards to listed remote servers only (CORS, no SSRF)
  server-log/                    the server-side log for the page

components/mcp-demo/             the page (browser)
  live-demo.tsx                  layout: lesson tabs on the left, chatbot on the right
  use-host.ts                    React hook around host.ts
  features/<name>/               one folder per lesson topic; listed in features/ui-registry.ts
scripts/mcp-stdio.ts             the stdio entry point
```

The **server** side is grouped by **domain** (travel, weather, calendar).
The **page** side is grouped by **lesson topic**, because that is how the page's tabs are laid out.

---

## How one request flows

```text
browser host (host.ts)                          Next.js server
  Client ── StreamableHTTPClientTransport ──►  /api/mcp/travel  (route.ts)
                                                  → serveMcp → getHandler('travel')   (handlers.ts)
                                                  → createServer('travel')            (servers/index.ts)
                                                  → travelServer.register(server)     (servers/travel/index.ts)
                                                  → the SDK answers tools/list, tools/call, …
```

- **Stateless:** every request builds a **fresh** McpServer. Anything that must survive between
  requests (bookings, the hotels switch, meetings, the outbox) lives on `globalThis`.
- **Modern first:** clients use `versionNegotiation: { mode: 'auto' }` — `server/discover` first,
  falling back to the 2025 `initialize` handshake for older servers.
- **Two eras, one URL:** `serve.ts` asks the SDK's `isLegacyRequest(request)`.
  Modern (2026-07-28) requests → the stateless handler. 2025-era hosts (VS Code, Inspector…) →
  `legacy-sessions.ts`: `initialize` opens a session (`Mcp-Session-Id`) with one McpServer that lives
  until the host ends it, so the server can send `elicitation/create`, `tools/list_changed` and
  `resources/updated` to that host. Tool changes are applied to open sessions by re-running the
  server's `register` on a throwaway server and adding / removing the difference.

---

## What each lesson topic uses

| Topic | Where to see it | Code |
| --- | --- | --- |
| Tools, `structuredContent` | Explorer → Tools | `servers/travel/flights.ts` |
| Resources, templates, completion | Explorer → Resources / Templates | `servers/travel/profile.ts`, `activities.ts` |
| Prompts + completion | Explorer → Prompts, or `/plan-vacation` in the chatbot | `servers/travel/trip-planning.ts` |
| Resource subscriptions | Server lesson → Watch a resource | `servers/calendar/availability.ts` |
| Elicitation (form + URL, MRTR) | Client lesson, or "book it" in the chatbot | `servers/travel/booking.ts` |
| `tools/list_changed` | Architecture → Tool-list changes | `servers/travel/hotels.ts` |
| stdio vs Streamable HTTP | Architecture → Same message, two transports | `scripts/mcp-stdio.ts` |
| Remote servers, legacy era | Architecture → Remote servers | `remotes.ts`, `app/api/mcp-demo/proxy` |
| A model choosing tools | Chatbot (right side) | `components/mcp-demo/features/chat/` |
| A second host | Another host tab | `app/api/mcp-demo/agent-host/route.ts` |

### Tools changed (subscription)

1. The client calls `client.listen({ toolsListChanged: true })` — the connection stays open.
2. A demo button runs `hotelAdminActions['disable-search-hotels']`: switch off, then `notify.toolsChanged('travel')`.
3. `handlers.ts` pushes `notifications/tools/list_changed` down every open listen connection.
4. The client calls `tools/list` again; the fresh server skips `searchHotels`.

A client that was disconnected misses the notification — so on reconnect it calls `tools/list` first, then listens again.

### Elicitation (booking)

1. **Round 1:** `bookVacation` has no answer yet, so it returns `inputRequired(...)` with the form and a **signed** `requestState`.
2. The client SDK calls our `elicitation/create` handler → the dialog opens → `callTool` waits.
3. **Round 2:** the SDK calls the tool again with `inputResponses` (your answer) and the same `requestState`.
4. The server checks the signature (`servers/travel/index.ts`), then books or reports decline / cancel.

### The chatbot

- The **browser** runs the tool loop: it lists the tools (`travel__searchFlights`, …), sends
  `{ messages, tools }` to `/api/mcp-demo/chat`, and runs each `tool_use` with its own MCP client —
  so every call shows in the protocol log and the booking dialog can appear.
- The **server route** makes one Messages API call with `@anthropic-ai/sdk` (MiMo or Claude, from `llm-provider.ts`).
- `/prompt` messages are converted with the SDK's `mcpMessages` helper.
- Why not the API's MCP connector or `toolRunner`? The connector is tools-only and needs a public HTTPS
  server; `toolRunner` must run next to the MCP clients, and ours live in the browser.

---

## Add a tool

1. Write `registerX(server)` in the right domain file (or a new file) under `servers/<server>/`.
2. Call it from that server's `register` in `servers/<server>/index.ts`.
3. Done — the route, `createServer`, the Explorer and the chatbot pick it up automatically.

Demo buttons: export an `AdminActions` object and set it as the server's `adminActions`;
the page calls `POST /api/mcp-demo/admin` with `{ "server": "<name>", "action": "<action>" }`.

---

## Try it from outside the page

- **VS Code:** `.vscode/mcp.json` lists each server twice. Command Palette → **MCP: List Servers** →
  start ONE of each pair, then use Copilot Chat in agent mode. Booking shows VS Code's own form (elicitation).
  - `travel` (HTTP) — needs `pnpm dev`; same data as the page, and the page's buttons notify VS Code.
  - `travel (stdio)` — VS Code starts `pnpm --dir <workspace> mcp:stdio travel` itself; a separate process.
- **MCP Inspector** (installed in the project, pinned 2.16.0), using [inspector.json](./inspector.json):
  - `pnpm mcp:inspect` — the web UI (<http://localhost:6274>; open the link with the token it prints).
    Our servers are listed read-only: `travel` (modern 2026-07-28), `travel-2025` (legacy), `travel-stdio`.
    Toggle one on, then Tools / Prompts / Resources. `bookVacation` shows the elicitation form (MRTR, 2 rounds).
  - `pnpm mcp:inspect:cli --server travel --method tools/list` — the same from the terminal
    (the CLI cannot show forms, so `bookVacation` is refused there — correctly).
- **Other hosts:** connect to `http://localhost:6060/api/mcp/travel` (Streamable HTTP).
- **stdio:** `pnpm mcp:stdio travel`, then send JSON-RPC lines on stdin.

---

## Good to know

- `/api/mcp-demo/*` routes only answer requests from localhost (`guardLocalhost`).
- The model key never reaches the browser; only `/api/mcp-demo/chat` and `/agent-host` use it.
- Bookings, events and emails are **simulated** and reset when the dev server restarts.
- The design specs and build notes are in `docs/superpowers/specs/` (written before the
  `servers/` reorganisation, so they mention the old `features/` paths).
