# MCP Demo — Spec 9: Claude Agent SDK as a Second Host

Date: 2026-11-20 · Status: Built 2026-11-23 · Parent: [MCP Live Demo overview](2026-11-20-mcp-live-demo-design.md)
Depends on: [Spec 1 Foundation](2026-11-20-mcp-demo-1-foundation-design.md) only · Feature id: `agent-host`

## Goal

Show that **any MCP host** can use our servers. A second, independent host, the **Claude Agent SDK** (Claude Code as a library), connects to the same local servers from the Next.js server side.

Its MCP traffic never passes through our browser. We see it through Foundation's **server-side request log**, and compare it with our own browser host (Spec 8 Chat, if built).

## Concepts covered

- Host, client and server, with a host we didn't write
- The same servers serving two different hosts
- The host's protocol era, visible from the `MCP-Protocol-Version` header on its requests
- Which MCP features a host supports varies (tools vs prompts, resources, elicitation)

## Step 0 — Read before building

The Claude Agent SDK is a separate product from the Claude API SDK. Read its official docs at `code.claude.com/docs/en/agent-sdk` before writing code. Confirm, and record in this spec:

- the package name and version (`@anthropic-ai/claude-agent-sdk`)
- the `query(...)` signature and its message/event types
- how to configure **remote HTTP MCP servers** (`mcpServers` option: type, url)
- how to **restrict tools** so the agent can use only our MCP tools (no Bash, file read/write, or web)
- how MCP tool names appear (expected `mcp__<server>__<tool>`)
- whether it supports MCP **elicitation**, prompts and resources
- the Node and runtime requirements (it may spawn a Claude Code process) and whether it runs inside a Next.js route handler

Nothing below that depends on these details is final until they're confirmed.

## Files (all new, plus one line in the UI registry)

| File | Responsibility |
| --- | --- |
| `app/api/mcp-demo/agent-host/route.ts` | `POST { prompt }` → runs the Agent SDK with: `mcpServers` = our three local HTTP endpoints (`http://localhost:6060/api/mcp/{travel,weather,calendar}`); **only** our MCP tools allowed; built-in tools disabled; a bounded number of turns. Streams events back as NDJSON (assistant text, tool calls, tool results, final result, errors). Localhost only. Missing credentials → `503`. |
| `components/mcp-demo/features/agent-host/index.tsx` | `UiFeature` with the panel "Another host: Claude Agent SDK" |
| `…/agent-host-panel.tsx` | Prompt box (default: the lesson's Barcelona instruction) and Run / Stop. Left: the agent's event stream (text, `mcp__travel__searchFlights`-style tool calls, results). Right: Foundation's **server-side log** filtered to this run's requests (method, `MCP-Protocol-Version`, `Mcp-Method`, `Mcp-Name`, body). |
| `…/host-compare.tsx` | Table comparing **our browser host** with the **Agent SDK host** on the same servers: protocol era used, features used (tools / prompts / resources / elicitation), number of MCP requests, and the tool calls made. It fills in from the two logs after both have run. |

## Security

- The agent may use **only** our MCP tools. All built-in tools (shell, file system, web) are disabled, and the route enforces that config, not the prompt.
- The route is fixed to our three local endpoints. The browser cannot pass server URLs or tool lists.
- Credentials stay server-side (`ANTHROPIC_API_KEY` or an `ant auth login` profile).

## Done when (hands-on checkpoints)

1. Running the default prompt shows the agent calling our tools (at least `searchFlights`) in its event stream.
2. Foundation's server-side log shows the same calls arriving at `/api/mcp/travel`, with the host's `MCP-Protocol-Version`.
3. The compare table shows both hosts against the same servers, including any feature one host uses and the other doesn't.
4. If Spec 4 is built, record what happens when the agent calls `bookVacation`: an elicitation prompt, a refusal, or an unsupported-capability error. That shows how hosts differ.
5. Without credentials, the panel shows a disabled message. Lint and type check are clean.

## Risks

- Agent SDK runtime constraints (a spawned process, a long-lived stream) inside a Next.js route handler. If they don't fit, run it as a small `tsx` script that writes NDJSON, and have the route spawn it the same way Spec 6's stdio bridge does.
- Cost: each run uses real tokens. Bound the turns and show usage per run.

## Build notes (2026-11-23)

Step 0 findings (docs + installed `@anthropic-ai/claude-agent-sdk` 0.3.330 types):

- `query({ prompt, options })` yields `system/init` (`mcp_servers`, `tools`), `assistant` (`message.content` text / tool_use), `user` (tool_result), `result` (`subtype`, `num_turns`, `total_cost_usd`, `usage`). It throws after an error result.
- HTTP MCP servers: `mcpServers: { travel: { type: 'http', url } }`; tool names are `mcp__<server>__<tool>`; `allowedTools` accepts `mcp__travel__*`.
- Lockdown used: `tools: []` (no built-ins), `allowedTools` for our servers, a `disallowedTools` deny list, `permissionMode: 'dontAsk'`, `settingSources: []`, `strictMcpConfig`, an isolated `CLAUDE_CONFIG_DIR`/`cwd`, `ENABLE_CLAUDEAI_MCP_SERVERS=false`. The route refuses to run without `ANTHROPIC_API_KEY` so it never uses a personal login.
- Elicitation: `onElicitation(request)`; this host records the request and answers `decline`.
- Runtime: spawns its bundled native Claude Code binary; added to `serverExternalPackages`. Works on Windows from Node.
- Verified with a deliberately invalid key (no cost): all three servers `connected` in 1.9 s, and the agent's tool list was only our 7 MCP tools. The server log shows `claude-code/2.1.330 (agent-sdk)` speaking **2026-07-28**: `server/discover`, `subscriptions/listen`, `tools/list`, `resources/list`, `prompts/list`.
- **Open:** checkpoints 1–4 with a real run need `ANTHROPIC_API_KEY` in `.env`.
