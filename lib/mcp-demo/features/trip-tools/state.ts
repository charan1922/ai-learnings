/**
 * Spec 3 state: calendar events created by createCalendarEvent and the simulated email outbox.
 * Kept on globalThis because every MCP request builds a fresh server (same trick as server-log.ts).
 */
export interface CalendarEvent {
  id: number
  title: string
  start: string
  end: string
}

export interface Email {
  id: number
  to: string
  subject: string
  body: string
  sentAt: string
}

type State = { events: CalendarEvent[]; outbox: Email[]; nextId: number }

const g = globalThis as typeof globalThis & { __mcpDemoTripTools?: State }
const state: State = (g.__mcpDemoTripTools ??= { events: [], outbox: [], nextId: 1 })

export function createEvent(input: Omit<CalendarEvent, 'id'>): CalendarEvent {
  const event = { id: state.nextId++, ...input }
  state.events.push(event)
  return event
}

/** Simulated: nothing is really sent, the email just lands in the outbox. */
export function queueEmail(input: Omit<Email, 'id' | 'sentAt'>): Email {
  const email = { id: state.nextId++, ...input, sentAt: new Date().toISOString() }
  state.outbox.push(email)
  return email
}

export const listEvents = (): CalendarEvent[] => [...state.events]
export const listOutbox = (): Email[] => [...state.outbox]
