'use client'

import { useState } from 'react'

/** The mock airline page opened by URL-mode elicitation. Nothing typed here goes anywhere. */
export function AirlineSignInForm({ eid }: { eid?: string }) {
  const [done, setDone] = useState(false)

  return (
    <div className="max-w-sm space-y-4">
      <div className="rounded-lg border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm">
        <strong>Example Air (mock)</strong> — a demo page for the MCP Live Demo. It is not a real airline, and nothing you type
        here is sent anywhere.
      </div>
      {done ? (
        <p className="text-sm">Signed in (mock). You can close this tab.</p>
      ) : (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            setDone(true)
          }}
        >
          <h1 className="text-xl font-bold">Sign in to Example Air</h1>
          <input placeholder="Email (any text)" autoComplete="off" className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
          <input placeholder="Password (any text)" type="password" autoComplete="off" className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
          <button className="w-full text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground">Sign in</button>
        </form>
      )}
      {eid && <p className="text-xs text-muted-foreground font-mono">elicitation id: {eid}</p>}
    </div>
  )
}
