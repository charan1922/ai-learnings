# MCP Demo — Spec 6: stdio Transport (Data Layer vs Transport Layer)

Date: 2026-11-20 · Status: Built 2026-11-23 · Parent: [MCP Live Demo overview](2026-11-20-mcp-live-demo-design.md)
Depends on: [Spec 1 Foundation](2026-11-20-mcp-demo-1-foundation-design.md) only · Feature id: `stdio`

## Goal

Show the Architecture lesson's main point: the **same message** (`tools/list`) over **two transports**, stdio and Streamable HTTP, with identical data-layer JSON.

## Concepts covered

- Data layer vs transport layer
- stdio: write to `stdin`, read replies from `stdout`
- Local Streamable HTTP
- Moving a server between transports without changing the message rules

## Files (all new, plus one line in each registry, plus one `package.json` script)

| File | Responsibility |
| --- | --- |
| `scripts/mcp-stdio.ts` | `tsx scripts/mcp-stdio.ts <travel\|weather\|calendar>` → `serveStdio(() => createServer(name))` (Foundation's factory, so every built feature is included). Logs only to stderr. |
| `app/api/mcp-demo/stdio/route.ts` | `POST { server, op: 'tools/list' \| 'tools/call', args? }`. Validates `server` against `ServerName`. Spawns the fixed entry with `StdioClientTransport` (fixed command and args, never user input). Wraps the transport to capture each line written to stdin and read from stdout. Runs the op, closes, and returns `{ result, lines: [{ dir: 'stdin'\|'stdout', json }], durationMs }`. Localhost only. |
| `components/mcp-demo/features/stdio/index.tsx` | `UiFeature` with the panel "Same message, two transports" |
| `…/transport-compare.tsx` | Server picker, then **Run both**. Left: stdio lines from the bridge. Right: the same `tools/list` over HTTP from the browser client, with HTTP headers. A badge says whether the tool lists are identical (ignoring ids). A note explains that the stdio server is a separate process with its own in-memory state. Includes a copyable VS Code `mcp.json` snippet for the stdio command. |
| `package.json` | `"mcp:stdio": "tsx scripts/mcp-stdio.ts"` |

## Done when (hands-on checkpoints)

1. Run both shows identical tool lists for Travel, with stdio lines on one side and HTTP headers on the other.
2. `pnpm mcp:stdio travel` works with `npx @modelcontextprotocol/inspector` (stdio mode).
3. An unknown server name is rejected (400). Lint and type check are clean.

## Risks

- Spawning `tsx` from a route handler on Windows. If `npx` resolution fails, use `process.execPath` with `--import tsx`.
- Verify the v2 `Transport` interface before wrapping it.
- Path aliases (`@/…`) under `tsx`. Use relative imports in the entry script if needed.

## Build notes (2026-11-23)

- On Windows the bridge spawns `process.execPath --import tsx scripts/mcp-stdio.ts <server>` (no shell); about 2 s per run including start-up.
- `pnpm mcp:stdio travel` keeps stdout clean (pnpm's banner goes to stderr), so it works as a VS Code / Inspector stdio command.
