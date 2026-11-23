import { runAdminAction } from '@/lib/mcp-demo/admin'
import { guardLocalhost } from '@/lib/mcp-demo/serve'

const BAD_BODY = { error: 'Body must be JSON: { feature, action }' }

/**
 * POST /api/mcp-demo/admin   body: { "feature": "calendar", "action": "add-meeting" }
 * → runs that feature's demo action (the page's "change something on the server" buttons).
 */
export async function POST(request: Request): Promise<Response> {
  const rejected = guardLocalhost(request)
  if (rejected) return rejected

  let payload: { feature?: unknown; action?: unknown }
  try {
    payload = await request.json()
  } catch {
    return Response.json(BAD_BODY, { status: 400 })
  }
  if (typeof payload?.feature !== 'string' || typeof payload?.action !== 'string') {
    return Response.json(BAD_BODY, { status: 400 })
  }

  const result = await runAdminAction(payload.feature, payload.action)
  return result.ok ? Response.json({ ok: true }) : Response.json({ error: result.error }, { status: result.status })
}
