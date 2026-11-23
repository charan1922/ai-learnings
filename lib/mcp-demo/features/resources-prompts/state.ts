/**
 * Demo data for Spec 2 (resources, templates, prompts, completion).
 * Values come from the MCP Server lesson's Barcelona trip where the lesson gives them;
 * the rest is small sample data, clearly fake.
 */

/** Your saved travel preferences — matches the lesson's plan-vacation example. */
export const PREFERENCES = {
  homeCity: 'New York',
  travelers: 2,
  budgetUsd: 3000,
  interests: ['beaches', 'architecture', 'food'],
}

/** Sample past trips. */
export const PAST_TRIPS = [
  { destination: 'Lisbon', month: '2025-09', nights: 5 },
  { destination: 'Rome', month: '2026-04', nights: 4 },
]

/** What the template travel://activities/{city}/{category} can return. */
export const ACTIVITIES: Record<string, Record<string, string[]>> = {
  Barcelona: {
    museums: ['Picasso Museum', 'Museu Nacional d’Art de Catalunya'],
    beaches: ['Barceloneta', 'Bogatell'],
  },
  Madrid: {
    parks: ['Retiro Park', 'Casa de Campo'],
  },
}

/** Values that completion offers for the prompt's "destination" argument ("Bar" → Barcelona). */
export const DESTINATIONS = ['Barcelona', 'Madrid', 'Lisbon', 'Paris', 'Rome']

export interface Meeting {
  date: string
  title: string
}

// Meetings can be ADDED (admin action), so they must outlive one request:
// every MCP request builds a fresh server, so the data lives on globalThis (same trick as server-log.ts).
const g = globalThis as typeof globalThis & { __mcpDemoMeetings?: Meeting[] }
const meetings: Meeting[] = (g.__mcpDemoMeetings ??= [])

/** The June 2027 calendar: the trip window June 15–22 is free; meetings are listed. */
export function juneCalendar() {
  return {
    month: '2027-06',
    free: { from: '2027-06-15', to: '2027-06-22' },
    meetings: [...meetings],
  }
}

/** Adds one meeting on the next day from June 1, never inside the free June 15–22 window. */
export function addMeeting(): Meeting {
  const day = (meetings.length % 14) + 1 // June 1 … June 14
  const meeting = { date: `2027-06-${String(day).padStart(2, '0')}`, title: `Team meeting #${meetings.length + 1}` }
  meetings.push(meeting)
  return meeting
}
