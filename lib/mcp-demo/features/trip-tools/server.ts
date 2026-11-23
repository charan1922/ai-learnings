import type { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'

import type { ServerFeature } from '../types'
import { getForecast } from './open-meteo'
import { createEvent, listEvents, listOutbox, queueEmail } from './state'

/** Resources the Trip services panel reads to show what the tools created. */
export const CREATED_EVENTS_URI = 'calendar://created-events'
export const OUTBOX_URI = 'email://outbox'

/** A tool result the model can read as an error — `isError: true`, never a thrown protocol error. */
function toolError(message: string) {
  return { content: [{ type: 'text' as const, text: message }], isError: true }
}

function jsonContents(uri: URL, data: unknown) {
  return { contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(data, null, 2) }] }
}

/**
 * Spec 3: tools on the OTHER two servers — one host, three clients, three different jobs.
 * Weather → checkWeather (real Open-Meteo API). Calendar/Email → createCalendarEvent, sendEmail (simulated).
 */
export const tripToolsFeature: ServerFeature = {
  id: 'trip-tools',
  register: { weather: registerWeather, calendar: registerCalendar },
}

function registerWeather(server: McpServer): void {
  server.registerTool(
    'checkWeather',
    {
      title: 'Check weather',
      description: 'Daily forecast for a city (real data from Open-Meteo, about the next 7 days)',
      inputSchema: z.object({ city: z.string().describe('City name, e.g. Barcelona') }),
      outputSchema: z.object({
        city: z.string(),
        country: z.string(),
        days: z.array(
          z.object({ date: z.string(), min: z.number(), max: z.number(), rainChance: z.number().nullable() }),
        ),
      }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ city }) => {
      try {
        const forecast = await getForecast(city)
        return {
          content: [
            {
              type: 'text',
              // Open-Meteo only forecasts ~16 days ahead; the trip (June 2027) is far beyond that.
              text:
                `Current forecast for ${forecast.city}, ${forecast.country} — trip dates are beyond the forecast window.\n` +
                JSON.stringify(forecast),
            },
          ],
          structuredContent: forecast,
        }
      } catch (error) {
        return toolError(`Could not get the weather for "${city}": ${error instanceof Error ? error.message : error}`)
      }
    },
  )
}

function registerCalendar(server: McpServer): void {
  server.registerTool(
    'createCalendarEvent',
    {
      title: 'Create calendar event',
      description: 'Add an event to your calendar (simulated)',
      inputSchema: z.object({
        title: z.string().describe('e.g. Barcelona trip'),
        start: z.string().describe('Start date or date-time, e.g. 2027-06-15'),
        end: z.string().describe('End date or date-time, e.g. 2027-06-22'),
      }),
      outputSchema: z.object({ id: z.number(), title: z.string(), start: z.string(), end: z.string() }),
    },
    async ({ title, start, end }) => {
      if (Number.isNaN(Date.parse(start)) || Number.isNaN(Date.parse(end))) {
        return toolError(`"${start}" or "${end}" is not a valid date. Use YYYY-MM-DD.`)
      }
      if (Date.parse(end) < Date.parse(start)) return toolError(`The end (${end}) is before the start (${start}).`)

      const event = createEvent({ title, start, end })
      return { content: [{ type: 'text', text: `Created event #${event.id}: ${title}, ${start} → ${end}.` }], structuredContent: event }
    },
  )

  server.registerTool(
    'sendEmail',
    {
      title: 'Send email',
      description: 'Send an email (simulated: it goes to an outbox, nothing is really sent)',
      inputSchema: z.object({
        to: z.string().describe('Recipient, e.g. me@example.com'),
        subject: z.string(),
        body: z.string(),
      }),
      outputSchema: z.object({ id: z.number(), to: z.string(), subject: z.string(), sentAt: z.string() }),
    },
    async ({ to, subject, body }) => {
      if (!to.includes('@')) return toolError(`"${to}" is not an email address.`)

      const email = queueEmail({ to, subject, body })
      return {
        content: [{ type: 'text', text: `Email #${email.id} to ${to} placed in the outbox (simulated).` }],
        structuredContent: { id: email.id, to, subject, sentAt: email.sentAt },
      }
    },
  )

  // Read-only views of what the two tools created, for the Trip services panel.
  server.registerResource(
    'created-events',
    CREATED_EVENTS_URI,
    { title: 'Created events', description: 'Events made with createCalendarEvent', mimeType: 'application/json' },
    (uri) => jsonContents(uri, listEvents()),
  )
  server.registerResource(
    'outbox',
    OUTBOX_URI,
    { title: 'Email outbox', description: 'Emails "sent" with sendEmail (simulated)', mimeType: 'application/json' },
    (uri) => jsonContents(uri, listOutbox()),
  )
}
