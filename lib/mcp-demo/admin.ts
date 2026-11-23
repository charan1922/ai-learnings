import { serverFeatures } from './features/server-registry'
import type { ServerFeature } from './features/types'
import { notifier } from './handlers'

export type AdminResult = { ok: true } | { ok: false; status: 404; error: string }

/**
 * Runs a feature's demo action, e.g. runAdminAction('calendar', 'add-meeting').
 * Features declare their actions in `adminActions` of their ServerFeature.
 */
export async function runAdminAction(
  featureId: string,
  action: string,
  features: ServerFeature[] = serverFeatures,
): Promise<AdminResult> {
  const run = features.find((f) => f.id === featureId)?.adminActions?.[action]
  if (!run) return { ok: false, status: 404, error: `Unknown admin action: ${featureId}/${action}` }

  await run({ notify: notifier })
  return { ok: true }
}
