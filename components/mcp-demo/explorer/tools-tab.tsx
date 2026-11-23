'use client'

import { useCallback, useEffect, useState } from 'react'

import type { TabProps } from '../features/types'
import { JsonView } from '../json-view'

type Tool = Awaited<ReturnType<TabProps['client']['listTools']>>['tools'][number]
type CallResult = Awaited<ReturnType<TabProps['client']['callTool']>>

/** Pre-filled arguments using the lesson's values. */
const EXAMPLE_ARGS: Record<string, unknown> = {
  searchFlights: { origin: 'New York', destination: 'Barcelona', date: '2027-06-15' },
}

/** Lesson values if we have them, otherwise one empty string per inputSchema property. */
function argsTemplate(tool: Tool): string {
  if (EXAMPLE_ARGS[tool.name]) return JSON.stringify(EXAMPLE_ARGS[tool.name], null, 2)
  const props = Object.keys((tool.inputSchema.properties ?? {}) as Record<string, unknown>)
  return JSON.stringify(Object.fromEntries(props.map((p) => [p, ''])), null, 2)
}

/** tools/list → pick a tool → see its schemas → tools/call → see content AND structuredContent. */
export function ToolsTab({ client }: TabProps) {
  const [tools, setTools] = useState<Tool[]>([])
  const [selected, setSelected] = useState<Tool | undefined>()
  const [args, setArgs] = useState('{}')
  const [result, setResult] = useState<CallResult | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    setError(undefined)
    try {
      const { tools: list } = await client.listTools()
      setTools(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [client])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const select = (tool: Tool) => {
    setSelected(tool)
    setArgs(argsTemplate(tool))
    setResult(undefined)
    setError(undefined)
  }

  const call = async () => {
    if (!selected) return
    setBusy(true)
    setError(undefined)
    try {
      setResult(await client.callTool({ name: selected.name, arguments: JSON.parse(args) as Record<string, unknown> }))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => void refresh()} className="text-xs px-2.5 py-1 rounded border border-border hover:bg-accent/60">
          tools/list
        </button>
        {tools.map((t) => (
          <button
            key={t.name}
            onClick={() => select(t)}
            className={`text-xs px-2.5 py-1 rounded border border-border font-mono ${selected?.name === t.name ? 'bg-accent font-semibold' : 'hover:bg-accent/60'}`}
          >
            {t.name}
          </button>
        ))}
        {tools.length === 0 && <span className="text-xs text-muted-foreground">No tools on this server yet.</span>}
      </div>

      {selected && (
        <div className="space-y-3">
          {selected.description && <p className="text-sm text-muted-foreground">{selected.description}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold mb-1">inputSchema</p>
              <JsonView value={selected.inputSchema} />
            </div>
            <div>
              <p className="text-xs font-semibold mb-1">outputSchema</p>
              <JsonView value={selected.outputSchema ?? 'none'} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold mb-1">arguments</p>
            <textarea
              value={args}
              onChange={(e) => setArgs(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-border bg-background p-2 font-mono text-xs"
            />
          </div>
          <button
            onClick={() => void call()}
            disabled={busy}
            className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
          >
            {busy ? 'Calling…' : `tools/call ${selected.name}`}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400 break-words">{error}</p>}

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold mb-1">content {result.isError ? '(isError: true)' : ''}</p>
            <JsonView value={result.content} />
          </div>
          <div>
            <p className="text-xs font-semibold mb-1">structuredContent</p>
            <JsonView value={result.structuredContent ?? 'none'} />
          </div>
        </div>
      )}
    </div>
  )
}
