import { completable, type McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'

import { startingWith } from '../shared'

/**
 * Trip planning: the `plan-vacation` prompt.
 * MCP concepts: a PROMPT (the "empty form" — prompts/list shows it, prompts/get fills it)
 * with completion on `destination` ("Bar" → Barcelona) (MCP Server lesson).
 */

/** Values that completion offers for "destination". */
const DESTINATIONS = ['Barcelona', 'Madrid', 'Lisbon', 'Paris', 'Rome']

export function registerTripPlanning(server: McpServer): void {
  server.registerPrompt(
    'plan-vacation',
    {
      title: 'Plan a vacation',
      description: 'Plan a trip: search flights and hotels, check the weather, and propose one package',
      argsSchema: z.object({
        origin: z.string().describe('Where you leave from, e.g. New York'),
        // completable() = this argument supports completion/complete ("Bar" → Barcelona).
        destination: completable(z.string().describe('Where you want to go, e.g. Barcelona'), (value) =>
          startingWith(DESTINATIONS, value),
        ),
        departureDate: z.string().describe('Departure date, YYYY-MM-DD'),
        returnDate: z.string().describe('Return date, YYYY-MM-DD'),
        budget: z.string().optional().describe('Budget in USD, e.g. 3000'),
        travelers: z.string().optional().describe('How many people, e.g. 2'),
        interests: z.string().optional().describe('e.g. beaches, architecture, food'),
      }),
    },
    ({ origin, destination, departureDate, returnDate, budget, travelers, interests }) => {
      const who = travelers ? ` for ${travelers}` : ''
      const money = budget ? `, with a $${budget} budget` : ''
      const likes = interests ? ` Interests: ${interests}.` : ''
      return {
        // Lesson: the app passes this to the model "as a user message, as if you had typed it yourself".
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text:
                `Plan a trip${who} from ${origin} to ${destination}, ${departureDate}–${returnDate}${money}. ` +
                `Search for flights and hotels, check the weather, and propose one package.${likes}`,
            },
          },
        ],
      }
    },
  )
}
