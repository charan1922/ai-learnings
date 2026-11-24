import { notifier } from './handlers'
import { isServerName } from './server-info'
import { SERVERS } from './servers'

export type AdminResult = { ok: true } | { ok: false; status: 404; error: string }

/**
 * Runs one server's demo action, e.g. runAdminAction('calendar', 'add-meeting').
 * Each server declares its actions in `adminActions` (servers/<name>/index.ts).
 */
export async function runAdminAction(server: string, action: string): Promise<AdminResult> {
  const run = isServerName(server) ? SERVERS[server].adminActions?.[action] : undefined
  if (!run) return { ok: false, status: 404, error: `Unknown admin action: ${server}/${action}` }

  await run({ notify: notifier })
  return { ok: true }
}
