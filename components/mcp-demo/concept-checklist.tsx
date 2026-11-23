'use client'

import { useMemo } from 'react'

import { CONCEPTS, detectedConceptIds, type Lesson } from '@/lib/mcp-demo/concepts'

import { useLogEntries } from './use-host'

const LESSONS: { id: Lesson; title: string }[] = [
  { id: 'server', title: 'MCP Server lesson' },
  { id: 'client', title: 'MCP Client lesson' },
  { id: 'architecture', title: 'MCP Architecture lesson' },
]

/** ✔ = seen in the log, ○ = auto-detected later, ◇ = check by hand. */
export function ConceptChecklist() {
  const entries = useLogEntries()
  const detected = useMemo(() => detectedConceptIds(entries), [entries])

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Concept checklist</h2>
      <p className="text-xs text-muted-foreground">Concepts tick automatically as their messages appear in the protocol log.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {LESSONS.map((lesson) => (
          <div key={lesson.id} className="rounded-lg border border-border p-3">
            <p className="text-sm font-semibold mb-2">{lesson.title}</p>
            <ul className="space-y-1">
              {CONCEPTS.filter((c) => c.lesson === lesson.id).map((c) => {
                const done = detected.has(c.id)
                return (
                  <li key={c.id} className="text-xs flex gap-2">
                    <span className={done ? 'text-emerald-600' : 'text-muted-foreground'}>{done ? '✔' : c.detect ? '○' : '◇'}</span>
                    <span className={done ? '' : 'text-muted-foreground'}>
                      {c.label}
                      {!done && (
                        <span className="ml-1 opacity-70">({c.detect ? `Spec ${c.spec}` : `check by hand · Spec ${c.spec}`})</span>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
