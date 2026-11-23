import type { UiFeature } from '../types'
import { PromptsTab } from './prompts-tab'
import { ResourcesTab } from './resources-tab'
import { TemplatesTab } from './templates-tab'
import { WatchResourcePanel } from './watch-resource-panel'

/** Spec 2 UI: three Explorer tabs and the "Watch a resource" panel. */
export const resourcesPromptsUi: UiFeature = {
  id: 'resources-prompts',
  tabs: [
    { id: 'resources', label: 'Resources', Component: ResourcesTab },
    { id: 'templates', label: 'Templates', Component: TemplatesTab },
    { id: 'prompts', label: 'Prompts', Component: PromptsTab },
  ],
  panels: [{ id: 'watch-resource', label: 'Watch a resource', Component: WatchResourcePanel }],
}
