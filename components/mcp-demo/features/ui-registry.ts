import { resourcesPromptsUi } from './resources-prompts'
import { tripToolsUi } from './trip-tools'
import type { UiFeature } from './types'

/** Each feature spec adds exactly one line here. No feature imports another feature. */
export const uiFeatures: UiFeature[] = [
  resourcesPromptsUi, // Spec 2: Resources, Templates, Prompts tabs + Watch a resource
  tripToolsUi, // Spec 3: Trip services panel
]
