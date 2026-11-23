'use client'

import type { Client } from '@modelcontextprotocol/client'
import { useEffect, useState } from 'react'

type CompleteRef = Parameters<Client['complete']>[0]['ref']

interface CompletionInputProps {
  client: Client
  /** What we're completing: a prompt argument ({ type: 'ref/prompt' }) or a template placeholder ({ type: 'ref/resource' }). */
  completeRef: CompleteRef
  /** The argument / placeholder name, e.g. "destination". */
  argument: string
  value: string
  onChange: (value: string) => void
  /** Values already filled in, sent as context (e.g. the city, when completing a category). */
  context?: Record<string, string>
  placeholder?: string
  /** False when the server has no "completions" capability: a plain input, no requests. */
  enabled: boolean
}

/**
 * A text box that asks the server for suggestions with completion/complete while you type
 * (lesson: typing "Bar" into a destination field brings up Barcelona).
 * Only asks while the box has focus, 300 ms after the last key press.
 */
export function CompletionInput(props: CompletionInputProps) {
  const { client, completeRef, argument, value, onChange, context, placeholder, enabled } = props
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [focused, setFocused] = useState(false)

  // Objects change identity every render; compare them as text instead.
  const refKey = JSON.stringify(completeRef)
  const contextKey = JSON.stringify(context ?? {})

  useEffect(() => {
    if (!enabled || !focused || !value) return
    let stale = false
    const timer = setTimeout(() => {
      client
        .complete({
          ref: JSON.parse(refKey) as CompleteRef,
          argument: { name: argument, value },
          context: { arguments: JSON.parse(contextKey) as Record<string, string> },
        })
        .then(({ completion }) => {
          if (!stale) setSuggestions(completion.values)
        })
        .catch(() => {
          if (!stale) setSuggestions([])
        })
    }, 300)
    return () => {
      stale = true
      clearTimeout(timer)
    }
  }, [client, refKey, argument, value, contextKey, enabled, focused])

  const shown = enabled && focused && value ? suggestions.filter((s) => s !== value) : []

  return (
    <div className="relative">
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-md border border-border bg-background px-2 py-1 font-mono text-xs"
      />
      {shown.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md text-xs">
          {shown.map((s) => (
            <li key={s}>
              <button
                // onMouseDown (not onClick) so it runs before the input's blur hides the list.
                onMouseDown={(e) => {
                  e.preventDefault()
                  onChange(s)
                }}
                className="w-full text-left px-2 py-1 font-mono hover:bg-accent"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
