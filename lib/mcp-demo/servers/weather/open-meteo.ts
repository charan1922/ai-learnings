/**
 * Real weather from Open-Meteo (free, no API key). Two calls:
 *   1. geocoding: city name → latitude/longitude
 *   2. forecast:  latitude/longitude → daily min/max temperature and rain chance
 * Throws an Error with a readable message on an unknown city or a network problem.
 */

export interface ForecastDay {
  date: string
  min: number
  max: number
  /** Percent, or null when Open-Meteo has no value for that day. */
  rainChance: number | null
}

export interface Forecast {
  city: string
  country: string
  days: ForecastDay[]
}

const TIMEOUT_MS = 8000

async function getJson(url: string): Promise<unknown> {
  let res: Response
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  } catch (error) {
    const reason = error instanceof Error && error.name === 'TimeoutError' ? 'timed out' : 'could not be reached'
    throw new Error(`The weather service ${reason}.`)
  }
  if (!res.ok) throw new Error(`The weather service answered HTTP ${res.status}.`)
  return res.json()
}

type GeocodingResponse = { results?: { name: string; country: string; latitude: number; longitude: number }[] }
type ForecastResponse = {
  daily: {
    time: string[]
    temperature_2m_min: number[]
    temperature_2m_max: number[]
    precipitation_probability_max: (number | null)[]
  }
}

export async function getForecast(city: string): Promise<Forecast> {
  const geo = (await getJson(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`,
  )) as GeocodingResponse
  const place = geo.results?.[0]
  if (!place) throw new Error(`No city called "${city}" was found.`)

  const forecast = (await getJson(
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto',
  )) as ForecastResponse

  const { daily } = forecast
  return {
    city: place.name,
    country: place.country,
    days: daily.time.map((date, i) => ({
      date,
      min: daily.temperature_2m_min[i],
      max: daily.temperature_2m_max[i],
      rainChance: daily.precipitation_probability_max[i] ?? null,
    })),
  }
}
