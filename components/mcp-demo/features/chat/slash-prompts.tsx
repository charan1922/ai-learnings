'use client'

import { useEffect, useState } from 'react'

import type { HostClient } from '@/lib/mcp-demo/host'

// Spec 2 exports this input for reuse ("Spec 8 can import it").
import { CompletionInput } from '../resources-prompts/completion-input'
import { LESSON_TRIP, promptMessages } from './chat-loop'

type Client = NonNullable<HostClient['client']>
type Prompt = Awaited<ReturnType<Client['listPrompts']>>['prompts'][number]

/** One prompt offered by one connected server. */
export interface SlashPrompt {
  server: string
  client: Client
  canComplete: boolean
  prompt: Prompt
}

/** prompts/list on every connected server that has prompts — the slash-command menu. */
export function useSlashPrompts(clients: readonly HostClient[]): SlashPrompt[] {
  const [prompts, setPrompts] = useState<SlashPrompt[]>([])
  // Re-list only when the set of connected servers changes.
  const key = clients
    .filter((c) => c.status === 'connected' && c.capabilities?.prompts)
    .map((c) => c.target.id)
    .join(',')

  useEffect(() => {
    let stale = false
    const rows = clients.filter((c) => c.status === 'connected' && c.client && c.capabilities?.prompts)
    Promise.all(
      rows.map(async (row) => {
        const { prompts: list } = await row.client!.listPrompts()
        return list.map((prompt) => ({ server: row.target.id, client: row.client!, canComplete: !!row.capabilities?.completions, prompt }))
      }),
    )
      .then((lists) => !stale && setPrompts(lists.flat()))
      .catch(() => !stale && setPrompts([]))
    return () => {
      stale = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` captures the relevant change in `clients`
  }, [key])

  return prompts
}

/** The dropdown under the chat box while the text starts with "/". */
export function SlashMenu({ prompts, typed, onPick }: { prompts: SlashPrompt[]; typed: string; onPick: (p: SlashPrompt) => void }) {
  const query = typed.slice(1).toLowerCase()
  const matches = prompts.filter((p) => p.prompt.name.toLowerCase().startsWith(query))
  return (
    <ul className="rounded-md border border-border bg-background shadow-md text-xs max-h-48 overflow-y-auto">
      {matches.map((p) => (
        <li key={`${p.server}/${p.prompt.name}`}>
          <button
            type="button"
            // onMouseDown so it runs before the input loses focus
            onMouseDown={(e) => {
              e.preventDefault()
              onPick(p)
            }}
            className="w-full text-left px-2 py-1.5 hover:bg-accent"
          >
            <span className="font-mono font-semibold">/{p.prompt.name}</span>
            <span className="text-muted-foreground">
              {' '}
              — {p.prompt.title ?? p.prompt.description ?? ''} ({p.server})
            </span>
          </button>
        </li>
      ))}
      {matches.length === 0 && (
        <li className="px-2 py-1.5 text-muted-foreground">
          {prompts.length ? 'No prompt starts with that.' : 'No connected server offers prompts.'}
        </li>
      )}
    </ul>
  )
}

/** The picked prompt's argument form (lesson values pre-filled), then prompts/get. */
export function SlashPromptForm({
  picked,
  disabled,
  onRun,
  onCancel,
}: {
  picked: SlashPrompt
  disabled: boolean
  onRun: (messages: ReturnType<typeof promptMessages>, from: string) => void
  onCancel: () => void
}) {
  const args = picked.prompt.arguments ?? []
  const lesson = LESSON_TRIP as unknown as Record<string, string>
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(args.map((a) => [a.name, lesson[a.name] ?? ''])))
  const [error, setError] = useState<string>()
  const missing = args.filter((a) => a.required && !values[a.name]?.trim()).map((a) => a.name)

  const run = async () => {
    setError(undefined)
    const filled = Object.fromEntries(Object.entries(values).filter(([, v]) => v.trim() !== ''))
    try {
      const got = await picked.client.getPrompt({ name: picked.prompt.name, arguments: filled })
      const messages = promptMessages(got) // the Claude SDK's MCP helper converts the prompt's messages
      if (!messages.some((m) => m.role === 'user')) return setError('The prompt returned no user message.')
      onRun(messages, `/${picked.prompt.name} → prompts/get (${picked.server})`)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div className="shrink-0 max-h-80 overflow-y-auto rounded-lg border border-border bg-muted/30 p-2.5 space-y-2 text-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono font-semibold">/{picked.prompt.name}</p>
          {picked.prompt.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-2">{picked.prompt.description}</p>
          )}
        </div>
        <button type="button" onClick={onCancel} aria-label="Close" className="text-muted-foreground hover:text-foreground">
          ✕
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
        {args.map((a, i) => (
          // An odd last field (e.g. "interests") gets the full width.
          <label key={a.name} className={`space-y-0.5 ${i === args.length - 1 && args.length % 2 === 1 ? 'col-span-2' : ''}`}>
            <span className="font-mono text-muted-foreground">
              {a.name}
              {a.required && <span className="text-red-600"> *</span>}
            </span>
            <CompletionInput
              client={picked.client}
              completeRef={{ type: 'ref/prompt', name: picked.prompt.name }}
              argument={a.name}
              value={values[a.name] ?? ''}
              onChange={(v) => setValues((prev) => ({ ...prev, [a.name]: v }))}
              context={values}
              placeholder={a.description}
              enabled={picked.canComplete}
            />
          </label>
        ))}
      </div>
      {error && <p className="text-red-600 dark:text-red-400 break-words">{error}</p>}
      <div className="flex items-center justify-end gap-2 pt-0.5">
        <button type="button" onClick={onCancel} className="px-2.5 py-1.5 rounded-md border border-border hover:bg-accent/60">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void run()}
          disabled={disabled || missing.length > 0}
          title={missing.length ? `Fill in: ${missing.join(', ')}` : 'prompts/get, then send the message to the chat'}
          className="px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
        >
          Use prompt
        </button>
      </div>
    </div>
  )
}
