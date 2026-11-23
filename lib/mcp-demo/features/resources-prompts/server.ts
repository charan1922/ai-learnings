import { completable, ResourceTemplate, type McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'

import type { ServerFeature } from '../types'
import { ACTIVITIES, addMeeting, DESTINATIONS, juneCalendar, PAST_TRIPS, PREFERENCES } from './state'

/** The resource the "Watch a resource" panel subscribes to (lesson: "your June availability"). */
export const JUNE_CALENDAR_URI = 'calendar://events/2027-06'

/** A resources/read result holding one JSON document. */
function jsonContents(uri: URL, data: unknown) {
  return { contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(data, null, 2) }] }
}

/** Case-insensitive prefix match, used by every completion below ("bar" → Barcelona). */
function startingWith(values: string[], typed: string): string[] {
  return values.filter((v) => v.toLowerCase().startsWith(typed.toLowerCase()))
}

/**
 * Spec 2: the read side of the MCP Server lesson.
 * Travel → two resources, one resource template, one prompt with completion.
 * Calendar → the June calendar resource, watchable (subscribe: true), plus the "add-meeting" admin action.
 */
export const resourcesPromptsFeature: ServerFeature = {
  id: 'resources-prompts',
  register: { travel: registerTravel, calendar: registerCalendar },
  // Lesson: "If the server advertises "subscribe": true for resources, the app can use subscriptions/listen."
  serverOptions: { calendar: { capabilities: { resources: { subscribe: true } } } },
  adminActions: {
    // Lesson: "If you add a meeting to your June calendar, the server can send notifications/resources/updated."
    'add-meeting': ({ notify }) => {
      addMeeting()
      notify.resourceUpdated('calendar', JUNE_CALENDAR_URI)
    },
  },
}

function registerTravel(server: McpServer): void {
  // Two fixed resources: one URI each.
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

  // A resource TEMPLATE: one pattern, many URIs. The app fills {city} and {category}.
  server.registerResource(
    'activities',
    new ResourceTemplate('travel://activities/{city}/{category}', {
      // `list` = the ready-made URIs this template can produce (they also show up in resources/list).
      list: () => ({
        resources: Object.entries(ACTIVITIES).flatMap(([city, categories]) =>
          Object.keys(categories).map((category) => ({
            uri: `travel://activities/${city}/${category}`,
            name: `${city} ${category}`,
            mimeType: 'application/json',
          })),
        ),
      }),
      // Suggestions for each placeholder while the user types.
      complete: {
        city: (value) => startingWith(Object.keys(ACTIVITIES), value),
        category: (value, context) => startingWith(Object.keys(findCity(context?.arguments?.city) ?? {}), value),
      },
    }),
    { title: 'Activities', description: 'Things to do in a city, by category', mimeType: 'application/json' },
    (uri, variables) => {
      const city = String(variables.city)
      const category = String(variables.category)
      const activities = findCity(city)?.[category.toLowerCase()] ?? []
      return jsonContents(uri, { city, category, activities })
    },
  )

  // A PROMPT: the "empty form" the lesson describes. prompts/list shows the form, prompts/get fills it.
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

function registerCalendar(server: McpServer): void {
  server.registerResource(
    'june-2027',
    JUNE_CALENDAR_URI,
    { title: 'June 2027 calendar', description: 'Your availability in June 2027', mimeType: 'application/json' },
    (uri) => jsonContents(uri, juneCalendar()),
  )
}

/** ACTIVITIES lookup that ignores letter case ("barcelona" finds Barcelona). */
function findCity(city: string | undefined) {
  const key = Object.keys(ACTIVITIES).find((c) => c.toLowerCase() === city?.toLowerCase())
  return key ? ACTIVITIES[key] : undefined
}
