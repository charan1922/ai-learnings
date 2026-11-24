import type { UiFeature } from '../types'
import { RemoteServersPanel } from './remote-servers-panel'

/** Spec 7 UI: the "Remote servers" panel. */
export const remotesUi: UiFeature = {
  id: 'remotes',
  panels: [{ id: 'remote-servers', label: 'Remote servers', section: 'architecture', Component: RemoteServersPanel }],
}
