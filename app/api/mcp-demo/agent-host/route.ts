import { mkdirSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { query, type ElicitationRequest } from '@anthropic-ai/claude-agent-sdk'

import { agentEnv, llmProvider } from '@/lib/mcp-demo/llm-provider'
import { guardLocalhost } from '@/lib/mcp-demo/serve'
import { readServerLog } from '@/lib/mcp-demo/server-log'
import { SERVER_INFO, SERVER_NAMES } from '@/lib/mcp-demo/server-info'

const MAX_TURNS = 10
const MAX_BUDGET_USD = 1

/** The ONLY servers the agent gets: our three local endpoints. The browser can't change this list. */
function ourServers(origin: string) {
  return Object.fromEntries(SERVER_NAMES.map((name) => [name, { type: 'http' as const, url: `${origin}${SERVER_INFO[name].path}` }]))
}

/**
 * An isolated folder for the agent's Claude Code process: no user/project settings, no CLAUDE.md,
 * no personal login or claude.ai connectors from ~/.claude — only ANTHROPIC_API_KEY from our .env.
 */
function sandboxDir(): string {
  const dir = path.join(os.tmpdir(), 'ai-learnings-agent-sdk')
  mkdirSync(dir, { recursive: true })
  return dir
}

const NO_KEY =
  'The Agent SDK host needs model credentials on the server: set MIMO_API_KEY (Xiaomi MiMo) or ANTHROPIC_API_KEY in .env (see .env.example), then restart pnpm dev.'

/** GET → { available, provider, model } so the panel can show it up front. */
export async function GET(request: Request): Promise<Response> {
  const rejected = guardLocalhost(request)
  if (rejected) return rejected
  const provider = llmProvider()
  return Response.json({ available: provider !== undefined, provider: provider?.label, model: provider?.model })
}

/**
 * POST /api/mcp-demo/agent-host  { prompt } → NDJSON stream of the agent's events.
 * A second, independent MCP host (Claude Code as a library) uses OUR servers. Its MCP traffic never
 * touches the browser — the panel sees it in the server-side request log.
 */
export async function POST(request: Request): Promise<Response> {
  const rejected = guardLocalhost(request)
  if (rejected) return rejected

  // Never fall back to a personal Claude login: without a provider key, the agent does not run.
  const provider = llmProvider()
  if (!provider) return Response.json({ error: NO_KEY }, { status: 503 })

  let prompt: string
  try {
    const body = (await request.json()) as { prompt?: unknown }
    prompt = typeof body?.prompt === 'string' ? body.prompt.slice(0, 2000) : ''
  } catch {
    prompt = ''
  }
  if (!prompt.trim()) return Response.json({ error: 'Body must be JSON: { prompt }' }, { status: 400 })

  const origin = new URL(request.url).origin
  const abortController = new AbortController()
  request.signal.addEventListener('abort', () => abortController.abort()) // Stop in the browser → stop the agent
  const sinceLogId = readServerLog().at(-1)?.id ?? 0
  const sandbox = sandboxDir()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder()
      const send = (event: Record<string, unknown>) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
      send({ type: 'start', sinceLogId, model: provider.model, provider: provider.label })

      try {
        const run = query({
          prompt,
          options: {
            model: provider.model,
            mcpServers: ourServers(origin),
            // Built-in tools OFF (shell, files, web…). Only our MCP tools are available and auto-approved.
            tools: [],
            allowedTools: SERVER_NAMES.map((name) => `mcp__${name}__*`),
            disallowedTools: ['Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep', 'WebFetch', 'WebSearch', 'Agent', 'Skill', 'NotebookEdit'],
            permissionMode: 'dontAsk', // anything not allowed is denied, never asked
            settingSources: [], // no user/project settings, no CLAUDE.md
            strictMcpConfig: true, // only the mcpServers above (claude.ai connectors are off via the env below)
            maxTurns: MAX_TURNS,
            maxBudgetUsd: MAX_BUDGET_USD,
            cwd: sandbox,
            env: {
              ...agentEnv(provider), // MiMo: ANTHROPIC_BASE_URL + ANTHROPIC_AUTH_TOKEN + ANTHROPIC_MODEL
              CLAUDE_CONFIG_DIR: sandbox,
              CLAUDE_CODE_DISABLE_AUTO_MEMORY: '1',
              ENABLE_CLAUDEAI_MCP_SERVERS: 'false',
            },
            abortController,
            // Our servers may ask for input (bookVacation). This host has no human dialog, so it records and declines.
            onElicitation: async (req: ElicitationRequest) => {
              send({ type: 'elicitation', server: req.serverName, mode: req.mode ?? 'form', message: req.message, answered: 'decline' })
              return { action: 'decline' }
            },
          },
        })

        for await (const message of run) {
          if (message.type === 'system' && message.subtype === 'init') {
            send({ type: 'init', mcpServers: message.mcp_servers, tools: message.tools })
          } else if (message.type === 'assistant') {
            for (const block of message.message.content) {
              if (block.type === 'text' && block.text.trim()) send({ type: 'text', text: block.text })
              if (block.type === 'tool_use') send({ type: 'tool_call', name: block.name, input: block.input })
            }
          } else if (message.type === 'user' && Array.isArray(message.message.content)) {
            for (const block of message.message.content) {
              if (typeof block === 'object' && block.type === 'tool_result') {
                const content = typeof block.content === 'string' ? block.content : JSON.stringify(block.content)
                send({ type: 'tool_result', content: content.slice(0, 2000), isError: block.is_error === true })
              }
            }
          } else if (message.type === 'result') {
            send({
              type: 'result',
              subtype: message.subtype,
              result: message.subtype === 'success' ? message.result : undefined,
              numTurns: message.num_turns,
              costUsd: message.total_cost_usd,
              usage: message.usage,
            })
          }
        }
      } catch (error) {
        send({ type: 'error', message: abortController.signal.aborted ? 'Stopped.' : error instanceof Error ? error.message : String(error) })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store' } })
}
