'use client'

import type { ElicitResult } from '@modelcontextprotocol/client'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

import { elicitationStore, type PendingElicitation } from './elicitation-bridge'

/** The parts of a requestedSchema property we render. */
type Field = { type: string; enum?: string[]; default?: unknown; description?: string; title?: string }
type FormSchema = { properties: Record<string, Field>; required?: string[] }

/** Shows the pending elicitation (form or URL mode) as a dialog. Renders nothing when there is none. */
export function ElicitationDialog() {
  const pending = useSyncExternalStore(elicitationStore.subscribe, elicitationStore.getSnapshot, () => undefined)
  // key: a fresh dialog (and fresh form values) for every new request.
  // Portal to <body>: this component lives in a tab that may be hidden, and a hidden
  // parent would hide the dialog too — the chat would then wait for an answer nobody can see.
  return pending ? createPortal(<Dialog key={pending.id} pending={pending} />, document.body) : null
}

function Dialog({ pending }: { pending: PendingElicitation }) {
  const { params, server, respond } = pending
  const answer = (result: ElicitResult) => respond(result)

  // Esc = dismiss without choosing → cancel (lesson: "Dismiss the form without choosing").
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && respond({ action: 'cancel' })
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [respond])

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => answer({ action: 'cancel' })}>
      <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-md p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">
              <span className="font-mono">{server}</span> is asking ({params.mode === 'url' ? 'URL mode' : 'form mode'})
            </p>
            <p className="text-sm font-medium mt-1">{params.message}</p>
          </div>
          <button onClick={() => answer({ action: 'cancel' })} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>
        {params.mode === 'url' ? (
          <UrlBody url={params.url} answer={answer} />
        ) : (
          <FormBody schema={params.requestedSchema as unknown as FormSchema} answer={answer} />
        )}
      </div>
    </div>
  )
}

/** URL mode: show the full URL, and ask before opening it. */
function UrlBody({ url, answer }: { url: string; answer: (r: ElicitResult) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-mono break-all rounded bg-muted p-2">{url}</p>
      <p className="text-xs text-muted-foreground">Opening the link only gives permission to open the page. You sign in on that site.</p>
      <div className="flex gap-2 justify-end">
        <button onClick={() => answer({ action: 'cancel' })} className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-accent/60">
          Cancel
        </button>
        <button
          onClick={() => {
            window.open(url, '_blank', 'noopener')
            answer({ action: 'accept' })
          }}
          className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground"
        >
          Open link
        </button>
      </div>
    </div>
  )
}

/** Form mode: one input per property in requestedSchema. */
function FormBody({ schema, answer }: { schema: FormSchema; answer: (r: ElicitResult) => void }) {
  const fields = Object.entries(schema.properties ?? {})
  const required = new Set(schema.required ?? [])
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(fields.map(([name, f]) => [name, f.default ?? (f.type === 'boolean' ? false : undefined)])),
  )
  const set = (name: string, value: unknown) => setValues((prev) => ({ ...prev, [name]: value }))

  // A required checkbox always has an answer (true or false); other required fields must be filled.
  const missing = fields.filter(([name, f]) => required.has(name) && f.type !== 'boolean' && (values[name] ?? '') === '')
  const content = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined && v !== '')) as Record<
    string,
    string | number | boolean
  >

  return (
    <div className="space-y-3">
      {fields.map(([name, f]) => (
        <label key={name} className="block space-y-1 text-xs">
          <span className="flex items-center gap-2">
            <span className="font-mono font-semibold">{name}</span>
            {required.has(name) && <span className="text-red-600">required</span>}
          </span>
          {f.type === 'boolean' ? (
            <span className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={values[name] === true} onChange={(e) => set(name, e.target.checked)} />
              {f.description ?? f.title}
            </span>
          ) : f.enum ? (
            <select
              value={(values[name] as string | undefined) ?? ''}
              onChange={(e) => set(name, e.target.value || undefined)}
              className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
            >
              <option value="">— choose —</option>
              {f.enum.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={f.type === 'number' || f.type === 'integer' ? 'number' : 'text'}
              value={(values[name] as string | number | undefined) ?? ''}
              onChange={(e) => set(name, f.type === 'number' || f.type === 'integer' ? Number(e.target.value) : e.target.value)}
              className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
            />
          )}
          {f.type !== 'boolean' && f.description && <span className="text-muted-foreground">{f.description}</span>}
        </label>
      ))}

      <div className="flex gap-2 justify-end pt-1">
        <button onClick={() => answer({ action: 'decline' })} className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-accent/60">
          Decline
        </button>
        <button
          onClick={() => answer({ action: 'accept', content })}
          disabled={missing.length > 0}
          title={missing.length ? `Fill in: ${missing.map(([n]) => n).join(', ')}` : undefined}
          className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </div>
  )
}
