'use client'

import { useState } from 'react'

import type { PanelProps } from '../types'

type Outcome = { label: string; text: string; isError: boolean }

/** The lesson's Barcelona package (MCP Client lesson, bookVacation request). */
const PACKAGE = { outboundFlight: 'EX101', returnFlight: 'EX102', hotelId: 'beachfront-hotel' }

/** One-click buttons for the three Spec 4 tools on the Travel server. */
export function BookingPanel({ clients }: PanelProps) {
  const travel = clients.find((c) => c.target.id === 'travel' && c.status === 'connected')?.client
  const [busy, setBusy] = useState<string>()
  const [outcome, setOutcome] = useState<Outcome>()

  const run = async (label: string, name: string, args: Record<string, unknown>) => {
    if (!travel) return
    setBusy(label)
    setOutcome(undefined)
    try {
      // callTool runs BOTH MRTR rounds inside: round 1 → dialog → round 2 → result.
      const result = await travel.callTool({ name, arguments: args })
      const text = result.content.map((c) => (c.type === 'text' ? c.text : `[${c.type}]`)).join('\n')
      setOutcome({ label, text, isError: result.isError === true })
    } catch (e) {
      setOutcome({ label, text: e instanceof Error ? e.message : String(e), isError: true })
    } finally {
      setBusy(undefined)
    }
  }

  const buttons = [
    { label: 'Book the Barcelona package', name: 'bookVacation', args: PACKAGE },
    { label: 'Sign in to airline', name: 'signInToAirline', args: { airline: 'Example Air' } },
    { label: 'Check booking status', name: 'getBookingStatus', args: {} },
  ]

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {buttons.map((b) => (
          <button
            key={b.name}
            onClick={() => void run(b.label, b.name, b.args)}
            disabled={!travel || busy !== undefined}
            className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-accent/60 disabled:opacity-50"
          >
            {busy === b.label ? 'Waiting…' : b.label}
          </button>
        ))}
      </div>
      {outcome && (
        <div
          className={`rounded-lg border p-3 text-sm whitespace-pre-wrap ${outcome.isError ? 'border-red-300 text-red-700 dark:text-red-300' : 'border-border'}`}
        >
          <p className="text-xs text-muted-foreground mb-1">{outcome.label}</p>
          {outcome.text}
        </div>
      )}
    </div>
  )
}
