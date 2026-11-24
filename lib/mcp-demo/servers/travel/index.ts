import type { ServerDefinition } from '../types'
import { registerActivities } from './activities'
import { registerBooking } from './booking'
import { stateCodec } from './booking-store'
import { registerFlights } from './flights'
import { hotelAdminActions, registerHotels } from './hotels'
import { registerProfile } from './profile'
import { registerTripPlanning } from './trip-planning'

/** The Travel server: flights, hotels, booking, the traveller's profile, activities and trip planning. */
export const travelServer: ServerDefinition = {
  // Booking's requestState is HMAC-checked BEFORE any tool runs; a tampered one gets -32602.
  options: { requestState: { verify: (state, ctx) => stateCodec.verify(state, ctx) } },
  register(server, ctx) {
    registerFlights(server)
    registerHotels(server)
    registerBooking(server, ctx)
    registerProfile(server)
    registerActivities(server)
    registerTripPlanning(server)
  },
  adminActions: hotelAdminActions,
}
