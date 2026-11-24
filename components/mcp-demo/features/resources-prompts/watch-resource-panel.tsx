'use client'

import type { McpSubscription } from '@modelcontextprotocol/client'
import { useCallback, useEffect, useState } from 'react'

import type { PanelProps } from '../types'
import { errorText } from './shared'

/** The resource we watch (lesson: "your June availability"). Same URI as the server feature. */
const WATCH_URI = 'calendar://events/2027-06'

type Meeting = { date: string; title: string }
type JuneCalendar = { month: string; free: { from: string; to: string }; meetings: Meeting[] }
type FeedItem = { id: number; time: string; text: string }

let feedId = 0

/**
 * Lesson "Watch a resource for changes":
 * subscriptions/listen with resourceSubscriptions → add a meeting → notifications/resources/updated → resources/read.
 */
export function WatchResourcePanel({ clients }: PanelProps) {
  const calendar = clients.find((c) => c.target.id === 'calendar' && c.status === 'connected')?.client
  const [watching, setWatching] = useState(false)
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [data, setData] = useState<JuneCalendar>()
  const [newTitles, setNewTitles] = useState<string[]>([])
  const [error, setError] = useState<string>()

  const say = useCallback((text: string) => {
    setFeed((prev) => [{ id: ++feedId, time: new Date().toLocaleTimeString(), text }, ...prev].slice(0, 20))
  }, [])

  useEffect(() => {
    if (!watching || !calendar) return
    let closed = false
    let subscription: McpSubscription | undefined
    let known: Meeting[] | undefined

    /** resources/read, then highlight meetings we haven't seen before. */
    const read = async (): Promise<Meeting[]> => {
      const result = await calendar.readResource({ uri: WATCH_URI })
      const first = result.contents[0]
      const next = JSON.parse(first && 'text' in first ? first.text : '{}') as JuneCalendar
      const fresh = known ? next.meetings.filter((m) => !known?.some((k) => k.title === m.title)) : []
      known = next.meetings
      if (!closed) {
        setData(next)
        setNewTitles(fresh.map((m) => m.title))
      }
      return fresh
    }

    // The server pushes this on our open listen stream when the watched resource changes.
    calendar.setNotificationHandler('notifications/resources/updated', async (notification) => {
      if (closed || notification.params.uri !== WATCH_URI) return
      say(`← notifications/resources/updated (${notification.params.uri})`)
      try {
        const fresh = await read()
        say(`→ resources/read — ${fresh.length ? `new: ${fresh.map((m) => m.title).join(', ')}` : 'no new meetings'}`)
      } catch (e) {
        setError(errorText(e))
      }
    })

    void (async () => {
      try {
        await read()
        say('→ resources/read (first read)')
        subscription = await calendar.listen({ resourceSubscriptions: [WATCH_URI] })
        if (closed) return void subscription.close()
        say(`→ subscriptions/listen — the stream stays open, watching ${WATCH_URI}`)
      } catch (e) {
        setError(errorText(e))
        setWatching(false)
      }
    })()

    return () => {
      closed = true
      void subscription?.close()
      calendar.removeNotificationHandler('notifications/resources/updated')
    }
  }, [watching, calendar, say])

  const toggle = () => {
    setError(undefined)
    if (watching) say('Stopped watching (stream closed)')
    setWatching(!watching)
  }

  const addMeeting = async () => {
    setError(undefined)
    say('Asking the server to add a meeting to June (admin action)…')
    const res = await fetch('/api/mcp-demo/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ server: 'calendar', action: 'add-meeting' }),
    })
    if (!res.ok) return setError(`Add meeting failed: HTTP ${res.status}`)
    // When watching, the notification line above tells the story. When not, nothing will arrive.
    if (!watching) say('Meeting added — but nobody is watching, so no update arrives')
  }

  if (!calendar) return <p className="text-sm text-muted-foreground">Waiting for the Calendar/Email server…</p>

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Watch <span className="font-mono">{WATCH_URI}</span> with <span className="font-mono">subscriptions/listen</span>
        , then add a meeting on the server and see the update arrive.
      </p>
      <div className="flex gap-2">
        <button
          onClick={toggle}
          className={`text-sm px-3 py-1.5 rounded-md ${watching ? 'border border-border hover:bg-accent/60' : 'bg-primary text-primary-foreground'}`}
        >
          {watching ? 'Stop watching' : 'Start watching'}
        </button>
        <button onClick={() => void addMeeting()} className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-accent/60">
          Add meeting (on the server)
        </button>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400 break-words">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs font-semibold mb-2">What happened</p>
          <ol className="space-y-1 text-xs font-mono">
            {feed.map((f) => (
              <li key={f.id}>
                <span className="text-muted-foreground">{f.time}</span> {f.text}
              </li>
            ))}
            {feed.length === 0 && <li className="text-muted-foreground">Nothing yet.</li>}
          </ol>
        </div>
        <div className="rounded-lg border border-border p-3 text-xs space-y-1">
          <p className="font-semibold">June 2027</p>
          {data ? (
            <>
              <p>
                Free: {data.free.from} → {data.free.to}
              </p>
              <p className="text-muted-foreground">Meetings:</p>
              <ul className="space-y-0.5">
                {data.meetings.map((m) => (
                  <li key={m.title} className={newTitles.includes(m.title) ? 'bg-amber-500/25 rounded px-1' : 'px-1'}>
                    {m.date} — {m.title}
                    {newTitles.includes(m.title) && ' (new)'}
                  </li>
                ))}
                {data.meetings.length === 0 && <li className="text-muted-foreground px-1">none</li>}
              </ul>
            </>
          ) : (
            <p className="text-muted-foreground">Start watching to read the calendar.</p>
          )}
        </div>
      </div>
    </div>
  )
}
