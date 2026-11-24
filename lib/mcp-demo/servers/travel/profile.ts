import type { McpServer } from '@modelcontextprotocol/server'

import { jsonContents } from '../shared'

/**
 * Traveller profile: `travel://preferences` and `travel://past-trips`.
 * MCP concept: fixed resources — one URI each (MCP Server lesson). The host reads them as context.
 */

/** Your saved travel preferences — matches the lesson's plan-vacation example. */
const PREFERENCES = {
  homeCity: 'New York',
  travelers: 2,
  budgetUsd: 3000,
  interests: ['beaches', 'architecture', 'food'],
}

/** Sample past trips (small, clearly fake). */
const PAST_TRIPS = [
  { destination: 'Lisbon', month: '2025-09', nights: 5 },
  { destination: 'Rome', month: '2026-04', nights: 4 },
]

export function registerProfile(server: McpServer): void {
  server.registerResource(
    'preferences',
    'travel://preferences',
    { title: 'Travel preferences', description: 'Your saved travel preferences', mimeType: 'application/json' },
    (uri) => jsonContents(uri, PREFERENCES),
  )
  server.registerResource(
    'past-trips',
    'travel://past-trips',
    { title: 'Past trips', description: 'Trips you took before', mimeType: 'application/json' },
    (uri) => jsonContents(uri, PAST_TRIPS),
  )
}
