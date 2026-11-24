'use client'

import { useEffect, useRef, useState } from 'react'

import { logStore } from '@/lib/mcp-demo/log-store'

import { JsonView } from '../../json-view'
import { Markdown } from '../../markdown'
import type { PanelProps } from '../types'
import {
  availability,
  LESSON_TRIP,
  readContext,
  runTrip,
  sendMessage,
  startSession,
  type ChatSession,
  type RunInfo,
  type TranscriptItem,
  type TripInput,
} from './chat-loop'
import { SlashMenu, SlashPromptForm, useSlashPrompts, type SlashPrompt } from './slash-prompts'
import { StepTracker } from './step-tracker'

/**
 * A chatbot on top of our MCP host: type anything — the model chooses the tools, our browser host runs them.
 * "Plan the trip" starts a conversation with the lesson's five-step trip; you can keep chatting afterwards.
 */
export function ChatPanel({ clients }: PanelProps) {
  const [available, setAvailable] = useState<boolean>()
  const [model, setModel] = useState<{ provider?: string; model?: string }>({})
  const [trip, setTrip] = useState<TripInput>(LESSON_TRIP)
  const [items, setItems] = useState<TranscriptItem[]>([])
  const [info, setInfo] = useState<RunInfo>()
  const [sinceId, setSinceId] = useState<number>()
  const [running, setRunning] = useState(false)
  const abort = useRef<AbortController | undefined>(undefined)
  const session = useRef<ChatSession | undefined>(undefined) // the conversation so far (tools fixed, messages grow)
  const [draft, setDraft] = useState('')
  const transcriptRef = useRef<HTMLOListElement>(null)
  // Slash commands: the servers' MCP prompts (lesson: a prompt can appear "as a menu item, button, or slash command").
  const slashPrompts = useSlashPrompts(clients)
  const [picked, setPicked] = useState<SlashPrompt>()
  const showSlashMenu = draft.startsWith('/') && !picked

  // Follow the newest message.
  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' })
  }, [items])
  // Don't start before the local servers are connected — otherwise there's no prompt, context or tools yet.
  const ready = ['travel', 'weather', 'calendar'].every((id) => clients.find((c) => c.target.id === id)?.status === 'connected')

  useEffect(() => {
    fetch('/api/mcp-demo/chat')
      .then((r) => r.json() as Promise<{ available: boolean; provider?: string; model?: string }>)
      .then((r) => {
        setAvailable(r.available)
        setModel({ provider: r.provider, model: r.model })
      })
      .catch(() => setAvailable(false))
  }, [])

  const emit = (item: TranscriptItem) => setItems((prev) => [...prev, item])

  /** Runs one piece of work with Stop support and error reporting. */
  const guarded = async (work: (signal: AbortSignal) => Promise<void>) => {
    const controller = new AbortController()
    abort.current = controller
    setRunning(true)
    try {
      await work(controller.signal)
    } catch (e) {
      const stopped = controller.signal.aborted
      emit({ kind: 'notice', text: stopped ? 'Stopped.' : e instanceof Error ? e.message : String(e), tone: stopped ? 'info' : 'error' })
    } finally {
      setRunning(false)
    }
  }

  /** A NEW conversation, opened with the lesson's trip. */
  const planTrip = () =>
    guarded(async (signal) => {
      setItems([])
      setInfo(undefined)
      setSinceId(logStore.getSnapshot().at(-1)?.id ?? 0) // steps count only what THIS conversation sends
      session.current = undefined
      session.current = await runTrip(clients, trip, emit, setInfo, signal)
    })

  /** The step tracker counts log messages from here on (kept if a conversation already started counting). */
  const startCounting = () => setSinceId((prev) => prev ?? logStore.getSnapshot().at(-1)?.id ?? 0)

  /**
   * Sends one user message, starting a conversation (with the tools) if there is none yet.
   * A /prompt that STARTS a conversation also gets the host's context resources (lesson step 2).
   */
  const sendText = (input: Parameters<typeof sendMessage>[1], from?: string, withContext = false) =>
    guarded(async (signal) => {
      let context: string | undefined
      if (!session.current) {
        startCounting()
        if (withContext) context = await readContext(clients, emit)
        session.current = await startSession(clients)
        setInfo(availability(clients, session.current))
      }
      await sendMessage(session.current, input, emit, signal, from, context)
    })

  /** Chatbot: send what you typed. "/name" opens that prompt's form instead. */
  const send = () => {
    const text = draft.trim()
    if (!text) return
    if (text.startsWith('/')) {
      // Enter picks the exact prompt, or else the first suggestion in the menu.
      const typed = text.slice(1).split(/\s/)[0].toLowerCase()
      const match =
        slashPrompts.find((p) => p.prompt.name.toLowerCase() === typed) ??
        slashPrompts.find((p) => p.prompt.name.toLowerCase().startsWith(typed))
      if (match) {
        if (!session.current) startCounting() // so the tracker sees this prompt's prompts/get
        setPicked(match)
        setDraft(`/${match.prompt.name}`)
      }
      return
    }
    setDraft('')
    return sendText(text)
  }

  /** A /prompt was filled in: its prompts/get messages go into the chat as the user's turn. */
  const runPrompt = (messages: Parameters<typeof sendMessage>[1], from: string) => {
    setPicked(undefined)
    setDraft('')
    void sendText(messages, from, true)
  }

  const reset = () => {
    session.current = undefined
    setItems([])
    setInfo(undefined)
    setSinceId(undefined)
  }

  if (available === false) {
    return (
      <p className="text-sm text-muted-foreground">
        Chat is off: the server has no model credentials. Add <span className="font-mono">MIMO_API_KEY</span> (Xiaomi MiMo) or{' '}
        <span className="font-mono">ANTHROPIC_API_KEY</span> to <span className="font-mono">.env</span> (see{' '}
        <span className="font-mono">.env.example</span>) and restart <span className="font-mono">pnpm dev</span>. Everything else on
        this page works without it.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1.5 min-h-0 flex-1">
      {/* One compact toolbar, so the conversation gets the space. */}
      <div className="flex items-center gap-1 flex-wrap text-xs">
        <button
          onClick={() => void planTrip()}
          disabled={running || available === undefined || !ready}
          className="px-2 py-1 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
        >
          {running ? 'Running…' : ready ? 'Plan the trip' : 'Waiting…'}
        </button>
        <button onClick={() => abort.current?.abort()} disabled={!running} className="px-2 py-1 rounded-md border border-border disabled:opacity-50">
          Stop
        </button>
        <button onClick={reset} disabled={running} className="px-2 py-1 rounded-md border border-border disabled:opacity-50">
          New chat
        </button>
        {/* The lesson's trip values, as a small pop-up. */}
        <details className="relative">
          <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer px-2 py-1 rounded-md border border-border hover:bg-accent/60">
            Trip ▾
          </summary>
          <div className="absolute right-0 z-20 mt-1 w-72 rounded-lg border border-border bg-background p-2 shadow-lg grid grid-cols-2 gap-1.5">
            {(Object.keys(trip) as (keyof TripInput)[]).map((key) => (
              <label key={key} className="space-y-0.5">
                <span className="font-mono text-[10px] text-muted-foreground">{key}</span>
                <input
                  value={trip[key]}
                  onChange={(e) => setTrip((prev) => ({ ...prev, [key]: e.target.value }))}
                  disabled={running}
                  className="w-full rounded-md border border-border bg-background px-1.5 py-0.5"
                />
              </label>
            ))}
          </div>
        </details>
      </div>

      <StepTracker info={info} sinceId={sinceId} />

      {/* The conversation scrolls on its own and follows the newest message. */}
      <ol ref={transcriptRef} className="space-y-2 overflow-y-auto min-h-0 flex-1 pr-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm">
            <TranscriptLine item={item} />
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-xs text-muted-foreground">
            Try: “What tools do you have?”, “Check the weather in Lisbon”, or type <span className="font-mono">/</span> to use a
            server prompt such as <span className="font-mono">/plan-vacation</span> — or press Plan the trip.
          </li>
        )}
      </ol>

      {picked && (
        <SlashPromptForm
          key={`${picked.server}/${picked.prompt.name}`}
          picked={picked}
          disabled={running}
          onRun={runPrompt}
          onCancel={() => {
            setPicked(undefined)
            setDraft('')
          }}
        />
      )}
      {showSlashMenu && (
        <SlashMenu
          prompts={slashPrompts}
          typed={draft}
          onPick={(p) => {
            if (!session.current) startCounting() // so the tracker sees this prompt's prompts/get
            setPicked(p)
            setDraft(`/${p.prompt.name}`)
          }}
        />
      )}

      {/* The chatbot box: every message continues the same conversation. Type "/" for the servers' prompts.
          Hidden while a prompt's form is open — that form has its own button. */}
      {!picked && (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void send()
        }}
        className="flex gap-2 pt-1 border-t border-border"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={ready ? 'Message… or type / for prompts' : 'Waiting for the servers…'}
          disabled={running || !ready || available === undefined}
          className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={running || !ready || !draft.trim()}
          className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
        >
          Send
        </button>
      </form>
      )}
      {model.model && (
        <p className="text-[10px] text-muted-foreground">
          <span className="font-mono">{model.model}</span> via {model.provider} — it asks for tools, our host runs them.
        </p>
      )}
    </div>
  )
}

function TranscriptLine({ item }: { item: TranscriptItem }) {
  const badge = 'px-2 py-0.5 rounded-full text-[10px] font-medium mr-2'
  switch (item.kind) {
    case 'user':
      return (
        <div className="ml-6 rounded-lg bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/50 p-2">
          {item.from && <p className="text-[10px] text-muted-foreground mb-0.5">from {item.from}</p>}
          <p>{item.text}</p>
        </div>
      )
    case 'context':
      return (
        <details className="rounded-lg border border-border p-2 text-xs">
          <summary className="cursor-pointer">
            <span className={`${badge} bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200`}>context</span>
            the host included: {item.sources.join(', ')}
          </summary>
          <pre className="mt-2 whitespace-pre-wrap">{item.text}</pre>
        </details>
      )
    case 'assistant':
      return (
        <div className="rounded-lg border border-border p-2">
          <span className={`${badge} bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200`}>assistant</span>
          <div className="mt-1">
            <Markdown text={item.text} />
          </div>
        </div>
      )
    case 'tool_call':
      return (
        <details className="text-xs">
          <summary className="cursor-pointer font-mono">→ the model asks for {item.name}</summary>
          <JsonView value={item.input} />
        </details>
      )
    case 'tool_result':
      return (
        <details className={`text-xs ${item.isError ? 'text-red-600 dark:text-red-400' : ''}`}>
          <summary className="cursor-pointer font-mono">
            ← our host ran {item.name}
            {item.isError ? ' (is_error)' : ''}
          </summary>
          <pre className="whitespace-pre-wrap">{item.text}</pre>
        </details>
      )
    case 'notice':
      // Errors stay readable; info lines (token counts) are faint and tiny.
      return item.tone === 'error' ? (
        <p className="text-xs text-red-600 dark:text-red-400">{item.text}</p>
      ) : (
        <p className="text-[10px] text-muted-foreground/70">{item.text}</p>
      )
  }
}
