/**
 * Which model the Claude-protocol features (Chat = Spec 8, Agent SDK host = Spec 9) talk to. Server-only.
 *
 * 1. Xiaomi MiMo — if MIMO_API_KEY is set. MiMo speaks the Claude (Anthropic Messages) protocol,
 *    so the Claude SDKs work by changing only the base URL, the key and the model.
 * 2. Claude itself — if ANTHROPIC_API_KEY (or ANTHROPIC_AUTH_TOKEN) is set.
 * Otherwise the features are off. A personal Claude login is never used.
 */
export interface LlmProvider {
  id: 'mimo' | 'anthropic'
  label: string
  model: string
  /** Set for MiMo; Claude uses the SDK's default endpoint. */
  baseURL?: string
  /** Bearer token (MiMo key). */
  authToken?: string
  /** x-api-key (Claude key). */
  apiKey?: string
}

/** MiMo's Token Plan Singapore cluster, if MIMO_API_URL is left empty. */
const MIMO_DEFAULT_URL = 'https://token-plan-sgp.xiaomimimo.com/anthropic'
const MIMO_DEFAULT_MODEL = 'mimo-v2.6-pro'

/**
 * Reads the standard way: process.env (Next.js loads .env into it).
 * Note: Next.js never lets .env replace a variable that already exists in the OS environment —
 * so an old system-level MIMO_API_KEY would win over .env. Remove such a copy at its source.
 */
export function llmProvider(): LlmProvider | undefined {
  const env = process.env
  if (env.MIMO_API_KEY) {
    return {
      id: 'mimo',
      label: 'Xiaomi MiMo (Claude protocol)',
      model: env.MIMO_API_MODEL || MIMO_DEFAULT_MODEL,
      baseURL: env.MIMO_API_URL || MIMO_DEFAULT_URL,
      authToken: env.MIMO_API_KEY,
    }
  }
  if (env.ANTHROPIC_API_KEY || env.ANTHROPIC_AUTH_TOKEN) {
    return {
      id: 'anthropic',
      label: 'Claude',
      model: 'claude-opus-5-5',
      apiKey: env.ANTHROPIC_API_KEY,
      authToken: env.ANTHROPIC_AUTH_TOKEN,
    }
  }
  return undefined
}

/**
 * Environment for the Agent SDK's Claude Code process: point it at the chosen provider.
 * MiMo documents exactly these variables for Claude Code.
 */
export function agentEnv(provider: LlmProvider): Record<string, string> {
  const base = Object.fromEntries(
    Object.entries(process.env).filter(
      ([k, v]) => v !== undefined && !['ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_BASE_URL', 'ANTHROPIC_MODEL'].includes(k),
    ),
  ) as Record<string, string>
  if (provider.id === 'mimo') {
    return {
      ...base,
      ANTHROPIC_BASE_URL: provider.baseURL ?? MIMO_DEFAULT_URL,
      ANTHROPIC_AUTH_TOKEN: provider.authToken ?? '',
      ANTHROPIC_MODEL: provider.model,
      ANTHROPIC_DEFAULT_OPUS_MODEL: provider.model,
      ANTHROPIC_DEFAULT_SONNET_MODEL: provider.model,
      ANTHROPIC_DEFAULT_HAIKU_MODEL: provider.model,
    }
  }
  return {
    ...base,
    ...(provider.apiKey ? { ANTHROPIC_API_KEY: provider.apiKey } : {}),
    ...(provider.authToken ? { ANTHROPIC_AUTH_TOKEN: provider.authToken } : {}),
  }
}
