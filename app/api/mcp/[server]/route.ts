import { serveMcp } from '@/lib/mcp-demo/serve'

/** /api/mcp/travel → server = "travel". All the real work happens in serveMcp. */
async function handle(request: Request, ctx: RouteContext<'/api/mcp/[server]'>): Promise<Response> {
  const { server } = await ctx.params
  return serveMcp(server, request)
}

// MCP over Streamable HTTP uses POST (messages) and GET/DELETE (streams, sessions).
export const GET = handle
export const POST = handle
export const DELETE = handle
