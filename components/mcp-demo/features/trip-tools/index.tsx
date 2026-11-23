import type { UiFeature } from '../types'
import { TripServicesPanel } from './trip-services-panel'

/** Spec 3 UI: the "Trip services" panel. The new tools themselves appear in the Explorer's Tools tab by themselves. */
export const tripToolsUi: UiFeature = {
  id: 'trip-tools',
  panels: [{ id: 'trip-services', label: 'Trip services', Component: TripServicesPanel }],
}
