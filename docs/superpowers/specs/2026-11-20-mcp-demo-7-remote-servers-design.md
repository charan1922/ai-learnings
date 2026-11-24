# MCP Demo — Spec 7: Remote MCP Servers

Date: 2026-11-20 · Status: Built 2026-11-23 · Parent: [MCP Live Demo overview](2026-11-20-mcp-live-demo-design.md)
Depends on: [Spec 1 Foundation](2026-11-20-mcp-demo-1-foundation-design.md) only · Feature id: `remotes`

## Goal

Connect the same host to free public remote MCP servers to show:

- remote Streamable HTTP
- servers on different protocol eras
- why browsers sometimes need a proxy (CORS)

## Concepts covered

- Remote HTTP transport (`https://…/mcp`)
- Legacy vs modern era: `auto` negotiation falling back to `initialize`
- `Mcp-Session-Id` on legacy servers, with `terminateSession()` on disconnect
- One host with many clients

## Remote servers (probed 2026-11-20)

| Id | URL | Era | Browser CORS | Role |
| --- | --- | --- | --- | --- |
| `deepwiki` | `https://mcp.deepwiki.com/mcp` | modern | ✓ | Ask about a public GitHub repo |
| `context7` | `https://mcp.context7.com/mcp` | modern | ✓ | Library documentation lookup |
| `cloudflare-docs` | `https://docs.mcp.cloudflare.com/mcp` | modern | ✓ | Cloudflare docs search |
| `ms-learn` | `https://learn.microsoft.com/api/mcp` | legacy (2025-06-18) | ✓ | **Era fallback** demo |
| `playground` | `https://mcpplaygroundonline.com/mcp-complex-server` | modern | ✗ | **CORS** demo, using the proxy |

Don't hard-code tool names. Use `tools/list` at runtime.

## Files (all new, plus one line in the UI registry)

| File | Responsibility |
| --- | --- |
| `lib/mcp-demo/features/remotes/remotes.ts` | The table above as data: `{ id, title, url, corsOk, note }` |
| `app/api/mcp-demo/proxy/[id]/route.ts` | `GET`/`POST`/`DELETE`. Looks up `id` in `remotes.ts` (**never** a free-form URL, to prevent SSRF). Forwards the body and only `Content-Type`, `Accept`, `MCP-Protocol-Version`, `Mcp-Method`, `Mcp-Name`, `Mcp-Session-Id`, `Last-Event-ID`. Streams the response back without buffering. Has a timeout. Same-origin only. |
| `components/mcp-demo/features/remotes/index.tsx` | `UiFeature` with the panel "Remote servers" |
| `…/remote-servers-panel.tsx` | One row per remote: Connect/Disconnect via Foundation's `host.connect({ remote })`, an "use proxy" checkbox (pre-checked when `corsOk` is false), era badge, session-id badge, error text. Connected remotes join the HostPanel and the Explorer selector, so the Tools tab works on them. Disconnect calls `transport.terminateSession()` before `close()`. |

## Behavior

- Connections are **on demand**, so the page never waits on third-party sites.
- If a direct call to `playground` fails, show "Blocked by CORS: the server sent no `Access-Control-Allow-Origin`" and offer the proxy.
- If a remote is down or rate-limited, the error stays on its row and nothing else is affected.

## Done when (hands-on checkpoints)

1. DeepWiki connects as **modern**, and `tools/list` and a call work from the Tools tab.
2. Microsoft Learn connects as **legacy**. The log shows the `server/discover` attempt, then the `initialize` fallback and `Mcp-Session-Id`.
3. Playground fails directly with the CORS explanation, then works with the proxy.
4. The proxy returns 404 for ids that aren't in the allow-list.
5. Lint and type check are clean.

## Risks

Third-party availability, rate limits and auth changes. Re-probe before demos.

## Build notes (2026-11-23)

- Re-probed 2026-11-23: all five up and as in the table. Microsoft Learn's session id is readable even from a direct browser connection.
- Disconnect ends a legacy session with `terminateSession()` before `close()` (done in `host.ts`, so every host row gets it).
