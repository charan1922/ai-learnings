import Anthropic from '@anthropic-ai/sdk'

import { llmProvider, type LlmProvider } from '@/lib/mcp-demo/llm-provider'
import { guardLocalhost } from '@/lib/mcp-demo/serve'

/** Fixed here on the server, so the browser can't change the instructions. */
const SYSTEM_PROMPT = [
  'You are the travel assistant chatbot inside an MCP demo app. Sometimes the first message comes with context the app chose to include.',
  'Every tool is an MCP tool on one of the user\'s own servers; the name starts with the server: travel__, weather__ or calendar__.',
  'Answer normally and use the tools whenever they help. If asked what you can do, list your tools briefly.',
  'When the user asks you to plan a trip, follow this order, skipping any step whose tool is not in your tool list:',
  '1) search: travel__searchFlights (and travel__searchHotels if present), and weather__checkWeather for the destination;',
  '2) propose ONE package in a few lines;',
  '3) book it with travel__bookVacation — the user confirms in a dialog, so report exactly what the tool result says (it may say nothing was booked);',
  '4) only if the booking succeeded, follow up with calendar__createCalendarEvent and calendar__sendEmail (send to me@example.com).',
  'Keep every message short.',
].join('\n')

const NO_CREDENTIALS =
  'Chat needs model credentials on the server: set MIMO_API_KEY (Xiaomi MiMo) or ANTHROPIC_API_KEY in .env (see .env.example), then restart pnpm dev.'

/** One Messages API call to the chosen provider — both speak the Claude protocol. */
async function callModel(provider: LlmProvider, tools: unknown[], messages: unknown[]) {
  const client = new Anthropic({ baseURL: provider.baseURL, apiKey: provider.apiKey ?? null, authToken: provider.authToken ?? null })

  if (provider.id === 'mimo') {
    // MiMo: plain Messages API. Its docs advise thinking OFF for tool calls (more stable).
    return client.messages
      .stream({
        model: provider.model,
        max_tokens: 16000,
        thinking: { type: 'disabled' },
        system: SYSTEM_PROMPT,
        tools: tools as Anthropic.Tool[],
        messages: messages as Anthropic.MessageParam[],
      })
      .finalMessage()
  }

  // Claude Opus 5.5: always thinks (adaptive) — effort is the dial. tool_choice stays auto (forced choice is a 400).
  // If a safety classifier declines, the API re-runs the request on a recommended fallback model.
  return client.beta.messages
    .stream({
      model: provider.model,
      max_tokens: 16000,
      output_config: { effort: 'medium' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM_PROMPT,
      tools: tools as Anthropic.Beta.BetaTool[],
      messages: messages as Anthropic.Beta.BetaMessageParam[],
    })
    .finalMessage()
}

/** GET /api/mcp-demo/chat → { available, provider, model } — the panel shows this up front. */
export async function GET(request: Request): Promise<Response> {
  const rejected = guardLocalhost(request)
  if (rejected) return rejected
  const provider = llmProvider()
  return Response.json({ available: provider !== undefined, provider: provider?.label, model: provider?.model })
}

/**
 * POST /api/mcp-demo/chat  { messages, tools } → ONE Messages API call.
 * The browser runs the tool loop and the MCP calls; this route only talks to the model (and keeps the key here).
 */
export async function POST(request: Request): Promise<Response> {
  const rejected = guardLocalhost(request)
  if (rejected) return rejected

  let payload: { messages?: unknown; tools?: unknown }
  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: 'Body must be JSON: { messages, tools }' }, { status: 400 })
  }
  if (!Array.isArray(payload?.messages) || !Array.isArray(payload.tools)) {
    return Response.json({ error: 'Body must be JSON: { messages: [...], tools: [...] }' }, { status: 400 })
  }

  const provider = llmProvider()
  if (!provider) return Response.json({ error: NO_CREDENTIALS }, { status: 503 })

  try {
    const response = await callModel(provider, payload.tools, payload.messages)
    return Response.json({
      content: response.content,
      stop_reason: response.stop_reason,
      stop_details: 'stop_details' in response ? response.stop_details : null,
      usage: response.usage,
      model: response.model,
    })
  } catch (error) {
    // Most specific first. Messages only — never the key.
    if (error instanceof Anthropic.AuthenticationError) return Response.json({ error: `${provider.label}: invalid credentials.` }, { status: 401 })
    if (error instanceof Anthropic.RateLimitError) return Response.json({ error: `${provider.label}: rate limited, try again shortly.` }, { status: 429 })
    if (error instanceof Anthropic.APIError) return Response.json({ error: `${provider.label} error: ${error.message}` }, { status: error.status ?? 502 })
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
