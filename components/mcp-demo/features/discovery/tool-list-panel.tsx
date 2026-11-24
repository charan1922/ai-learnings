'use client'

import type { McpSubscription } from '@modelcontextprotocol/client'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { PanelProps } from '../types'

type FeedItem = { id: number; time: string; text: string }
let feedId = 0

const SUBSCRIPTION_ID_KEY = 'io.modelcontextprotocol/subscriptionId'

/**
 * MCP Architecture lesson: subscriptions/listen → acknowledged → notifications/tools/list_changed
 * → a separate tools/list. Plus the missed-update flow: disconnect, change, reconnect, tools/list, listen again.
 */
export function ToolListPanel({ host, clients }: PanelProps) {
  const travelRow = clients.find((c) => c.target.id === 'travel')
  const travel = travelRow?.status === 'connected' ? travelRow.client : undefined
  const [listening, setListening] = useState(false)
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [tools, setTools] = useState<string[]>([])
  const [newTools, setNewTools] = useState<string[]>([])
  const known = useRef<string[] | undefined>(undefined) // the tool names we saw last time (survives reconnects)

  const say = useCallback((text: string) => {
    setFeed((prev) => [{ id: ++feedId, time: new Date().toLocaleTimeString(), text }, ...prev].slice(0, 25))
  }, [])

  useEffect(() => {
    if (!listening || !travel) return
    let closed = false
    let subscription: McpSubscription | undefined

    /** A normal tools/list request (its own id), then mark what's new since last time. */
    const listTools = async (why: string) => {
      const names = (await travel.listTools()).tools.map((t) => t.name)
      if (closed) return
      const added = known.current ? names.filter((n) => !known.current?.includes(n)) : []
      const removed = known.current ? known.current.filter((n) => !names.includes(n)) : []
      known.current = names
      setTools(names)
      setNewTools(added)
      const change = [added.length && `added ${added.join(', ')}`, removed.length && `removed ${removed.join(', ')}`].filter(Boolean)
      say(`→ tools/list (${why}) — ${names.length} tools${change.length ? `: ${change.join('; ')}` : ''}`)
    }

    travel.setNotificationHandler('notifications/tools/list_changed', async (notification) => {
      if (closed) return
      const meta = (notification.params as { _meta?: Record<string, unknown> } | undefined)?._meta
      say(`← notifications/tools/list_changed (subscriptionId ${String(meta?.[SUBSCRIPTION_ID_KEY] ?? '?')})`)
      await listTools('after the notification')
    })

    void (async () => {
      try {
        await listTools(known.current ? 'after reconnecting' : 'first look')
        subscription = await travel.listen({ toolsListChanged: true })
        if (closed) return void subscription.close()
        say(`← notifications/subscriptions/acknowledged — honored ${JSON.stringify(subscription.honoredFilter)}`)
      } catch (e) {
        say(`error: ${e instanceof Error ? e.message : String(e)}`)
      }
    })()

    return () => {
      closed = true
      void subscription?.close()
      travel.removeNotificationHandler('notifications/tools/list_changed')
    }
  }, [listening, travel, say])

  const admin = async (action: 'enable-search-hotels' | 'disable-search-hotels') => {
    say(`Server: ${action === 'enable-search-hotels' ? 'adding' : 'removing'} searchHotels (admin action)…`)
    const res = await fetch('/api/mcp-demo/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ server: 'travel', action }),
    })
    if (!res.ok) say(`admin action failed: HTTP ${res.status}`)
    else if (!travel) say('…done, but the Travel client is disconnected — this update is MISSED.')
  }

  const disconnect = async () => {
    say('Disconnecting the Travel client (the listen stream closes)…')
    await host.disconnect('travel')
  }
  const reconnect = async () => {
    say('Reconnecting the Travel client — then tools/list, then listen again.')
    await host.reconnect('travel')
  }

  const button = 'text-sm px-3 py-1.5 rounded-md border border-border hover:bg-accent/60 disabled:opacity-50'
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setListening(!listening)}
          className={`text-sm px-3 py-1.5 rounded-md ${listening ? 'border border-border hover:bg-accent/60' : 'bg-primary text-primary-foreground'}`}
        >
          {listening ? 'Stop listening' : 'Listen'}
        </button>
        <button onClick={() => void admin('enable-search-hotels')} className={button}>
          Add searchHotels
        </button>
        <button onClick={() => void admin('disable-search-hotels')} className={button}>
          Remove searchHotels
        </button>
        <button onClick={() => void disconnect()} disabled={!travel} className={button}>
          Disconnect
        </button>
        <button onClick={() => void reconnect()} disabled={travelRow?.status === 'connected'} className={button}>
          Reconnect
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs font-semibold mb-2">What happened</p>
          <ol className="space-y-1 text-xs font-mono">
            {feed.map((f) => (
              <li key={f.id}>
                <span className="text-muted-foreground">{f.time}</span> {f.text}
              </li>
            ))}
            {feed.length === 0 && <li className="text-muted-foreground">Press Listen to start.</li>}
          </ol>
        </div>
        <div className="rounded-lg border border-border p-3 text-xs">
          <p className="font-semibold mb-2">
            Travel tools {travelRow?.status !== 'connected' && <span className="text-muted-foreground">(disconnected)</span>}
          </p>
          <ul className="space-y-0.5 font-mono">
            {tools.map((t) => (
              <li key={t} className={newTools.includes(t) ? 'bg-amber-500/25 rounded px-1' : 'px-1'}>
                {t}
                {newTools.includes(t) && ' (new)'}
              </li>
            ))}
            {tools.length === 0 && <li className="text-muted-foreground px-1">—</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}
