import { ResourceTemplate, type McpServer } from '@modelcontextprotocol/server'

import { jsonContents, startingWith } from '../shared'

/**
 * Activities: `travel://activities/{city}/{category}`.
 * MCP concepts: a resource TEMPLATE (one pattern, many URIs) with `list` and completion (MCP Server lesson).
 */

/** What the template can return. */
const ACTIVITIES: Record<string, Record<string, string[]>> = {
  Barcelona: {
    museums: ['Picasso Museum', 'Museu Nacional d’Art de Catalunya'],
    beaches: ['Barceloneta', 'Bogatell'],
  },
  Madrid: {
    parks: ['Retiro Park', 'Casa de Campo'],
  },
}

/** ACTIVITIES lookup that ignores letter case ("barcelona" finds Barcelona). */
function findCity(city: string | undefined) {
  const key = Object.keys(ACTIVITIES).find((c) => c.toLowerCase() === city?.toLowerCase())
  return key ? ACTIVITIES[key] : undefined
}

export function registerActivities(server: McpServer): void {
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
}
