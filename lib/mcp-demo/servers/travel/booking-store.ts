import { randomBytes } from 'node:crypto'

import { createRequestStateCodec, type RequestStateCodec } from '@modelcontextprotocol/server'

/** One confirmed booking. */
export interface Booking {
  id: number
  outboundFlight: string
  returnFlight: string
  hotelId: string
  seatPreference?: string
  roomType?: string
  travelInsurance: boolean
  bookedAt: string
}

/** What we seal inside requestState between round 1 and round 2 (the lesson's "bookmark"). */
export type FlowState =
  | { tool: 'bookVacation'; outboundFlight: string; returnFlight: string; hotelId: string }
  | { tool: 'signInToAirline'; airline: string; eid: string }

type Store = { bookings: Booking[]; nextId: number; codec: RequestStateCodec<FlowState> }

// On globalThis: bookings must outlive a request, and the codec key must stay the same across
// Next.js reloads — otherwise a requestState minted before a reload would fail to verify after it.
const g = globalThis as typeof globalThis & { __mcpDemoElicitation?: Store }
const store: Store = (g.__mcpDemoElicitation ??= {
  bookings: [],
  nextId: 1,
  // HMAC key for requestState. Set MCP_DEMO_STATE_KEY (32+ chars) to keep it fixed; otherwise random at boot.
  codec: createRequestStateCodec<FlowState>({
    key: process.env.MCP_DEMO_STATE_KEY ?? randomBytes(32).toString('hex'),
  }),
})

export const stateCodec = store.codec

export function addBooking(input: Omit<Booking, 'id' | 'bookedAt'>): Booking {
  const booking = { id: store.nextId++, ...input, bookedAt: new Date().toISOString() }
  store.bookings.push(booking)
  return booking
}

export const listBookings = (): Booking[] => [...store.bookings]
