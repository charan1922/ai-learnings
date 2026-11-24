import type { McpServer } from '@modelcontextprotocol/server'
import * as z from 'zod/v4'

import { jsonContents, toolError } from '../shared'

/**
 * Email: `sendEmail` (simulated — it only lands in an outbox) + `email://outbox`, a read-only view of it.
 */

export const OUTBOX_URI = 'email://outbox'

interface Email {
  id: number
  to: string
  subject: string
  body: string
  sentAt: string
}

// On globalThis: every MCP request builds a fresh server, so the outbox must live outside it.
const g = globalThis as typeof globalThis & { __mcpDemoOutbox?: { outbox: Email[]; nextId: number } }
const store = (g.__mcpDemoOutbox ??= { outbox: [], nextId: 1 })

export function registerEmail(server: McpServer): void {
  server.registerTool(
    'sendEmail',
    {
      title: 'Send email',
      description: 'Send an email (simulated: it goes to an outbox, nothing is really sent)',
      inputSchema: z.object({
        to: z.string().describe('Recipient, e.g. me@example.com'),
        subject: z.string(),
        body: z.string(),
      }),
      outputSchema: z.object({ id: z.number(), to: z.string(), subject: z.string(), sentAt: z.string() }),
    },
    async ({ to, subject, body }) => {
      if (!to.includes('@')) return toolError(`"${to}" is not an email address.`)

      const email = { id: store.nextId++, to, subject, body, sentAt: new Date().toISOString() }
      store.outbox.push(email)
      return {
        content: [{ type: 'text', text: `Email #${email.id} to ${to} placed in the outbox (simulated).` }],
        structuredContent: { id: email.id, to, subject, sentAt: email.sentAt },
      }
    },
  )

  server.registerResource(
    'outbox',
    OUTBOX_URI,
    { title: 'Email outbox', description: 'Emails "sent" with sendEmail (simulated)', mimeType: 'application/json' },
    (uri) => jsonContents(uri, store.outbox),
  )
}
