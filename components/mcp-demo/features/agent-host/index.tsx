import type { UiFeature } from '../types'
import { AgentHostPanel } from './agent-host-panel'

/** Spec 9 UI: a second, independent MCP host — the Claude Agent SDK. */
export const agentHostUi: UiFeature = {
  id: 'agent-host',
  panels: [{ id: 'agent-host', label: 'Another host: Claude Agent SDK', section: 'hosts', Component: AgentHostPanel }],
}
