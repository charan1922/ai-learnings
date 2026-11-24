import type { UiFeature } from '../types'
import { TransportCompare } from './transport-compare'

/** Spec 6 UI: the "Same message, two transports" panel. */
export const stdioUi: UiFeature = {
  id: 'stdio',
  panels: [{ id: 'transport-compare', label: 'Same message, two transports', section: 'architecture', Component: TransportCompare }],
}
