import type { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'

import { jsonContents, toolError } from '../shared'

/**
 * Events: `createCalendarEvent` (simulated) + `calendar://created-events`, a read-only view of what it made.
 * MCP concepts: a tool that changes something, with input checks returned as `isError` results.
 */

export const CREATED_EVENTS_URI = 'calendar://created-events'

interface CalendarEvent {
  id: number
  title: string
  start: string
  end: string
}

// On globalThis: every MCP request builds a fresh server, so created events must live outside it.
const g = globalThis as typeof globalThis & { __mcpDemoEvents?: { events: CalendarEvent[]; nextId: number } }
const store = (g.__mcpDemoEvents ??= { events: [], nextId: 1 })

export function registerEvents(server: McpServer): void {
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

      const event = { id: store.nextId++, title, start, end }
      store.events.push(event)
      return { content: [{ type: 'text', text: `Created event #${event.id}: ${title}, ${start} → ${end}.` }], structuredContent: event }
    },
  )

  server.registerResource(
    'created-events',
    CREATED_EVENTS_URI,
    { title: 'Created events', description: 'Events made with createCalendarEvent', mimeType: 'application/json' },
    (uri) => jsonContents(uri, store.events),
  )
}
