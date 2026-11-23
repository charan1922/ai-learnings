# MCP Demo — Spec 4: Elicitation (Form Mode, MRTR, URL Mode)

Date: 2026-11-20 · Status: Draft · Parent: [MCP Live Demo overview](2026-11-20-mcp-live-demo-design.md)
Depends on: [Spec 1 Foundation](2026-11-20-mcp-demo-1-foundation-design.md) only · Feature id: `elicitation`

## Goal

Make the MCP Client lesson real: the Travel Server asks the user for input mid-booking, using the `2026-07-28` Multi Round-Trip Requests (MRTR) flow.

## Concepts covered

- Elicitation, form mode and URL mode
- Client capability declaration: `{}` vs `{ form, url }`
- MRTR: request 1 → `input_required` (`inputRequests`, `requestedSchema`, `requestState`) → request 2 with `inputResponses` and the same `requestState` → `complete`
- accept / decline / cancel, including `confirmBooking: false`
- Closing the app before or after confirming
- URL mode (airline sign-in)
- Roots and sampling (info note only)

## Files (all new, plus one line in each registry)

| File | Responsibility |
| --- | --- |
| `lib/mcp-demo/features/elicitation/state.ts` | Bookings |
| `lib/mcp-demo/features/elicitation/server.ts` | `ServerFeature`. **Travel:** `bookVacation`, `signInToAirline`, `getBookingStatus`. `serverOptions.travel` sets `requestState: { verify }` from `createRequestStateCodec({ key })`, with the key from `MCP_DEMO_STATE_KEY` or random at boot (documented in `.env.example`). **Smoke:** both `bookVacation` round trips with a scripted handler (accept → booked, decline → not booked), and a tampered `requestState` → `-32602`. |
| `components/mcp-demo/features/elicitation/index.tsx` | `UiFeature` with the panel "Elicitation". `clientSetup` registers `client.setRequestHandler('elicitation/create', …)` → `requestElicitation()`. |
| `…/elicitation-bridge.ts` | `requestElicitation(params) → Promise<ElicitResult>`, resolved by the dialog |
| `…/elicitation-dialog.tsx` | **Form mode:** render `requestedSchema` (boolean → checkbox, enum → select, string → input, number → number input; `default` pre-filled), show `message`, block Submit until required fields are filled. Submit → `accept` + `content`, Decline → `decline`, Close/Esc/✕ → `cancel`. **URL mode:** show the requesting server and the full URL. Open link → new tab + `accept`. Cancel → `cancel`. |
| `…/capability-toggle.tsx` | None / form only `{}` / form and URL `{ form: {}, url: {} }`, with the JSON shown. Changing it calls `host.reconnect()` with the new capabilities (Foundation's `HostApi`). |
| `…/booking-panel.tsx` | One-click "Book the Barcelona package" (EX101 / EX102 / beachfront-hotel), "Sign in to airline", and "Check booking status" |
| `…/notes.tsx` | Two info cards: closing the app before or after confirming (the lesson text), and roots and sampling being deprecated (the lesson table) |
| `app/mcp/live-demo/airline-signin/page.tsx` | "Example Air (mock)" page with a clear mock banner. Fields go nowhere. Done → "You can close this tab." |

## Server behavior

### `bookVacation({ outboundFlight, returnFlight, hotelId })`

- If no accepted answer is in `ctx.mcpReq.inputResponses`, it returns `inputRequired({ inputRequests: { bookingConfirmation: inputRequired.elicit({ message, requestedSchema }) } })`.
- The message and schema match the lesson JSON exactly:
  - `confirmBooking`: boolean, required
  - `seatPreference`: window / aisle / no preference
  - `roomType`: sea view / city view / garden view
  - `travelInsurance`: boolean, default false
- When `acceptedContent(…)` has `confirmBooking: true`, it stores the booking and returns "Booked EX101 and EX102 and a sea-view room at the beachfront hotel." (using the chosen room).
- On `confirmBooking: false` it returns "Booking not confirmed — nothing was booked."
- On decline or cancel it returns text saying so. Nothing is booked.

### `signInToAirline({ airline })`

- Returns `inputRequired.elicitUrl(...)` with `<origin>/mcp/live-demo/airline-signin?eid=<uuid>`. The origin comes from `ctx.requestInfo` (field confirmed in the Foundation reading).

### `getBookingStatus({ bookingId? })`

- Returns the stored bookings, or "No bookings yet".

### Capability not declared

- Show whatever the SDK returns (an error result or `-32021`) and explain it in the panel.

## Done when (hands-on checkpoints)

1. Book opens the form. Seat is a dropdown, and insurance is unchecked.
2. The log shows request A → `input_required` + `requestState` → request B (new id, `inputResponses.bookingConfirmation`, same `requestState`) → `complete`.
3. Decline, Close and Submit with `confirmBooking: false` each behave as described, and nothing is booked.
4. With form only declared, sign-in fails clearly. With form and URL declared, the URL dialog shows the server and URL, then opens the mock page.
5. Check booking status lists the booking.
6. Smoke checks pass. Lint and type check are clean.

## Risks

- The modern client auto-fulfills `input_required` through registered handlers, so the handler must be able to await the dialog. Check timeouts and raise them for URL mode.
- If the SDK reuses the id on request 2, document what it actually does.
