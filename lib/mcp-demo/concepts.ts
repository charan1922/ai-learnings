import type { LogEntry } from './log-store'
import { isServerName } from './server-info'

export type Lesson = 'server' | 'client' | 'architecture'

/** One idea from the three MCP lessons, ticked when its message shows up in the protocol log. */
export interface Concept {
  id: string
  label: string
  lesson: Lesson
  /** The spec that demonstrates it (shown while it's not ticked yet). */
  spec: number
  /** Auto-detection from the browser protocol log. Missing → checked by hand. */
  detect?: (entries: readonly LogEntry[]) => boolean
}

type Json = Record<string, unknown>
const asObject = (value: unknown): Json | undefined => (value && typeof value === 'object' ? (value as Json) : undefined)
const methodOf = (e: LogEntry) => {
  const m = asObject(e.json)?.method
  return typeof m === 'string' ? m : undefined
}
const resultOf = (e: LogEntry) => asObject(asObject(e.json)?.result)
const paramsOf = (e: LogEntry) => asObject(asObject(e.json)?.params)

/** "Did the host SEND this method?" / "Did the host RECEIVE this method?" */
const sent = (method: string) => (entries: readonly LogEntry[]) =>
  entries.some((e) => e.direction === 'out' && methodOf(e) === method)
const received = (method: string) => (entries: readonly LogEntry[]) =>
  entries.some((e) => e.direction === 'in' && methodOf(e) === method)
const textMatches = (direction: 'out' | 'in', pattern: RegExp) => (entries: readonly LogEntry[]) =>
  entries.some((e) => e.direction === direction && pattern.test(JSON.stringify(e.json)))

export const CONCEPTS: Concept[] = [
  // MCP Server lesson
  { id: 'tools-list', label: 'tools/list — inputSchema & outputSchema', lesson: 'server', spec: 1, detect: sent('tools/list') },
  {
    id: 'tools-call',
    label: 'tools/call — structuredContent + content',
    lesson: 'server',
    spec: 1,
    detect: (entries) => entries.some((e) => e.direction === 'in' && resultOf(e)?.structuredContent !== undefined),
  },
  {
    id: 'protocol-fields',
    label: 'Protocol fields — id, _meta, resultType',
    lesson: 'server',
    spec: 1,
    detect: (entries) =>
      entries.some((e) => e.direction === 'out' && paramsOf(e)?._meta !== undefined) &&
      entries.some((e) => e.direction === 'in' && resultOf(e)?.resultType !== undefined),
  },
  { id: 'resources-list', label: 'resources/list', lesson: 'server', spec: 2, detect: sent('resources/list') },
  { id: 'resources-read', label: 'resources/read', lesson: 'server', spec: 2, detect: sent('resources/read') },
  { id: 'templates', label: 'resources/templates/list — fill a template', lesson: 'server', spec: 2, detect: sent('resources/templates/list') },
  { id: 'prompts-list', label: 'prompts/list — the empty form', lesson: 'server', spec: 2, detect: sent('prompts/list') },
  { id: 'prompts-get', label: 'prompts/get — user message', lesson: 'server', spec: 2, detect: sent('prompts/get') },
  { id: 'completion', label: 'completion/complete — "Bar" → Barcelona', lesson: 'server', spec: 2, detect: sent('completion/complete') },
  {
    id: 'resource-updated',
    label: 'notifications/resources/updated → re-read',
    lesson: 'server',
    spec: 2,
    detect: received('notifications/resources/updated'),
  },
  { id: 'barcelona-trip', label: 'The 5-step Barcelona trip', lesson: 'server', spec: 8 },

  // MCP Client lesson
  {
    id: 'host-clients',
    label: 'One host, one client per server',
    lesson: 'client',
    spec: 1,
    detect: (entries) => new Set(entries.map((e) => e.server)).size >= 3,
  },
  {
    id: 'elicitation-capability',
    label: 'Elicitation capability {} vs {form, url}',
    lesson: 'client',
    spec: 4,
    detect: textMatches('out', /"elicitation"/),
  },
  {
    id: 'mrtr',
    label: 'MRTR — input_required → inputResponses + requestState',
    lesson: 'client',
    spec: 4,
    detect: (entries) =>
      entries.some((e) => e.direction === 'in' && resultOf(e)?.resultType === 'input_required') &&
      entries.some((e) => e.direction === 'out' && paramsOf(e)?.inputResponses !== undefined),
  },
  {
    id: 'elicitation-actions',
    label: 'accept / decline / cancel',
    lesson: 'client',
    spec: 4,
    detect: textMatches('out', /"action":"(decline|cancel)"/),
  },
  { id: 'url-mode', label: 'URL mode — airline sign-in', lesson: 'client', spec: 4, detect: textMatches('in', /"mode":"url"/) },
  { id: 'closing-app', label: 'Closing the app before / after confirming', lesson: 'client', spec: 4 },
  { id: 'roots-sampling', label: 'Roots & sampling (deprecated)', lesson: 'client', spec: 4 },

  // MCP Architecture lesson
  {
    id: 'data-vs-transport',
    label: 'Same message over stdio and HTTP',
    lesson: 'architecture',
    spec: 6,
    detect: (entries) => entries.some((e) => e.transport === 'stdio'),
  },
  { id: 'server-discover', label: 'server/discover', lesson: 'architecture', spec: 5, detect: sent('server/discover') },
  { id: 'stateless-request', label: 'Stateless request without discover (Raw JSON-RPC)', lesson: 'architecture', spec: 5 },
  { id: 'subscriptions-listen', label: 'subscriptions/listen', lesson: 'architecture', spec: 5, detect: sent('subscriptions/listen') },
  {
    id: 'tools-list-changed',
    label: 'notifications/tools/list_changed → tools/list',
    lesson: 'architecture',
    spec: 5,
    detect: received('notifications/tools/list_changed'),
  },
  { id: 'missed-update', label: 'Missed update → reconnect → tools/list', lesson: 'architecture', spec: 5 },
  {
    id: 'remote-http',
    label: 'Remote Streamable HTTP server',
    lesson: 'architecture',
    spec: 7,
    detect: (entries) => entries.some((e) => !isServerName(e.server)),
  },
  { id: 'legacy-era', label: 'Legacy era — initialize fallback', lesson: 'architecture', spec: 7, detect: sent('initialize') },
  { id: 'other-hosts', label: 'Same servers, a different host (Agent SDK)', lesson: 'architecture', spec: 9 },
]

/** The ids of every concept whose message appears in the log. */
export function detectedConceptIds(entries: readonly LogEntry[]): Set<string> {
  return new Set(CONCEPTS.filter((c) => c.detect?.(entries)).map((c) => c.id))
}
