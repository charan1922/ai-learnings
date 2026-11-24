# MCP Demo — Spec 3: Weather and Calendar/Email Tools

Date: 2026-11-20 · Status: Built 2026-11-23 · Parent: [MCP Live Demo overview](2026-11-20-mcp-live-demo-design.md)
Depends on: [Spec 1 Foundation](2026-11-20-mcp-demo-1-foundation-design.md) only · Feature id: `trip-tools`

## Goal

Give the Weather and Calendar/Email servers their tools: one backed by a real public API, two simulated. They are used by the Barcelona trip's "Search" and "Follow up" steps.

## Concepts covered

- Tools on separate servers (one host, three clients doing different jobs)
- A tool backed by a real external API
- Tool errors as `isError` results the model can read

## Files (all new, plus one line in each registry)

| File | Responsibility |
| --- | --- |
| `lib/mcp-demo/features/trip-tools/open-meteo.ts` | Two calls: geocoding `https://geocoding-api.open-meteo.com/v1/search?name=<city>&count=1`, then forecast `https://api.open-meteo.com/v1/forecast?latitude=..&longitude=..&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`. Timeout ~8s. Uses `lib/ipv4-fetch.ts` if plain `fetch` fails here. |
| `lib/mcp-demo/features/trip-tools/state.ts` | Calendar events created and the email outbox |
| `lib/mcp-demo/features/trip-tools/server.ts` | `ServerFeature`. **Weather:** `checkWeather({ city })` with `outputSchema` `{ city, country, days: [{ date, min, max, rainChance }] }`. **Calendar:** `createCalendarEvent({ title, start, end })` and `sendEmail({ to, subject, body })`, which appends to a simulated outbox. **Smoke:** `createCalendarEvent` and `sendEmail` round trip; `checkWeather` skipped when offline. |
| `components/mcp-demo/features/trip-tools/index.tsx` | `UiFeature` with the panel "Trip services" |
| `…/trip-services-panel.tsx` | City box → `checkWeather` shown as a small forecast table. A list of created calendar events and outbox emails, refreshed after each call. |

## Behavior

- Open-Meteo forecasts only about 16 days ahead, so the result text says "current forecast — trip dates are beyond the forecast window".
- An unknown city or a network failure returns `isError: true` with a readable message, never a thrown protocol error.

## Done when (hands-on checkpoints)

1. `checkWeather` for Barcelona returns real numbers, and an unknown city returns an `isError` result.
2. `createCalendarEvent` and `sendEmail` from the Tools tab show up in the Trip services panel.
3. Smoke checks pass. Lint and type check are clean.

## Build notes (2026-11-23)

- Added read-only `calendar://created-events` and `email://outbox` resources so the Trip services panel reads them over MCP; it re-reads after every finished Calendar `tools/call`.
- Open-Meteo works with plain Node `fetch`; `lib/ipv4-fetch.ts` was not needed.
