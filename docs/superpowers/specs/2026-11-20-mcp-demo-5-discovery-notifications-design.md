# MCP Demo — Spec 5: Discovery, Stateless Requests and Tool-List Changes

Date: 2026-11-20 · Status: Built 2026-11-23 · Parent: [MCP Live Demo overview](2026-11-20-mcp-live-demo-design.md)
Depends on: [Spec 1 Foundation](2026-11-20-mcp-demo-1-foundation-design.md) only · Feature id: `discovery`

## Goal

Cover the MCP Architecture lesson's protocol topics: discovery, stateless requests, and getting notified when the tool list changes, including the missed-update flow.

## Concepts covered

- `server/discover`: `supportedVersions`, capabilities, cache hint
- A stateless request: the full `tools/call` with `_meta`, no prior discover
- The JSON format vs the MCP data layer (raw JSON sent by hand)
- `subscriptions/listen` → `notifications/subscriptions/acknowledged` → `notifications/tools/list_changed` (`subscriptionId`) → a separate `tools/list` with a new id
- Missed update → reconnect → `tools/list`

## Files (all new, plus one line in each registry)

| File | Responsibility |
| --- | --- |
| `lib/mcp-demo/features/discovery/state.ts` | `searchHotelsEnabled` flag |
| `lib/mcp-demo/features/discovery/server.ts` | `ServerFeature`. **Travel:** registers `searchHotels({ city, checkIn, checkOut })` (returns the beachfront hotel) **only when** the flag is on. **Admin actions:** `enable-search-hotels` and `disable-search-hotels` flip the flag and call `notifyToolsListChanged('travel')`. **Smoke:** discover result shape, the stateless raw `tools/call`, and the tool list before and after enabling. |
| `components/mcp-demo/features/discovery/index.tsx` | `UiFeature` with tabs Discover and Raw JSON-RPC, and the panel "Tool-list changes" |
| `…/discover-tab.tsx` | Shows `client.getDiscoverResult()` and a "Send `server/discover`" button. Highlights `supportedVersions`, `capabilities.tools.listChanged` and the cache hint. |
| `…/raw-tab.tsx` | JSON textarea with presets (the lesson's `tools/list`, the stateless `tools/call` with `_meta`, `server/discover`). Sends via plain `fetch` to the chosen local endpoint with `Content-Type`, `Accept`, `MCP-Protocol-Version`, `Mcp-Method`, `Mcp-Name`. A "drop Mcp-Method" toggle shows the `-32020` error. Shows the HTTP status, headers and body (SSE parsed). |
| `…/tool-list-panel.tsx` | **Listen** → `client.listen({ toolsListChanged: true })`, then the acknowledgement. **Add searchHotels** / **Remove** call the admin actions. The feed shows `list_changed` with its subscription id, then an auto `tools/list` with the new tool highlighted. **Disconnect** / **Reconnect** buttons run the missed-update flow: disconnect, add, reconnect, `tools/list`, listen again. |

## Done when (hands-on checkpoints)

1. Discover shows `supportedVersions: ["2026-07-28"]` and `tools.listChanged: true`.
2. Raw sends the lesson's stateless `tools/call` with no discover and gets EX101. Dropping `Mcp-Method` shows the header error.
3. Listen, then Add searchHotels: the feed shows acknowledged, then `list_changed`, then a separate `tools/list` that includes `searchHotels`.
4. The missed-update flow works.
5. Smoke checks pass. Lint and type check are clean.

## Build notes (2026-11-23)

- The SDK's subscription id looks like `listen:0`. Discover's cache hint on our servers: `ttlMs 0, cacheScope private`.
- The lesson's stateless `tools/call` works exactly as written (no `clientInfo`), and gets a plain JSON reply.
