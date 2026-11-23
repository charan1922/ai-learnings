import { baseFeature } from './base/server'
import { resourcesPromptsFeature } from './resources-prompts/server'
import { tripToolsFeature } from './trip-tools/server'
import type { ServerFeature } from './types'

/** Each feature spec adds exactly one line here. No feature imports another feature. */
export const serverFeatures: ServerFeature[] = [
  baseFeature, // Spec 1: searchFlights
  resourcesPromptsFeature, // Spec 2: resources, templates, prompts, completion, watch
  tripToolsFeature, // Spec 3: checkWeather, createCalendarEvent, sendEmail
]
