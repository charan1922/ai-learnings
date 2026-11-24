# MCP Demo — Spec 2: Resources, Templates, Prompts and Completion

Date: 2026-11-20 · Status: Built 2026-11-23 · Parent: [MCP Live Demo overview](2026-11-20-mcp-live-demo-design.md)
Depends on: [Spec 1 Foundation](2026-11-20-mcp-demo-1-foundation-design.md) only · Feature id: `resources-prompts`

## Goal

Cover the read-side features of the MCP Server lesson: resources, resource templates, prompts, completion, and watching a resource for changes.

## Concepts covered

- `resources/list` and `resources/read`
- `resources/templates/list` and filling a template
- `prompts/list` (`name`, `title`, `description`, `arguments`)
- `prompts/get` returning a user message
- `completion/complete`
- Resource subscription and `notifications/resources/updated` (from the lesson's "Extra details")

## Files (all new, plus one line in each registry)

| File | Responsibility |
| --- | --- |
| `lib/mcp-demo/features/resources-prompts/state.ts` | Preferences, past trips, the June 2027 calendar (June 15–22 free) |
| `lib/mcp-demo/features/resources-prompts/server.ts` | `ServerFeature`. **Travel:** `travel://preferences` and `travel://past-trips`; the template `travel://activities/{city}/{category}`, whose `list` exposes Barcelona/museums, Barcelona/beaches and Madrid/parks; the prompt `plan-vacation`. **Calendar:** `calendar://events/2027-06` with subscriptions enabled. **Admin action:** `add-meeting` adds a meeting to June and calls `notifyResourceUpdated('calendar', 'calendar://events/2027-06')`. **Smoke:** template read, `prompts/get`, completion "Bar" → Barcelona. |
| `components/mcp-demo/features/resources-prompts/index.tsx` | `UiFeature` with tabs Resources, Templates and Prompts, plus the panel "Watch a resource" |
| `…/resources-tab.tsx` | List resources (URI, name, mimeType). Read one and show `contents`. |
| `…/templates-tab.tsx` | List templates, show one input per `{placeholder}`, show the built URI, and read it |
| `…/prompts-tab.tsx` | Show the prompt as an "empty form" (name, title, description, arguments marked required or optional). Fill it, get it, and show `messages` with role badges. |
| `…/completion-input.tsx` | Debounced `client.complete({ ref: { type: 'ref/prompt', name: 'plan-vacation' }, argument: { name: 'destination', value } })` with a suggestion dropdown. Exported for reuse (Spec 8 can import it if present). |
| `…/watch-resource-panel.tsx` | Subscribe to `calendar://events/2027-06` (resource filter on `subscriptions/listen`). An "Add meeting" button calls the admin action. The feed shows `notifications/resources/updated`, then an automatic `resources/read` with the new meeting highlighted. |

## Prompt details

- `plan-vacation`, titled **Plan a vacation**.
- Required arguments: origin, destination, departureDate, returnDate. Optional: budget, travelers, interests.
- `destination` is wrapped in `completable()` over Barcelona, Madrid, Lisbon, Paris and Rome (prefix match, case-insensitive).
- It returns one `user` message: "Plan a trip for {travelers} from {origin} to {destination}, {departureDate}–{returnDate}, with a ${budget} budget. Search for flights and hotels, check the weather, and propose one package."

## Done when (hands-on checkpoints)

1. Reading `calendar://events/2027-06` shows June availability.
2. Barcelona/museums reads `travel://activities/Barcelona/museums`, and Madrid/parks works with the same template.
3. `plan-vacation` shows its argument form, and getting it returns the user message.
4. Typing "Bar" suggests Barcelona, and the log shows `completion/complete`.
5. Add meeting makes `resources/updated` arrive, and the re-read shows the meeting. (If Foundation recorded the polling fallback, a re-read after the action is acceptable.)
6. Smoke checks pass. Lint and type check are clean.

## Build notes (2026-11-23)

- Completion is generic: every prompt argument and every template placeholder (`ref/resource`, with context), asked only while the field has focus.
- No smoke runner. All checkpoints passed in the browser; all Spec 2 checklist items tick.
