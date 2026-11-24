'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import type { LogEntry } from '@/lib/mcp-demo/log-store'

import { useLogEntries } from '../../use-host'
import type { PanelProps } from '../types'

// Same URIs as lib/mcp-demo/servers/calendar/events.ts and email.ts (not imported: those are server code).
const CREATED_EVENTS_URI = 'calendar://created-events'
const OUTBOX_URI = 'email://outbox'

type ForecastDay = { date: string; min: number; max: number; rainChance: number | null }
type Forecast = { city: string; country: string; days: ForecastDay[] }
type CalendarEvent = { id: number; title: string; start: string; end: string }
type Email = { id: number; to: string; subject: string; body: string; sentAt: string }

type Client = NonNullable<PanelProps['clients'][number]['client']>

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e))

async function readJson<T>(client: Client, uri: string): Promise<T> {
  const first = (await client.readResource({ uri })).contents[0]
  return JSON.parse(first && 'text' in first ? first.text : 'null') as T
}

/** How many tools/call requests to this server have got their answer (from any tab). */
function finishedToolCalls(entries: readonly LogEntry[], server: string): number {
  const json = (e: LogEntry) => (e.json ?? {}) as { id?: unknown; method?: unknown }
  const callIds = new Set(
    entries.filter((e) => e.server === server && e.direction === 'out' && json(e).method === 'tools/call').map((e) => json(e).id),
  )
  return entries.filter((e) => e.server === server && e.direction === 'in' && callIds.has(json(e).id)).length
}

/** Spec 3 "Trip services": real weather from the Weather server, and what the Calendar/Email tools created. */
export function TripServicesPanel({ clients }: PanelProps) {
  const weather = clients.find((c) => c.target.id === 'weather' && c.status === 'connected')?.client
  const calendar = clients.find((c) => c.target.id === 'calendar' && c.status === 'connected')?.client

  const [city, setCity] = useState('Barcelona')
  const [forecast, setForecast] = useState<Forecast>()
  const [weatherError, setWeatherError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [outbox, setOutbox] = useState<Email[]>([])
  const [listError, setListError] = useState<string>()

  const checkWeather = async () => {
    if (!weather) return
    setBusy(true)
    setWeatherError(undefined)
    setForecast(undefined)
    try {
      const result = await weather.callTool({ name: 'checkWeather', arguments: { city } })
      // A tool error is a normal result with isError: true — the text explains what went wrong.
      if (result.isError) {
        const first = result.content[0]
        setWeatherError(first?.type === 'text' ? first.text : 'The tool reported an error.')
      } else {
        setForecast(result.structuredContent as Forecast)
      }
    } catch (e) {
      setWeatherError(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  const refresh = useCallback(async () => {
    if (!calendar) return
    try {
      const [ev, ob] = await Promise.all([
        readJson<CalendarEvent[]>(calendar, CREATED_EVENTS_URI),
        readJson<Email[]>(calendar, OUTBOX_URI),
      ])
      setEvents(ev ?? [])
      setOutbox(ob ?? [])
      setListError(undefined)
    } catch (e) {
      setListError(errorText(e))
    }
  }, [calendar])

  // Re-read the lists whenever a Calendar/Email tools/call finishes — including calls made in the Explorer.
  const entries = useLogEntries()
  const finished = useMemo(() => finishedToolCalls(entries, 'calendar'), [entries])
  useEffect(() => {
    void refresh()
  }, [refresh, finished])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-lg border border-border p-3 space-y-3">
        <p className="text-sm font-semibold">Weather server · checkWeather (real data)</p>
        <div className="flex gap-2">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm"
          />
          <button
            onClick={() => void checkWeather()}
            disabled={!weather || busy}
            className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
          >
            {busy ? 'Checking…' : 'checkWeather'}
          </button>
        </div>
        {weatherError && <p className="text-sm text-red-600 dark:text-red-400 break-words">isError: {weatherError}</p>}
        {forecast && (
          <div className="space-y-1">
            <p className="text-xs">
              <strong>
                {forecast.city}, {forecast.country}
              </strong>{' '}
              <span className="text-muted-foreground">— current forecast; the trip (June 2027) is beyond the forecast window.</span>
            </p>
            <table className="w-full text-xs">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="font-medium">date</th>
                  <th className="font-medium">min</th>
                  <th className="font-medium">max</th>
                  <th className="font-medium">rain</th>
                </tr>
              </thead>
              <tbody>
                {forecast.days.map((d) => (
                  <tr key={d.date} className="border-t border-border">
                    <td className="py-0.5 font-mono">{d.date}</td>
                    <td>{d.min}°C</td>
                    <td>{d.max}°C</td>
                    <td>{d.rainChance === null ? '—' : `${d.rainChance}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-border p-3 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Calendar/Email server (simulated)</p>
          <button onClick={() => void refresh()} className="px-2 py-0.5 rounded border border-border hover:bg-accent/60">
            Refresh
          </button>
        </div>
        <p className="text-muted-foreground">
          Call <span className="font-mono">createCalendarEvent</span> or <span className="font-mono">sendEmail</span> in the
          Explorer (Calendar/Email Server → Tools). They show up here.
        </p>
        {listError && <p className="text-red-600 dark:text-red-400 break-words">{listError}</p>}
        <div>
          <p className="font-semibold mb-1">Calendar events ({events.length})</p>
          <ul className="space-y-0.5">
            {events.map((e) => (
              <li key={e.id}>
                #{e.id} {e.title} — <span className="font-mono">{e.start} → {e.end}</span>
              </li>
            ))}
            {events.length === 0 && <li className="text-muted-foreground">none yet</li>}
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-1">Outbox ({outbox.length})</p>
          <ul className="space-y-0.5">
            {outbox.map((m) => (
              <li key={m.id}>
                #{m.id} to <span className="font-mono">{m.to}</span>: {m.subject}
              </li>
            ))}
            {outbox.length === 0 && <li className="text-muted-foreground">none yet</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}
