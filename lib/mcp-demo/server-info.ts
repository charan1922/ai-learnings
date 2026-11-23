export const SERVER_NAMES = ['travel', 'weather', 'calendar'] as const
export type ServerName = (typeof SERVER_NAMES)[number]

export const SERVER_INFO: Record<ServerName, { title: string; version: string; path: string }> = {
  travel: { title: 'Travel Server', version: '1.0.0', path: '/api/mcp/travel' },
  weather: { title: 'Weather Server', version: '1.0.0', path: '/api/mcp/weather' },
  calendar: { title: 'Calendar/Email Server', version: '1.0.0', path: '/api/mcp/calendar' },
}

export function isServerName(value: string): value is ServerName {
  return (SERVER_NAMES as readonly string[]).includes(value)
}
