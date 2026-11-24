import type { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'

import { toolError } from '../shared'
import { getForecast } from './open-meteo'

/**
 * Forecast: `checkWeather` — real data from the Open-Meteo API.
 * MCP concepts: an open-world tool (openWorldHint) that reports failures as `isError` results.
 */
export function registerForecast(server: McpServer): void {
  server.registerTool(
    'checkWeather',
    {
      title: 'Check weather',
      description: 'Daily forecast for a city (real data from Open-Meteo, about the next 7 days)',
      inputSchema: z.object({ city: z.string().describe('City name, e.g. Barcelona') }),
      outputSchema: z.object({
        city: z.string(),
        country: z.string(),
        days: z.array(z.object({ date: z.string(), min: z.number(), max: z.number(), rainChance: z.number().nullable() })),
      }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ city }) => {
      try {
        const forecast = await getForecast(city)
        return {
          content: [
            {
              type: 'text',
              // Open-Meteo only forecasts ~16 days ahead; the trip (June 2027) is far beyond that.
              text:
                `Current forecast for ${forecast.city}, ${forecast.country} — trip dates are beyond the forecast window.\n` +
                JSON.stringify(forecast),
            },
          ],
          structuredContent: forecast,
        }
      } catch (error) {
        return toolError(`Could not get the weather for "${city}": ${error instanceof Error ? error.message : error}`)
      }
    },
  )
}
