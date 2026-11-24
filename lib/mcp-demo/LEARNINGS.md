# What we learned building the MCP Live Demo

Notes from building and walking through this project, one topic at a time, in plain words.
For the project map and how to run it, see [README.md](./README.md).

---

## 1. MCP basics: host, client, server

- **Host** = the app (our page). It holds **one MCP client per server**.
- **Client** = talks to exactly one server. We have 3: travel, weather, calendar.
- **Server** = offers **tools** (do things), **resources** (data to read), **prompts** (ready-made messages).

```ts
const client = new Client({ name: 'ai-learnings-host', version: '1.0.0' }, { versionNegotiation: { mode: 'auto' } })
await client.connect(new StreamableHTTPClientTransport(new URL('/api/mcp/travel', origin), { fetch }))
```

- `versionNegotiation: { mode: 'auto' }` → try the modern `server/discover` first; if the server is old (2025),
  fall back to `initialize` (that one hands out an `Mcp-Session-Id`).
- **Why a transport and not a plain `fetch` POST?** MCP messages are JSON-RPC. The server may answer with
  JSON **or** a stream (`text/event-stream`), may push notifications, and may need a session id.
  `StreamableHTTPClientTransport` handles all of that; we only give it our logging `fetch`.

---

## 2. Next.js route handlers

```ts
// app/api/mcp/[server]/route.ts
async function handle(request: Request, ctx: RouteContext<'/api/mcp/[server]'>) {
  const { server } = await ctx.params        // /api/mcp/travel → "travel"
  return serveMcp(server, request)
}
export const GET = handle; export const POST = handle; export const DELETE = handle
```

- `request` = the HTTP request (method, headers, body). `ctx.params` = the `[server]` part of the URL.
- **Who calls it?** Next.js does, when a request hits that URL — from the browser, curl, or MCP Inspector.
- `RouteContext<'/path'>` is a global type in this Next.js version (run `pnpm next typegen` after adding routes).

---

## 3. The host and React (`host.ts`, `use-host.ts`)

### Map vs Set
- `clients` is a **Map**: key → value (`'travel' → row`). Fast lookup by id: `clients.get('travel')`.
- `listeners` is a **Set** of functions: no duplicates, easy `add` / `delete`.
- `clients.values()` gives an **iterator**, not an array → `[...clients.values()]` makes a real array.

### Closures
`emit`, `update` and `connect` are written **inside** `createHost`, so they can all use its private `clients`
Map without it being passed in.

### Why a snapshot? (the "same box" rule)
React checks **"is this the same object as last time?"** with `Object.is` — it compares the **address in memory**,
not what's inside.

```js
const box = new Map(); const before = box
box.set('travel', 'connected')          // contents changed, same address
Object.is(before, box)                  // true  → React: "no change" ❌

snapshot = [...clients.values()]        // a NEW array = a new address
Object.is(oldSnapshot, snapshot)        // false → React re-draws ✅
```

So `emit()` builds a new `snapshot` **only when something changed**, and `getClients()` returns that same
array until the next change (a new array on every read would re-render forever).
Every change goes through `update()` → which always calls `emit()`.

### Listeners = the observer pattern
Like a WhatsApp group: `subscribe` = join, `emit` = message everyone, the returned function = leave.

```ts
subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) }
const emit = () => { snapshot = [...clients.values()]; listeners.forEach((l) => l()) }
```

In our app the only listener on the host is **React's own function** for `LiveDemo`.

### `useSyncExternalStore`
Reads data that lives **outside React** and re-draws when it changes. Roughly:

```js
function useSyncExternalStore(subscribe, getSnapshot) {
  const [value, setValue] = useState(getSnapshot())
  useEffect(() => subscribe(() => setValue(getSnapshot())), [])   // ← "reactFunction"
  return value
}
```

We use it 3 times: the host (server status), `logStore` (protocol log), `elicitationStore` (booking dialog).

### Attempt numbers
React dev mode runs connect → disconnect → connect quickly. A connect that finishes after a newer one started
is **stale**: it closes its own client and changes nothing.

---

## 4. How props reach a panel (plug-in registry)

```text
useHost() → LiveDemo { host, clients } → panelsIn('side') → <Component host={host} clients={clients} />
```

- Each UI feature declares `{ panels: [{ section: 'side', Component: ChatPanel }] }` and is listed once in
  `ui-registry.ts`. The page loops over them — nobody writes `<ChatPanel …/>` by hand.
- `picked` in `ChatPanel` is plain `useState`: set when you choose a `/prompt`, cleared on run or cancel.

---

## 5. Server side: how the tools get connected

```ts
// servers/index.ts — a FRESH server for every request (stateless)
export function createServer(name, ctx) {
  const { options, register } = SERVERS[name]
  const server = new McpServer({ name: `ai-learnings-${name}`, version }, options)
  register(server, ctx)            // travel → registerFlights, registerHotels, registerBooking, …
  return server
}
```

- Each tool is one `server.registerTool(name, { description, inputSchema, outputSchema }, handler)`.
- Because servers are rebuilt per request, anything that must survive (bookings, the hotels switch,
  meetings, outbox) lives on `globalThis`.
- We first grouped code by **build order** (`base`, `discovery`, `elicitation`…). We moved to grouping by
  **domain** (`travel/flights.ts`, `travel/hotels.ts`, `calendar/email.ts`…) — find code by what it does.

### Resources, templates, completion
- **Resource** = one fixed URI (`travel://preferences`).
- **Template** = one pattern, many URIs (`travel://activities/{city}/{category}`), with `list` and `complete`.
- **Completion** (`completion/complete`) = suggestions while typing ("Bar" → Barcelona), via `complete:`
  on a template or `completable(...)` on a prompt argument.

---

## 6. Subscription: "tell me when the tools change"

```ts
// client
travel.setNotificationHandler('notifications/tools/list_changed', () => listTools())
await travel.listen({ toolsListChanged: true })   // connection stays open

// server (servers/travel/hotels.ts)
'disable-search-hotels': ({ notify }) => { flag.enabled = false; notify.toolsChanged('travel') }
```

The notification is only a **doorbell** — it carries no list. The client asks `tools/list` again.
If the client was disconnected it **misses** the bell, so on reconnect: `tools/list` first, then listen again.

---

## 7. Elicitation: the server asks you mid-tool (MRTR)

```ts
// Round 1 — no answer yet: return a question + a signed bookmark
return inputRequired({
  inputRequests: { bookingConfirmation: inputRequired.elicit({ message, requestedSchema }) },
  requestState: await stateCodec.mint({ tool: 'bookVacation', outboundFlight, returnFlight, hotelId }),
})
```

1. The client SDK calls our `elicitation/create` handler → dialog opens → `callTool` **waits**.
2. You answer: `accept` (with content), `decline`, or `cancel`.
3. **Round 2:** the SDK calls the same tool again with `inputResponses` + the same `requestState`.
4. The server checks the HMAC signature (signed, **not** encrypted), validates the answer with zod, then books.

- The client must **declare** the capability (`elicitation: { form: {}, url: {} }`), or the SDK refuses the handler.
- **URL mode** (`signInToAirline`): the server only learns that you agreed to open the page — never your password.

**Bug we hit:** the dialog was `position: fixed` but lived inside a **hidden** tab → a hidden parent hides
everything inside it → the chat waited forever. Fix: render it with `createPortal(..., document.body)`.

---

## 8. The Claude SDK and the chatbot

```ts
const client = new Anthropic({ baseURL, authToken })          // MiMo speaks the Claude protocol
const reply = await client.messages.stream({ model, max_tokens, system, tools, messages }).finalMessage()
```

- `.stream()` receives the answer in pieces; `.finalMessage()` joins them into one object.
- **`tools`** = name + description + input_schema for each MCP tool (`travel__searchFlights`…).
- **`messages`** = the whole conversation; it grows every round:
  user → assistant `tool_use` → user `tool_result` → … until `stop_reason` is not `tool_use`.
- **The browser runs the tool loop** (so the log and the booking dialog work); the server route only makes
  the model call (so the key never reaches the browser).

### Options we looked at and why we chose this way
| Option | What it does | Why not here |
| --- | --- | --- |
| API **MCP connector** (`mcp_servers`) | Anthropic's cloud calls your server | Tools only; server must be public `https://` |
| `mcpTools` + `toolRunner` | SDK runs the whole loop | Must run where the MCP clients are; ours are in the browser |
| `mcpMessages` | prompt → Claude messages | ✅ used for `/plan-vacation` |
| `mcpResourceToContent` | resource → content block | Accepts only `text/*`, PDF, images; ours are JSON |

---

## 9. Environment variables (the "invalid credentials" saga)

- Next.js: a variable **already in the process environment wins over `.env`**.
- An old `MIMO_API_KEY` stayed in memory: Windows → Explorer → VS Code → every terminal.
  Restarting VS Code alone didn't help, because Explorer launched it with the old copy.
- Fixes: remove the Windows variable, tell Explorer to reload (`WM_SETTINGCHANGE`), start `pnpm dev` from a
  clean shell, and `"env": { "MIMO_API_KEY": null }` in `.vscode/launch.json`.
- Code reads `process.env` only — never parse `.env` by hand.

---

## 10. Debugging server code

Route handlers run in **Node**, not the browser, so browser breakpoints don't stop there.

- `pnpm dev --inspect` only **opens a port** (9229) — a debugger must attach:
  - Chrome: `chrome://inspect` → **inspect** → Sources → Ctrl+P → `route.ts`
  - VS Code: Run and Debug → "Next.js: debug server-side" (`.vscode/launch.json`), or a JavaScript Debug Terminal
- A route is compiled on first use — call it once before searching for the file.
- A `debugger` line stops there without finding the file.

---

## 11. Smaller things

- **Markdown from the model** is sanitised: allowed tags only, all attributes stripped except safe `http(s)`/`mailto` links.
- `/api/mcp-demo/*` routes answer **localhost only**; the proxy forwards to **listed** remote servers only (no SSRF).
- Dev port is **6060** (Next.js refuses 6666 as "reserved").
- Modern ES: spread instead of `Object.assign`, `?.` / `??`, `findLast`, `flatMap`.
