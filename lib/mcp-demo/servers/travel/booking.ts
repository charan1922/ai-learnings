import { randomUUID } from 'node:crypto'

import { acceptedContent, inputRequired, type McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'

import { toolText } from '../shared'
import type { ServerContext } from '../types'
import { addBooking, listBookings, stateCodec, type FlowState } from './booking-store'

/**
 * Booking: `bookVacation`, `signInToAirline`, `getBookingStatus`.
 * MCP concept: elicitation with the 2026-07-28 MRTR flow (MCP Client lesson).
 *   Round 1: the tool answers `input_required` (a form or a URL + a sealed requestState).
 *   Round 2: the client calls again with `inputResponses` and the same requestState → the tool finishes.
 * The travel server verifies every echoed requestState (HMAC) before the tool runs — see ./index.ts.
 */

/** The form from the MCP Client lesson, exactly: message + requestedSchema. */
const BOOKING_MESSAGE =
  'Please confirm your Barcelona vacation booking: flights June 15-22, beachfront hotel, total $3,000.'
const BOOKING_SCHEMA = {
  type: 'object' as const,
  properties: {
    confirmBooking: { type: 'boolean' as const, description: 'Confirm the booking (Flights + Hotel = $3,000)' },
    seatPreference: {
      type: 'string' as const,
      enum: ['window', 'aisle', 'no preference'],
      description: 'Preferred seat type for flights',
    },
    roomType: {
      type: 'string' as const,
      enum: ['sea view', 'city view', 'garden view'],
      description: 'Preferred room type at hotel',
    },
    travelInsurance: { type: 'boolean' as const, default: false, description: 'Add travel insurance ($150)' },
  },
  required: ['confirmBooking'],
}

/** Validates the answer the client sends back (it is untrusted input). */
const BookingAnswer = z.object({
  confirmBooking: z.boolean(),
  seatPreference: z.enum(['window', 'aisle', 'no preference']).optional(),
  roomType: z.enum(['sea view', 'city view', 'garden view']).optional(),
  travelInsurance: z.boolean().optional(),
})

/** The bare elicitation answer for one key: { action: 'accept' | 'decline' | 'cancel', content? }. */
function answerFor(responses: Record<string, unknown> | undefined, key: string): { action?: string } | undefined {
  const entry = responses?.[key]
  return entry && typeof entry === 'object' ? (entry as { action?: string }) : undefined
}

export function registerBooking(server: McpServer, ctx: ServerContext): void {
  server.registerTool(
    'bookVacation',
    {
      title: 'Book vacation',
      description: 'Book the flights and hotel. Asks you to confirm first (form-mode elicitation).',
      inputSchema: z.object({
        outboundFlight: z.string().describe('e.g. EX101'),
        returnFlight: z.string().describe('e.g. EX102'),
        hotelId: z.string().describe('e.g. beachfront-hotel'),
      }),
    },
    async ({ outboundFlight, returnFlight, hotelId }, toolCtx) => {
      const responses = toolCtx.mcpReq.inputResponses
      const answer = answerFor(responses, 'bookingConfirmation')
      const state = toolCtx.mcpReq.requestState<FlowState>()

      // Round 1 (or no valid bookmark): ask for confirmation and hand the client a sealed bookmark.
      if (!answer || state?.tool !== 'bookVacation') {
        return inputRequired({
          inputRequests: {
            bookingConfirmation: inputRequired.elicit({ message: BOOKING_MESSAGE, requestedSchema: BOOKING_SCHEMA }),
          },
          requestState: await stateCodec.mint({ tool: 'bookVacation', outboundFlight, returnFlight, hotelId }),
        })
      }

      // The bookmark must describe THIS booking (it is signed, so it can't be edited — but the arguments can).
      if (state.outboundFlight !== outboundFlight || state.returnFlight !== returnFlight || state.hotelId !== hotelId) {
        return { ...toolText('The booking details changed between the two calls — nothing was booked. Start again.'), isError: true }
      }

      // Round 2: what did the user do with the form?
      if (answer.action === 'decline') return toolText('You declined the booking form — nothing was booked.')
      if (answer.action === 'cancel') return toolText('You closed the booking form without choosing — nothing was booked.')

      const content = acceptedContent(responses, 'bookingConfirmation', BookingAnswer)
      if (!content) return { ...toolText('The form answer was not valid — nothing was booked.'), isError: true }
      if (!content.confirmBooking) return toolText('Booking not confirmed — nothing was booked.')

      const booking = addBooking({
        outboundFlight,
        returnFlight,
        hotelId,
        seatPreference: content.seatPreference,
        roomType: content.roomType,
        travelInsurance: content.travelInsurance ?? false,
      })
      const room = content.roomType ? `a ${content.roomType.replace(' ', '-')} room` : 'a room'
      return toolText(
        `Booked ${outboundFlight} and ${returnFlight} and ${room} at the ${hotelId.replace(/-/g, ' ')}. (booking #${booking.id})`,
      )
    },
  )

  server.registerTool(
    'signInToAirline',
    {
      title: 'Sign in to airline',
      description: 'Sign in on the airline website (URL-mode elicitation: the password never reaches this server)',
      inputSchema: z.object({ airline: z.string().describe('e.g. Example Air') }),
    },
    async ({ airline }, toolCtx) => {
      const answer = answerFor(toolCtx.mcpReq.inputResponses, 'airlineSignIn')
      const state = toolCtx.mcpReq.requestState<FlowState>()

      if (!answer || state?.tool !== 'signInToAirline') {
        const eid = randomUUID()
        const origin = ctx.requestInfo ? new URL(ctx.requestInfo.url).origin : 'http://localhost:6060'
        return inputRequired({
          inputRequests: {
            airlineSignIn: inputRequired.elicitUrl({
              message: `Sign in to ${airline} to link your booking.`,
              url: `${origin}/mcp/live-demo/airline-signin?eid=${eid}`,
            }),
          },
          requestState: await stateCodec.mint({ tool: 'signInToAirline', airline, eid }),
        })
      }

      // Lesson: "The client knows whether you agreed to open the link." Not whether you signed in.
      if (answer.action === 'accept') {
        return toolText(
          `You agreed to open the ${state.airline} sign-in page (id ${state.eid}). ` +
            'Signing in happens on the airline website — the password never reaches this server.',
        )
      }
      return toolText(`Sign-in skipped (${answer.action}). The ${state.airline} page was not opened.`)
    },
  )

  server.registerTool(
    'getBookingStatus',
    {
      title: 'Get booking status',
      description: 'List your bookings. Check this before booking again (e.g. after closing the app).',
      inputSchema: z.object({ bookingId: z.number().optional().describe('One booking id, or leave out for all') }),
      annotations: { readOnlyHint: true },
    },
    async ({ bookingId }) => {
      const bookings = listBookings().filter((b) => bookingId === undefined || b.id === bookingId)
      if (bookings.length === 0) return toolText('No bookings yet.')
      return toolText(JSON.stringify(bookings, null, 2))
    },
  )
}
