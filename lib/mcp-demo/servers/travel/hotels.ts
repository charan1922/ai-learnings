import type { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'

import type { AdminActions } from '../types'

/**
 * Hotels: `searchHotels`.
 * MCP concept: a tool that comes and goes — the admin buttons switch it on/off and push
 * notifications/tools/list_changed to every client listening with subscriptions/listen (Architecture lesson).
 */

// On globalThis: every MCP request builds a fresh server, so the switch must live outside it.
const g = globalThis as typeof globalThis & { __mcpDemoSearchHotels?: { enabled: boolean } }
// On by default: the lesson's trip uses searchHotels. The Tool-list changes panel removes / adds it.
const flag = (g.__mcpDemoSearchHotels ??= { enabled: true })

export const hotelAdminActions: AdminActions = {
  'enable-search-hotels': ({ notify }) => {
    flag.enabled = true
    notify.toolsChanged('travel')
  },
  'disable-search-hotels': ({ notify }) => {
    flag.enabled = false
    notify.toolsChanged('travel')
  },
}

export function registerHotels(server: McpServer): void {
  // The switch decides what THIS request's tools/list shows.
  if (!flag.enabled) return

  server.registerTool(
    'searchHotels',
    {
      title: 'Search hotels',
      description: 'Search hotels in a city for your dates',
      inputSchema: z.object({
        city: z.string().describe('e.g. Barcelona'),
        checkIn: z.string().describe('YYYY-MM-DD'),
        checkOut: z.string().describe('YYYY-MM-DD'),
      }),
      outputSchema: z.object({ hotels: z.array(z.object({ hotelId: z.string(), name: z.string(), city: z.string() })) }),
      annotations: { readOnlyHint: true },
    },
    async ({ city }) => {
      // The lesson's trip uses "the beachfront hotel" in Barcelona.
      const hotels =
        city.trim().toLowerCase() === 'barcelona' ? [{ hotelId: 'beachfront-hotel', name: 'Beachfront Hotel', city: 'Barcelona' }] : []
      return { content: [{ type: 'text', text: JSON.stringify({ hotels }) }], structuredContent: { hotels } }
    },
  )
}
