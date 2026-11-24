'use client'

import { useMemo } from 'react'

import type { LogEntry } from '@/lib/mcp-demo/log-store'

import { useLogEntries } from '../../use-host'
import type { RunInfo } from './chat-loop'

type Json = { method?: string; params?: { name?: string } }

/** The five steps of the lesson's Barcelona trip, and the MCP message that proves each one happened. */
const STEPS: { title: string; short: string; spec: number; tools?: string[]; method?: string; available: (info: RunInfo) => boolean }[] = [
  { title: 'Get the prompt', short: 'Prompt', spec: 2, method: 'prompts/get', available: (i) => i.hasPrompt },
  { title: 'Read the context', short: 'Context', spec: 2, method: 'resources/read', available: (i) => i.hasContext },
  {
    title: 'Search',
    short: 'Search',
    spec: 1,
    tools: ['searchFlights', 'searchHotels', 'checkWeather'],
    available: (i) => i.toolNames.some((t) => ['searchFlights', 'searchHotels', 'checkWeather'].includes(t)),
  },
  { title: 'Confirm and book', short: 'Book', spec: 4, tools: ['bookVacation'], available: (i) => i.toolNames.includes('bookVacation') },
  {
    title: 'Follow up',
    short: 'Follow up',
    spec: 3,
    tools: ['createCalendarEvent', 'sendEmail'],
    available: (i) => i.toolNames.some((t) => ['createCalendarEvent', 'sendEmail'].includes(t)),
  },
]

/** Did this run (log entries after `sinceId`) send the message for this step? */
function seen(entries: readonly LogEntry[], sinceId: number, step: (typeof STEPS)[number]): boolean {
  return entries.some((e) => {
    if (e.id <= sinceId || e.direction !== 'out') return false
    const json = (e.json ?? {}) as Json
    if (step.method) return json.method === step.method
    return json.method === 'tools/call' && !!json.params?.name && !!step.tools?.includes(json.params.name)
  })
}

/** Lights up the lesson's five steps from the protocol log as the chat run goes. */
export function StepTracker({ info, sinceId }: { info?: RunInfo; sinceId?: number }) {
  const entries = useLogEntries()
  const done = useMemo(
    () => (sinceId === undefined ? STEPS.map(() => false) : STEPS.map((s) => seen(entries, sinceId, s))),
    [entries, sinceId],
  )

  // Compact: five tiny chips on one line; the full name and any "not available" reason are in the tooltip.
  return (
    <ol className="flex flex-wrap gap-1 text-[10px]" aria-label="The lesson's five trip steps">
      {STEPS.map((step, i) => {
        const missing = info && !step.available(info)
        const style = done[i]
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 border-emerald-300'
          : missing
            ? 'text-muted-foreground/60 border-dashed line-through'
            : 'text-muted-foreground border-border'
        const tip = `${i + 1}. ${step.title}${done[i] ? ' — done' : missing ? ` — not available (build Spec ${step.spec})` : ''}`
        return (
          <li key={step.title} title={tip} className={`rounded-full border px-2 py-0.5 ${style}`}>
            {done[i] ? '✔' : i + 1} {step.short}
          </li>
        )
      })}
    </ol>
  )
}
