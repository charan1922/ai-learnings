import type { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'

/**
 * Flights: `searchFlights`.
 * MCP concepts: a tool with inputSchema + outputSchema, returning `structuredContent` (MCP Server lesson).
 */

type Flight = { flightNumber: string; price: number }

/** Mock flight data using the lesson's values. Keys are "origin->destination", lowercase. */
const FLIGHTS: Record<string, Flight[]> = {
  'new york->barcelona': [{ flightNumber: 'EX101', price: 640 }],
  // The lesson books EX102 as the return flight; it gives no price, so it mirrors EX101.
  'barcelona->new york': [{ flightNumber: 'EX102', price: 640 }],
}

export function registerFlights(server: McpServer): void {
  server.registerTool(
    'searchFlights',
    {
      title: 'Search flights',
      description: 'Search flights between two cities on a given date',
      // inputSchema: the data going in (lesson: "origin, destination, and a date")
      inputSchema: z.object({
        origin: z.string().describe('Departure city, e.g. New York'),
        destination: z.string().describe('Arrival city, e.g. Barcelona'),
        date: z.string().describe('Travel date, YYYY-MM-DD'),
      }),
      // outputSchema: the structured data coming back (lesson: "a list of flights with a flight number and a price")
      outputSchema: z.object({
        flights: z.array(z.object({ flightNumber: z.string(), price: z.number() })),
      }),
      annotations: { readOnlyHint: true },
    },
    async ({ origin, destination }) => {
      const key = `${origin.trim().toLowerCase()}->${destination.trim().toLowerCase()}`
      const output = { flights: FLIGHTS[key] ?? [] }
      return {
        // `content` = the same data as text, for older clients
        content: [{ type: 'text', text: JSON.stringify(output) }],
        // `structuredContent` = the result as a JSON object, checked against outputSchema
        structuredContent: output,
      }
    },
  )
}
