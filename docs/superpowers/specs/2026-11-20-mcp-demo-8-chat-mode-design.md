# MCP Demo — Spec 8: Chat Mode (Barcelona Trip with the Claude API SDK)

Date: 2026-11-20 · Status: Draft · Parent: [MCP Live Demo overview](2026-11-20-mcp-live-demo-design.md)
Depends on: [Spec 1 Foundation](2026-11-20-mcp-demo-1-foundation-design.md) only · Feature id: `chat`

## Goal

Run the lesson's five-step Barcelona trip with **Claude** choosing the tools, while **our browser host** runs the MCP clients. Every MCP message stays visible in the protocol log.

Chat mode is **independent**: it discovers whatever prompts, resources and tools the connected servers expose at runtime. It works with Foundation alone (`searchFlights`). Each other feature that's built adds more steps automatically.

## Concepts covered

- The full trip flow:
  1. Get the prompt
  2. Read the context
  3. Search
  4. Confirm and book
  5. Follow up
- The model asks and the host executes (Claude never talks to MCP servers directly here)
- The host decides which resources to include as context

## SDK and model

- **Package:** `@anthropic-ai/sdk` (the Claude API SDK), used **server-side only** in the chat route.
- **Model:** `claude-opus-5-5`.
- **Thinking:** this model always uses adaptive thinking, so the request omits the `thinking` parameter. Set `output_config: { effort: "medium" }` explicitly.
- **Credentials:** `new Anthropic()` reads `ANTHROPIC_API_KEY` or an `ant auth login` profile. Add `ANTHROPIC_API_KEY` to `.env.example`, never to the browser.
- **Refusal fallback** (on by default for this model): `client.beta.messages.create` with `betas: ["server-side-fallback-2026-07-01"]` and `fallbacks: "default"`. Always check `stop_reason` before reading `content`.
- **Tool choice:** `tool_choice` stays `auto`, because forced tool choice returns a 400 on this model. The system prompt names the tools to use.
- **Why not the Messages API's own MCP connector (`mcp_servers`)?** It connects from Anthropic's servers, so it can't reach `localhost`, and it would hide the protocol messages this demo exists to show.

## Files (all new, plus one line in the UI registry)

| File | Responsibility |
| --- | --- |
| `app/api/mcp-demo/chat/route.ts` | `POST { messages, tools }` → **one** Messages API call (`max_tokens: 16000`, non-streaming). Returns `{ content, stop_reason, stop_details, usage, model }`. If credentials are missing → `503` with a clear message. Typed SDK errors are mapped most-specific-first (`RateLimitError` → 429, `AuthenticationError` → 401, `APIError` → status). Never returns the key. |
| `components/mcp-demo/features/chat/chat-loop.ts` | Browser-side manual tool loop (described below). At most 8 rounds. |
| `components/mcp-demo/features/chat/index.tsx` | `UiFeature` with the panel "Chat — plan the Barcelona trip (Claude)" |
| `…/chat-panel.tsx` | Trip form (pre-filled with the lesson values), the transcript (user / assistant text / tool call / tool result / refusal notice), Stop and Reset |
| `…/step-tracker.tsx` | The five lesson steps light up from the protocol log: `prompts/get` → `resources/read` → `searchFlights`/`searchHotels`/`checkWeather` → `bookVacation` → `createCalendarEvent`/`sendEmail`. Steps whose tools don't exist show "not available — build Spec N". |

## The chat loop (`chat-loop.ts`)

1. **Prompt.** If `plan-vacation` exists (`prompts/list`), get it with `prompts/get` and use its user message. Otherwise build the same instruction text locally.
2. **Context.** Read whichever of `calendar://events/2027-06`, `travel://preferences` and `travel://past-trips` exist, and add them as one context text block (the host chooses what to include).
3. **Tools.** Convert every connected local client's tools to Claude tools:
   - `name` is namespaced, `travel__searchFlights`, matching `^[a-zA-Z0-9_-]{1,64}$`
   - `description` comes from the MCP tool
   - `input_schema` is the MCP `inputSchema`
4. **Call** the chat route.
5. **Append** the **full** `content` array as the assistant turn, so thinking blocks are passed back unchanged.
6. **If `stop_reason === "tool_use"`:** run every `tool_use` block with `client.callTool` on the owning client. Return **all** results in **one** user message of `tool_result` blocks. MCP `isError` maps to `is_error: true`. Elicitation dialogs appear normally if Spec 4 is built.
7. **Otherwise** stop: `end_turn`, `max_tokens`, or `refusal` (show `stop_details`).

## Behavior

- Booking still needs a human. Only the elicitation dialog confirms it.
- Tool errors go back to Claude as tool results. Chat-route errors appear in the transcript.

## Done when (hands-on checkpoints)

1. With **Foundation only**, Claude calls `travel__searchFlights`, the log shows the matching MCP `tools/call`, and the tracker marks the other steps "not available".
2. With all features built, all five steps light up in order.
3. Declining the booking dialog (with Spec 4 built) means no booking, and Claude reports it.
4. Without credentials, Chat shows a disabled message and Explorer still works.
5. Lint and type check are clean.

## Out of scope

Streaming tokens, multiple conversations, persistence.
