'use client'

import { useCallback, useEffect, useState } from 'react'

import { JsonView } from '../../json-view'
import type { TabProps } from '../types'
import { CompletionInput } from './completion-input'
import { errorText, NotSupported } from './shared'

type Prompt = Awaited<ReturnType<TabProps['client']['listPrompts']>>['prompts'][number]
type GetResult = Awaited<ReturnType<TabProps['client']['getPrompt']>>

/** The lesson's example answers. Destination is left empty so you can type "Bar" and see completion. */
const EXAMPLE_VALUES: Record<string, Record<string, string>> = {
  'plan-vacation': {
    origin: 'New York',
    destination: '',
    departureDate: '2027-06-15',
    returnDate: '2027-06-22',
    budget: '3000',
    travelers: '2',
    interests: 'beaches, architecture, food',
  },
}

/** prompts/list shows the "empty form" → fill it → prompts/get returns the messages. */
export function PromptsTab({ client, target }: TabProps) {
  const supported = !!target.capabilities?.prompts
  const canComplete = !!target.capabilities?.completions
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [selected, setSelected] = useState<Prompt>()
  const [values, setValues] = useState<Record<string, string>>({})
  const [result, setResult] = useState<GetResult>()
  const [error, setError] = useState<string>()

  const refresh = useCallback(async () => {
    setError(undefined)
    try {
      setPrompts((await client.listPrompts()).prompts)
    } catch (e) {
      setError(errorText(e))
    }
  }, [client])

  useEffect(() => {
    if (supported) void refresh()
  }, [refresh, supported])

  const select = (p: Prompt) => {
    setSelected(p)
    const examples = EXAMPLE_VALUES[p.name] ?? {}
    setValues(Object.fromEntries((p.arguments ?? []).map((a) => [a.name, examples[a.name] ?? ''])))
    setResult(undefined)
    setError(undefined)
  }

  const get = async () => {
    if (!selected) return
    setResult(undefined)
    setError(undefined)
    // Send only what was filled in. A missing required argument makes the server answer with an error.
    const filled = Object.fromEntries(Object.entries(values).filter(([, v]) => v.trim() !== ''))
    try {
      setResult(await client.getPrompt({ name: selected.name, arguments: filled }))
    } catch (e) {
      setError(errorText(e))
    }
  }

  if (!supported) return <NotSupported capability="prompts" />

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => void refresh()} className="text-xs px-2.5 py-1 rounded border border-border hover:bg-accent/60">
          prompts/list
        </button>
        {prompts.map((p) => (
          <button
            key={p.name}
            onClick={() => select(p)}
            className={`text-xs px-2.5 py-1 rounded border border-border ${selected?.name === p.name ? 'bg-accent font-semibold' : 'hover:bg-accent/60'}`}
          >
            {p.title ?? p.name}
          </button>
        ))}
        {prompts.length === 0 && <span className="text-xs text-muted-foreground">No prompts on this server.</span>}
      </div>

      {selected && (
        <div className="space-y-3">
          {/* The prompt definition = the lesson's "empty form". */}
          <div className="rounded-lg border border-border p-3 text-xs space-y-1">
            <p>
              <span className="text-muted-foreground">name:</span> <span className="font-mono">{selected.name}</span>
            </p>
            <p>
              <span className="text-muted-foreground">title:</span> {selected.title ?? '—'}
            </p>
            <p>
              <span className="text-muted-foreground">description:</span> {selected.description ?? '—'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(selected.arguments ?? []).map((a) => (
              <label key={a.name} className="space-y-1 text-xs">
                <span className="flex items-center gap-2">
                  <span className="font-mono font-semibold">{a.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] ${a.required ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' : 'bg-muted text-muted-foreground'}`}
                  >
                    {a.required ? 'required' : 'optional'}
                  </span>
                </span>
                <CompletionInput
                  client={client}
                  completeRef={{ type: 'ref/prompt', name: selected.name }}
                  argument={a.name}
                  value={values[a.name] ?? ''}
                  onChange={(v) => setValues((prev) => ({ ...prev, [a.name]: v }))}
                  context={values}
                  placeholder={a.description}
                  enabled={canComplete}
                />
              </label>
            ))}
          </div>

          <button onClick={() => void get()} className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground">
            prompts/get {selected.name}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400 break-words">{error}</p>}

      {result && (
        <div className="space-y-2">
          <p className="text-xs font-semibold">messages</p>
          {result.messages.map((m, i) => (
            <div key={i} className="rounded-lg border border-border p-3 text-sm space-y-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">
                {m.role}
              </span>
              {m.content.type === 'text' ? <p>{m.content.text}</p> : <JsonView value={m.content} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
