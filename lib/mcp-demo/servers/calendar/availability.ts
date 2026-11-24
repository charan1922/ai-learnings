import type { McpServer } from '@modelcontextprotocol/server'

import { jsonContents } from '../shared'
import type { AdminActions } from '../types'

/**
 * Availability: `calendar://events/2027-06` — your June calendar.
 * MCP concept: a WATCHABLE resource. The calendar server advertises `resources.subscribe`, and the
 * "add-meeting" button pushes notifications/resources/updated to every listening client (MCP Server lesson).
 */

export const JUNE_CALENDAR_URI = 'calendar://events/2027-06'

interface Meeting {
  date: string
  title: string
}

// Meetings can be ADDED (admin action), so they must outlive one request:
// every MCP request builds a fresh server, so the data lives on globalThis.
const g = globalThis as typeof globalThis & { __mcpDemoMeetings?: Meeting[] }
const meetings: Meeting[] = (g.__mcpDemoMeetings ??= [])

/** The trip window June 15–22 is free; meetings are listed. */
const juneCalendar = () => ({ month: '2027-06', free: { from: '2027-06-15', to: '2027-06-22' }, meetings: [...meetings] })

export const availabilityAdminActions: AdminActions = {
  // Lesson: "If you add a meeting to your June calendar, the server can send notifications/resources/updated."
  'add-meeting': ({ notify }) => {
    const day = (meetings.length % 14) + 1 // June 1 … June 14, never inside the free window
    meetings.push({ date: `2027-06-${String(day).padStart(2, '0')}`, title: `Team meeting #${meetings.length + 1}` })
    notify.resourceUpdated('calendar', JUNE_CALENDAR_URI)
  },
}

export function registerAvailability(server: McpServer): void {
  server.registerResource(
    'june-2027',
    JUNE_CALENDAR_URI,
    { title: 'June 2027 calendar', description: 'Your availability in June 2027', mimeType: 'application/json' },
    (uri) => jsonContents(uri, juneCalendar()),
  )
}
