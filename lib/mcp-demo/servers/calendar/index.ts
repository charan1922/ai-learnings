import type { ServerDefinition } from '../types'
import { availabilityAdminActions, registerAvailability } from './availability'
import { registerEmail } from './email'
import { registerEvents } from './events'

/** The Calendar/Email server: your availability, calendar events and email. */
export const calendarServer: ServerDefinition = {
  // Lesson: "If the server advertises "subscribe": true for resources, the app can use subscriptions/listen."
  options: { capabilities: { resources: { subscribe: true } } },
  register(server) {
    registerAvailability(server)
    registerEvents(server)
    registerEmail(server)
  },
  adminActions: availabilityAdminActions,
}
