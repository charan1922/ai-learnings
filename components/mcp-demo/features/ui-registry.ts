import { agentHostUi } from './agent-host'
import { chatUi } from './chat'
import { discoveryUi } from './discovery'
import { elicitationUi } from './elicitation'
import { remotesUi } from './remotes'
import { resourcesPromptsUi } from './resources-prompts'
import { stdioUi } from './stdio'
import { tripToolsUi } from './trip-tools'
import type { UiFeature } from './types'

/** Each feature spec adds exactly one line here. No feature imports another feature. */
export const uiFeatures: UiFeature[] = [
  resourcesPromptsUi, // Spec 2: Resources, Templates, Prompts tabs + Watch a resource
  tripToolsUi, // Spec 3: Trip services panel
  elicitationUi, // Spec 4: elicitation capability, dialog, Elicitation panel
  discoveryUi, // Spec 5: Discover + Raw JSON-RPC tabs, Tool-list changes panel
  stdioUi, // Spec 6: Same message, two transports
  remotesUi, // Spec 7: Remote servers (+ proxy for CORS)
  chatUi, // Spec 8: Chat — Claude chooses the tools, our host runs them
  agentHostUi, // Spec 9: a second host — the Claude Agent SDK
]
