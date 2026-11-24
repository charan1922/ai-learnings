import type Anthropic from '@anthropic-ai/sdk'
import { mcpMessages } from '@anthropic-ai/sdk/helpers/beta/mcp'

import type { HostClient } from '@/lib/mcp-demo/host'
import { isServerName } from '@/lib/mcp-demo/server-info'

type Client = NonNullable<HostClient['client']>

/** The lesson's trip values (MCP Server lesson, prompts/get example). */
export interface TripInput {
  origin: string
  destination: string
  departureDate: string
  returnDate: string
  budget: string
  travelers: string
  interests: string
}

export const LESSON_TRIP: TripInput = {
  origin: 'New York',
  destination: 'Barcelona',
  departureDate: '2027-06-15',
  returnDate: '2027-06-22',
  budget: '3000',
  travelers: '2',
  interests: 'beaches, architecture, food',
}

export type TranscriptItem =
  | { kind: 'user'; text: string; from?: string }
  | { kind: 'context'; text: string; sources: string[] }
  | { kind: 'assistant'; text: string }
  | { kind: 'tool_call'; name: string; input: unknown }
  | { kind: 'tool_result'; name: string; text: string; isError: boolean }
  | { kind: 'notice'; text: string; tone: 'info' | 'error' }

/** What the connected servers OFFER — the step tracker says "not available" only when a piece is really missing. */
export interface RunInfo {
  /** The Travel server has prompts (plan-vacation). */
  hasPrompt: boolean
  /** A server has resources the host can add as context. */
  hasContext: boolean
  toolNames: string[]
}

/** Availability from the servers' capabilities (not from what one conversation happened to use). */
export function availability(clients: readonly HostClient[], session: ChatSession): RunInfo {
  const connected = (id: string) => clients.find((c) => c.target.id === id && c.status === 'connected')
  return {
    hasPrompt: !!connected('travel')?.capabilities?.prompts,
    hasContext: CONTEXT_RESOURCES.some(([server]) => !!connected(server)?.capabilities?.resources),
    toolNames: [...session.owners.values()].map((o) => o.tool),
  }
}

/**
 * Lesson step 2: the HOST decides which resources to give the model as context.
 * Reads whichever of the lesson's resources exist; returns one text block (or '' if none).
 */
export async function readContext(clients: readonly HostClient[], emit: Emit): Promise<string> {
  const parts: string[] = []
  const uris: string[] = []
  for (const [server, uri] of CONTEXT_RESOURCES) {
    const row = clients.find((c) => c.target.id === server && c.status === 'connected')
    if (!row?.client || !row.capabilities?.resources) continue
    const listed = (await row.client.listResources()).resources.some((r) => r.uri === uri)
    if (!listed) continue
    const read = await row.client.readResource({ uri })
    parts.push(`### ${uri}\n${read.contents.map((c) => ('text' in c ? c.text : '[binary]')).join('\n')}`)
    uris.push(uri)
  }
  if (!parts.length) return ''
  const context = `Context the app chose to include:\n\n${parts.join('\n\n')}`
  emit({ kind: 'context', text: context, sources: uris })
  return context
}

/**
 * One conversation. `tools` is built ONCE and never changes; `messages` only grows (append-only) —
 * the model API needs the earlier part of the conversation to stay byte-identical between turns.
 */
export interface ChatSession {
  tools: Anthropic.Beta.BetaTool[]
  owners: Map<string, { client: Client; tool: string }>
  messages: Anthropic.Beta.BetaMessageParam[]
}

type Emit = (item: TranscriptItem) => void

/** Tool rounds per user message, so a confused model can't loop forever. */
const MAX_ROUNDS = 8

/** The resources the HOST chooses to give the model as context (lesson step 2). */
const CONTEXT_RESOURCES: [server: string, uri: string][] = [
  ['calendar', 'calendar://events/2027-06'],
  ['travel', 'travel://preferences'],
  ['travel', 'travel://past-trips'],
]

const contentText = (content: { type: string; text?: string }[]) =>
  content.map((c) => (c.type === 'text' ? c.text : `[${c.type}]`)).join('\n')

type Message = Anthropic.Beta.BetaMessageParam

/** prompts/get messages → model messages, converted by the Claude SDK's MCP helper. */
export const promptMessages = (got: { messages: Parameters<typeof mcpMessages>[0] }): Message[] => mcpMessages(got.messages)

/** The user-side text of some messages, for the transcript. */
const userText = (messages: Message[]) =>
  messages
    .filter((m) => m.role === 'user')
    .map((m) => (typeof m.content === 'string' ? m.content : contentText(m.content as { type: string; text?: string }[])))
    .join('\n\n')

/** Used when the travel server has no plan-vacation prompt (Foundation only). Same wording as the prompt. */
function localInstruction(t: TripInput): string {
  return (
    `Plan a trip for ${t.travelers} from ${t.origin} to ${t.destination}, ${t.departureDate}–${t.returnDate}, ` +
    `with a $${t.budget} budget. Search for flights and hotels, check the weather, and propose one package. Interests: ${t.interests}.`
  )
}

/** Every LOCAL server's MCP tools as model tools, named <server>__<tool>. A fresh, empty conversation. */
export async function startSession(clients: readonly HostClient[]): Promise<ChatSession> {
  const owners = new Map<string, { client: Client; tool: string }>()
  const tools: Anthropic.Beta.BetaTool[] = []
  for (const row of clients) {
    if (row.status !== 'connected' || !row.client || !isServerName(row.target.id) || !row.capabilities?.tools) continue
    for (const tool of (await row.client.listTools()).tools) {
      const name = `${row.target.id}__${tool.name}`.slice(0, 64)
      owners.set(name, { client: row.client, tool: tool.name })
      // The MCP inputSchema IS a JSON Schema — the model takes it as-is (minus the "$schema" dialect marker).
      const { $schema: _dialect, ...inputSchema } = tool.inputSchema as Record<string, unknown>
      tools.push({ name, description: tool.description ?? tool.title ?? tool.name, input_schema: inputSchema as Anthropic.Beta.BetaTool.InputSchema })
    }
  }
  return { tools, owners, messages: [] }
}

/**
 * Sends the conversation to the model and runs the tool loop until it stops asking for tools.
 * The model only ASKS for tools; our host EXECUTES them with its MCP clients,
 * so every MCP message shows up in the protocol log.
 */
export async function runTurn(session: ChatSession, emit: Emit, signal: AbortSignal): Promise<void> {
  const { messages, tools, owners } = session
  for (let round = 1; round <= MAX_ROUNDS; round++) {
    if (signal.aborted) return emit({ kind: 'notice', text: 'Stopped.', tone: 'info' })

    // Call the model (through our route — the key stays on the server).
    const res = await fetch('/api/mcp-demo/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, tools }),
      signal,
    })
    const reply = (await res.json()) as {
      content?: Anthropic.Beta.BetaContentBlock[]
      stop_reason?: string
      stop_details?: { category?: string | null; explanation?: string | null } | null
      usage?: { input_tokens: number; output_tokens: number }
      error?: string
    }
    if (!res.ok || !reply.content) {
      // Drop the user message that failed, so the conversation can carry on cleanly.
      if (messages.at(-1)?.role === 'user' && round === 1) messages.pop()
      return emit({ kind: 'notice', text: reply.error ?? `Chat route failed: HTTP ${res.status}`, tone: 'error' })
    }

    // Keep the FULL content (thinking blocks included) as the assistant turn — never edit it.
    messages.push({ role: 'assistant', content: reply.content })
    for (const block of reply.content) if (block.type === 'text' && block.text.trim()) emit({ kind: 'assistant', text: block.text })
    if (reply.usage) emit({ kind: 'notice', text: `round ${round}: ${reply.usage.input_tokens} in / ${reply.usage.output_tokens} out tokens`, tone: 'info' })

    // Anything but tool_use ends this turn.
    if (reply.stop_reason !== 'tool_use') {
      if (reply.stop_reason === 'refusal') {
        const d = reply.stop_details
        emit({ kind: 'notice', text: `The model declined (${d?.category ?? 'no category'}): ${d?.explanation ?? 'no explanation'}`, tone: 'error' })
      } else if (reply.stop_reason === 'max_tokens') {
        emit({ kind: 'notice', text: 'Stopped: the reply hit max_tokens.', tone: 'error' })
      }
      return
    }

    // Run EVERY tool_use with the owning MCP client; all results go back in ONE user message.
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = []
    for (const block of reply.content) {
      if (block.type !== 'tool_use') continue
      emit({ kind: 'tool_call', name: block.name, input: block.input })
      const owner = owners.get(block.name)
      let text: string
      let isError: boolean
      if (!owner) {
        ;[text, isError] = [`Unknown tool ${block.name}`, true]
      } else {
        try {
          const result = await owner.client.callTool({ name: owner.tool, arguments: block.input as Record<string, unknown> })
          ;[text, isError] = [contentText(result.content), result.isError === true]
        } catch (e) {
          ;[text, isError] = [e instanceof Error ? e.message : String(e), true]
        }
      }
      emit({ kind: 'tool_result', name: block.name, text, isError })
      results.push({ type: 'tool_result', tool_use_id: block.id, content: text, is_error: isError })
    }
    messages.push({ role: 'user', content: results })
  }
  emit({ kind: 'notice', text: `Stopped after ${MAX_ROUNDS} tool rounds for this message.`, tone: 'info' })
}

/**
 * Chatbot: add what the user typed (a string) or a /prompt's messages (from promptMessages) and run one turn.
 * `context` (from readContext) rides along in the last user message.
 */
export async function sendMessage(
  session: ChatSession,
  input: string | Message[],
  emit: Emit,
  signal: AbortSignal,
  from?: string,
  context?: string,
): Promise<void> {
  const turn: Message[] = typeof input === 'string' ? [{ role: 'user', content: [{ type: 'text', text: input }] }] : input
  emit({ kind: 'user', text: userText(turn), from }) // before the context is added — that shows as its own item
  const lastUser = turn.findLast((m) => m.role === 'user')
  if (context && lastUser && Array.isArray(lastUser.content)) lastUser.content.push({ type: 'text', text: context })
  session.messages.push(...turn)
  await runTurn(session, emit, signal)
}

/**
 * The lesson's five-step trip as the FIRST message of a new conversation:
 * prompt (prompts/get) + context (resources/read), then the model takes over with the tools.
 * Returns the session, so the user can keep chatting afterwards ("what about Madrid?").
 */
export async function runTrip(
  clients: readonly HostClient[],
  trip: TripInput,
  emit: Emit,
  onInfo: (info: RunInfo) => void,
  signal: AbortSignal,
): Promise<ChatSession> {
  const connected = (id: string) => clients.find((c) => c.target.id === id && c.status === 'connected')
  const travel = connected('travel')

  // 1. Get the prompt — prompts/get plan-vacation if the server has it (converted by the SDK's MCP helper).
  let first: string | Message[] = localInstruction(trip)
  let from = 'built locally (no plan-vacation prompt on the Travel server)'
  if (travel?.client && travel.capabilities?.prompts) {
    const { prompts } = await travel.client.listPrompts()
    if (prompts.some((p) => p.name === 'plan-vacation')) {
      first = promptMessages(await travel.client.getPrompt({ name: 'plan-vacation', arguments: { ...trip } }))
      from = 'prompts/get plan-vacation (Travel server)'
    }
  }

  // 2. Read the context — whichever of the lesson's resources exist.
  const context = await readContext(clients, emit)

  // 3. Tools, then 4–7: the model + tool loop.
  const session = await startSession(clients)
  onInfo(availability(clients, session))
  await sendMessage(session, first, emit, signal, from, context)
  return session
}
