import type { Client } from '@modelcontextprotocol/client'

import { JsonView } from '../../json-view'

export type ReadResult = Awaited<ReturnType<Client['readResource']>>

export const errorText = (e: unknown): string => (e instanceof Error ? e.message : String(e))

/** Shown when a server's capabilities don't include what this tab needs (e.g. no "resources"). */
export function NotSupported({ capability }: { capability: string }) {
  return (
    <p className="text-sm text-muted-foreground">
      This server&apos;s capabilities have no <code className="font-mono">{capability}</code>, so there is nothing to
      ask for here. Try another server.
    </p>
  )
}

/** The `contents` of a resources/read result, with JSON text shown as JSON. */
export function ResourceContents({ result }: { result: ReadResult }) {
  return (
    <div className="space-y-2">
      {result.contents.map((c) => (
        <div key={c.uri} className="space-y-1">
          <p className="text-xs text-muted-foreground font-mono">
            {c.uri} · {c.mimeType ?? 'no mimeType'}
          </p>
          <JsonView value={'text' in c ? parseIfJson(c.text, c.mimeType) : `(binary, ${c.blob.length} base64 chars)`} />
        </div>
      ))}
    </div>
  )
}

function parseIfJson(text: string, mimeType: string | undefined): unknown {
  if (mimeType !== 'application/json') return text
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
