/**
 * Free public remote MCP servers (re-probed 2026-11-23). Plain data, used by the browser panel AND the proxy route.
 * The proxy forwards ONLY to these URLs (never a free-form URL), so it can't be used to reach anything else (SSRF).
 * Tool names are never hard-coded — the Tools tab asks with tools/list.
 */
export interface RemoteServer {
  id: string
  title: string
  url: string
  /** Does the server send Access-Control-Allow-Origin, so a browser may call it directly? */
  corsOk: boolean
  note: string
}

export const REMOTE_SERVERS: RemoteServer[] = [
  { id: 'deepwiki', title: 'DeepWiki', url: 'https://mcp.deepwiki.com/mcp', corsOk: true, note: 'Ask about a public GitHub repo (modern era)' },
  { id: 'context7', title: 'Context7', url: 'https://mcp.context7.com/mcp', corsOk: true, note: 'Library documentation lookup (modern era)' },
  {
    id: 'cloudflare-docs',
    title: 'Cloudflare Docs',
    url: 'https://docs.mcp.cloudflare.com/mcp',
    corsOk: true,
    note: 'Cloudflare documentation search (modern era)',
  },
  {
    id: 'ms-learn',
    title: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/api/mcp',
    corsOk: true,
    note: 'Legacy era (2025-06-18): server/discover is not understood, so the client falls back to initialize and gets an Mcp-Session-Id',
  },
  {
    id: 'playground',
    title: 'MCP Playground',
    url: 'https://mcpplaygroundonline.com/mcp-complex-server',
    corsOk: false,
    note: 'Sends no Access-Control-Allow-Origin, so the browser blocks a direct call — use the proxy',
  },
]

export const findRemote = (id: string) => REMOTE_SERVERS.find((r) => r.id === id)
