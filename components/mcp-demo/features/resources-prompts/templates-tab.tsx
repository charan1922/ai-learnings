'use client'

import { useCallback, useEffect, useState } from 'react'

import type { TabProps } from '../types'
import { CompletionInput } from './completion-input'
import { errorText, NotSupported, ResourceContents, type ReadResult } from './shared'

type Template = Awaited<ReturnType<TabProps['client']['listResourceTemplates']>>['resourceTemplates'][number]

/** The lesson's example: Barcelona museums. */
const EXAMPLE_VALUES: Record<string, string> = { city: 'Barcelona', category: 'museums' }

const PLACEHOLDER = /\{([^}]+)\}/g

/** "travel://activities/{city}/{category}" → ["city", "category"] */
const placeholdersOf = (uriTemplate: string) => [...uriTemplate.matchAll(PLACEHOLDER)].map((m) => m[1])

/** Fill every {placeholder} with its value → a real URI. */
const fill = (uriTemplate: string, values: Record<string, string>) =>
  uriTemplate.replace(PLACEHOLDER, (_, name: string) => encodeURIComponent(values[name] ?? ''))

/** resources/templates/list → fill the placeholders → resources/read the built URI. */
export function TemplatesTab({ client, target }: TabProps) {
  const supported = !!target.capabilities?.resources
  const canComplete = !!target.capabilities?.completions
  const [templates, setTemplates] = useState<Template[]>([])
  const [selected, setSelected] = useState<Template>()
  const [values, setValues] = useState<Record<string, string>>({})
  const [result, setResult] = useState<ReadResult>()
  const [error, setError] = useState<string>()

  const refresh = useCallback(async () => {
    setError(undefined)
    try {
      setTemplates((await client.listResourceTemplates()).resourceTemplates)
    } catch (e) {
      setError(errorText(e))
    }
  }, [client])

  useEffect(() => {
    if (supported) void refresh()
  }, [refresh, supported])

  const select = (t: Template) => {
    setSelected(t)
    setValues(Object.fromEntries(placeholdersOf(t.uriTemplate).map((p) => [p, EXAMPLE_VALUES[p] ?? ''])))
    setResult(undefined)
    setError(undefined)
  }

  const uri = selected ? fill(selected.uriTemplate, values) : ''

  const read = async () => {
    setResult(undefined)
    setError(undefined)
    try {
      setResult(await client.readResource({ uri }))
    } catch (e) {
      setError(errorText(e))
    }
  }

  if (!supported) return <NotSupported capability="resources" />

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => void refresh()} className="text-xs px-2.5 py-1 rounded border border-border hover:bg-accent/60">
          resources/templates/list
        </button>
        {templates.map((t) => (
          <button
            key={t.uriTemplate}
            onClick={() => select(t)}
            className={`text-xs px-2.5 py-1 rounded border border-border font-mono ${selected?.uriTemplate === t.uriTemplate ? 'bg-accent font-semibold' : 'hover:bg-accent/60'}`}
          >
            {t.uriTemplate}
          </button>
        ))}
        {templates.length === 0 && <span className="text-xs text-muted-foreground">No templates on this server.</span>}
      </div>

      {selected && (
        <div className="space-y-3">
          {selected.description && <p className="text-sm text-muted-foreground">{selected.description}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {placeholdersOf(selected.uriTemplate).map((p) => (
              <label key={p} className="space-y-1 text-xs">
                <span className="font-mono font-semibold">{`{${p}}`}</span>
                <CompletionInput
                  client={client}
                  completeRef={{ type: 'ref/resource', uri: selected.uriTemplate }}
                  argument={p}
                  value={values[p] ?? ''}
                  onChange={(v) => setValues((prev) => ({ ...prev, [p]: v }))}
                  context={values}
                  enabled={canComplete}
                />
              </label>
            ))}
          </div>
          <p className="text-xs">
            Built URI: <span className="font-mono font-semibold">{uri}</span>
          </p>
          <button onClick={() => void read()} className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground">
            resources/read
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400 break-words">{error}</p>}
      {result && <ResourceContents result={result} />}
    </div>
  )
}
