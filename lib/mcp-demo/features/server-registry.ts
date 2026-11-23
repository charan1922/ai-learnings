import { baseFeature } from './base/server'
import type { ServerFeature } from './types'

/**
 * Every server-side feature, in one list.
 * Each later spec adds exactly one line here, e.g.:
 *   import { resourcesPromptsFeature } from './resources-prompts/server'
 *   ... [baseFeature, resourcesPromptsFeature]
 */
export const serverFeatures: ServerFeature[] = [baseFeature]
