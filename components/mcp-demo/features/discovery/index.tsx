import type { UiFeature } from '../types'
import { DiscoverTab } from './discover-tab'
import { RawTab } from './raw-tab'
import { ToolListPanel } from './tool-list-panel'

/** Spec 5 UI: Discover and Raw JSON-RPC tabs, and the "Tool-list changes" panel. */
export const discoveryUi: UiFeature = {
  id: 'discovery',
  tabs: [
    { id: 'discover', label: 'Discover', Component: DiscoverTab },
    { id: 'raw', label: 'Raw JSON-RPC', Component: RawTab },
  ],
  panels: [{ id: 'tool-list', label: 'Tool-list changes', section: 'architecture', Component: ToolListPanel }],
}
