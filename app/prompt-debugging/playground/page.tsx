'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type Version = {
  id: string
  name: string        // "v1", "v2", ...
  note: string        // what changed / why — the "improvement" log
  systemPrompt: string
}

type Usage = {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  completion_tokens_details?: { reasoning_tokens?: number }
}

type ReasoningEffort = 'minimal' | 'low' | 'medium' | 'high'

type Result = {
  output: string
  usage?: Usage
  latencyMs: number
  error?: string
  rating?: 'up' | 'down'
  ranAt: number
}

type Store = {
  testInput: string
  versions: Version[]
  results: Record<string, Result>   // keyed by version id
  reasoningEffort: ReasoningEffort
}

const STORAGE_KEY = 'prompt-testing-playground:v1'
const MAX_VERSIONS = 5   // cap so the comparison grid stays readable

const REASONING_EFFORTS: { id: ReasoningEffort; label: string; hint: string }[] = [
  { id: 'minimal', label: 'Minimal', hint: 'No hidden thinking — fastest, cheapest, cleanest token counts' },
  { id: 'low',     label: 'Low',     hint: 'A little reasoning' },
  { id: 'medium',  label: 'Medium',  hint: 'More reasoning' },
  { id: 'high',    label: 'High',    hint: 'Maximum reasoning — slowest & most tokens' },
]

// ── Seed (loads on first visit) ─────────────────────────────────────────────────
const SEED: Store = {
  testInput: 'Summarize this support ticket: "App keeps crashing when I upload a photo bigger than 5MB. Using iPhone 14, latest app version. Already reinstalled twice."',
  versions: [
    {
      id: 'seed-1',
      name: 'v1',
      note: 'Baseline — vague instruction',
      systemPrompt: 'You are a helpful assistant. Summarize the ticket.',
    },
    {
      id: 'seed-2',
      name: 'v2',
      note: 'Added role + a fixed output structure',
      systemPrompt:
        'You are a senior support triage agent. Summarize the ticket in exactly 3 fields:\n- Issue: (one line)\n- Environment: (device + app version)\n- Steps already tried: (comma separated)',
    },
    {
      id: 'seed-3',
      name: 'v3',
      note: 'v2 + severity + JSON output for downstream use',
      systemPrompt:
        'You are a senior support triage agent. Return ONLY valid JSON with keys: issue, environment, steps_tried (array), severity (one of: low, medium, high, critical). Infer severity from impact. No prose outside the JSON.',
    },
  ],
  results: {},
  reasoningEffort: 'minimal',
}

// ── Helpers ─────────────────────────────────────────────────────────────────────
function newId() {
  return `v-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  )
}

// ── How It Works Modal ──────────────────────────────────────────────────────────
function HowItWorksModal({ onClose }: { onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-it-works-title"
    >
      <div
        className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border sticky top-0 bg-background z-10">
          <div>
            <h2 id="how-it-works-title" className="text-xl font-bold">🧪 How the Prompt Testing Playground Works</h2>
            <p className="text-xs text-muted-foreground mt-1">Compare prompt versions against one input · Azure OpenAI · localStorage</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none flex-shrink-0 ml-4" aria-label="Close">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* The idea */}
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40 rounded-xl p-4">
            <h3 className="font-semibold text-sm text-rose-800 dark:text-rose-200 mb-2">🎯 The Idea</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To know whether a prompt change is actually an <strong>improvement</strong>, you have to hold everything
              else constant. This playground keeps <strong>one shared test input</strong> fixed and runs it through
              multiple prompt <strong>versions (v1, v2, v3…)</strong>, so any difference in the output comes purely
              from the prompt — not the input or the model.
            </p>
          </div>

          {/* Step by step */}
          <div>
            <h3 className="font-semibold text-base mb-3">⚙️ Step by Step</h3>
            <div className="space-y-2">
              {[
                { n: '1', title: 'Enter one shared test input', desc: 'This is sent as the user message to every version. Change it once and it applies to all of them.' },
                { n: '2', title: 'Write prompt versions', desc: 'Each version is its own system prompt plus a short note describing what you changed and why. “Add version” clones the last one so you can iterate from where you left off.' },
                { n: '3', title: 'Run all (or one)', desc: 'The page calls the /api/prompt-debugging/playground route once per version, in parallel. Each call sends that version’s system prompt + the shared input to Azure OpenAI.' },
                { n: '4', title: 'Compare outputs side-by-side', desc: 'Every version shows its raw output plus latency, input/output token counts, and character length right below it.' },
                { n: '5', title: 'Rate & track improvements', desc: 'Give each output a 👍 or 👎. The Improvement Tracker table then ranks versions by total tokens and latency (cheapest & fastest are highlighted) next to your rating — so you can pick which version to promote.' },
              ].map(s => (
                <div key={s.n} className="flex gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-rose-600 text-white text-xs font-bold flex-shrink-0">{s.n}</span>
                  <div>
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What the metrics mean */}
          <div>
            <h3 className="font-semibold text-base mb-3">📊 What the Metrics Mean</h3>
            <div className="space-y-2">
              {[
                { icon: '⚡', t: 'Latency (ms)', d: 'Round-trip time for that version’s call. Lower is a snappier user experience.' },
                { icon: 'Σ', t: 'Total tokens', d: 'Prompt (↑ in) + completion (↓ out) tokens — what you pay for. On a reasoning model, completion also includes hidden 🧠 thinking tokens; the Reasoning selector (default Minimal) keeps that at zero so the count is meaningful.' },
                { icon: '🔤', t: 'Output size (chars)', d: 'How long the answer is. Useful for spotting versions that ramble vs. stay concise.' },
                { icon: '👍', t: 'Your rating', d: 'A manual quality judgment. Metrics can’t tell you if the answer is correct — you do. This is the human eval signal.' },
              ].map(m => (
                <div key={m.t} className="flex gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                  <span className="text-lg flex-shrink-0 w-5 text-center">{m.icon}</span>
                  <div>
                    <p className="text-sm font-semibold">{m.t}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{m.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech & persistence */}
          <div>
            <h3 className="font-semibold text-base mb-3">🔧 Under the Hood</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['Azure OpenAI', 'Chat completions via AzureOpenAI SDK (gpt-5 reasoning model)'],
                ['Next.js API Route', '/api/prompt-debugging/playground'],
                ['Parallel runs', 'Promise.all — one call per version'],
                ['Same input & settings', 'Only the prompt varies between versions'],
                ['reasoning_effort', 'Defaults to "minimal" so token counts aren’t inflated by hidden thinking'],
                ['localStorage', 'Versions, input, results & effort persist in this browser'],
              ].map(([tech, desc]) => (
                <div key={tech} className="bg-muted/40 rounded-lg p-2.5 border border-border">
                  <p className="text-xs font-semibold">{tech}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tie-in */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 rounded-xl p-4">
            <h3 className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-2">🔗 How it connects</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This is the hands-on version of the <strong>5 debugging steps</strong> (reproduce → isolate → refine →
              evaluate) and <strong>prompt versioning</strong>. You isolate one variable (the prompt), keep the input
              fixed, and use measurable signals plus your own judgment to <em>prove</em> a version is better before
              shipping it.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border sticky bottom-0 bg-background">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-xl text-white text-sm font-semibold bg-rose-600 hover:bg-rose-700 transition-colors"
          >
            Got it — let me try it
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PromptPlaygroundPage() {
  const [hydrated, setHydrated] = useState(false)
  const [testInput, setTestInput] = useState(SEED.testInput)
  const [versions, setVersions] = useState<Version[]>(SEED.versions)
  const [results, setResults] = useState<Record<string, Result>>({})
  const [running, setRunning] = useState<Record<string, boolean>>({})
  const [showExplain, setShowExplain] = useState(false)
  const [reasoningEffort, setReasoningEffort] = useState<ReasoningEffort>(SEED.reasoningEffort)
  const [toast, setToast] = useState<string | null>(null)
  const seq = useRef(SEED.versions.length)

  // Load persisted state on mount (client only — avoids hydration mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Store
        if (parsed.versions?.length) {
          setTestInput(parsed.testInput ?? '')
          setVersions(parsed.versions)
          setResults(parsed.results ?? {})
          if (parsed.reasoningEffort) setReasoningEffort(parsed.reasoningEffort)
          seq.current = parsed.versions.length
        }
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true)
  }, [])

  // Auto-dismiss transient toast messages
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])

  // Persist on every meaningful change (after hydration)
  useEffect(() => {
    if (!hydrated) return
    const store: Store = { testInput, versions, results, reasoningEffort }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    } catch {
      /* quota / private mode — non-fatal */
    }
  }, [hydrated, testInput, versions, results, reasoningEffort])

  const anyRunning = Object.values(running).some(Boolean)

  // ── Version CRUD ──────────────────────────────────────────────────────────────
  const updateVersion = (id: string, patch: Partial<Version>) =>
    setVersions(vs => vs.map(v => (v.id === id ? { ...v, ...patch } : v)))

  const addVersion = () => {
    if (versions.length >= MAX_VERSIONS) {
      setToast(`You can compare up to ${MAX_VERSIONS} versions. Delete one to add another.`)
      return
    }
    const last = versions[versions.length - 1]
    seq.current += 1
    const v: Version = {
      id: newId(),
      name: `v${seq.current}`,
      note: '',
      systemPrompt: last?.systemPrompt ?? '',   // clone last to encourage iterating
    }
    setVersions(vs => [...vs, v])
  }

  const removeVersion = (id: string) => {
    setVersions(vs => vs.filter(v => v.id !== id))
    setResults(r => {
      const rest = { ...r }
      delete rest[id]
      return rest
    })
  }

  const setRating = (id: string, rating: 'up' | 'down') =>
    setResults(r => {
      const existing = r[id]
      if (!existing) return r
      return { ...r, [id]: { ...existing, rating: existing.rating === rating ? undefined : rating } }
    })

  // ── Running prompts ─────────────────────────────────────────────────────────────
  const runVersion = async (v: Version) => {
    if (!testInput.trim()) return
    setRunning(r => ({ ...r, [v.id]: true }))
    try {
      const res = await fetch('/api/prompt-debugging/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt: v.systemPrompt, userInput: testInput.trim(), reasoningEffort }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setResults(r => ({
        ...r,
        [v.id]: {
          output: data.output,
          usage: data.usage,
          latencyMs: data.latencyMs,
          rating: r[v.id]?.rating,        // preserve any prior rating
          ranAt: Date.now(),
        },
      }))
    } catch (e) {
      setResults(r => ({
        ...r,
        [v.id]: { output: '', latencyMs: 0, error: e instanceof Error ? e.message : String(e), ranAt: Date.now() },
      }))
    } finally {
      setRunning(r => ({ ...r, [v.id]: false }))
    }
  }

  const runAll = async () => {
    if (!testInput.trim()) return
    await Promise.all(versions.map(v => runVersion(v)))
  }

  const resetAll = () => {
    setTestInput(SEED.testInput)
    setVersions(SEED.versions)
    setResults({})
    setReasoningEffort(SEED.reasoningEffort)
    seq.current = SEED.versions.length
  }

  // ── Improvement tracker derived metrics ─────────────────────────────────────────
  const tracked = useMemo(
    () =>
      versions.map(v => {
        const r = results[v.id]
        return {
          version: v,
          hasRun: !!r && !r.error,
          totalTokens: r?.usage?.total_tokens,
          latencyMs: r?.error ? undefined : r?.latencyMs,
          chars: r && !r.error ? r.output.length : undefined,
          rating: r?.rating,
        }
      }),
    [versions, results],
  )

  const ranRows = tracked.filter(t => t.hasRun)
  const minTokens = ranRows.length ? Math.min(...ranRows.map(t => t.totalTokens ?? Infinity)) : undefined
  const minLatency = ranRows.length ? Math.min(...ranRows.map(t => t.latencyMs ?? Infinity)) : undefined

  const gridCols =
    versions.length >= 3 ? 'lg:grid-cols-3' : versions.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-1'

  return (
    <div className="space-y-6">
      {showExplain && <HowItWorksModal onClose={() => setShowExplain(false)} />}

      {/* Transient toast (e.g. version cap reached) */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-xs" role="status" aria-live="polite">
          <div className="flex items-start gap-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/80 text-amber-900 dark:text-amber-100 shadow-lg px-4 py-3 text-sm">
            <span className="flex-shrink-0">⚠️</span>
            <span className="leading-snug">{toast}</span>
            <button onClick={() => setToast(null)} className="ml-1 flex-shrink-0 text-amber-700 dark:text-amber-300 hover:opacity-70" aria-label="Dismiss">✕</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-rose-50 to-fuchsia-50 dark:from-rose-950/40 dark:to-fuchsia-950/40 border-2 border-rose-200 dark:border-rose-800/50 rounded-xl p-8">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🧪</span>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-rose-900 dark:text-rose-100 mb-3">
                Prompt Testing Playground
              </h1>
              <button
                onClick={() => setShowExplain(true)}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-700 bg-white dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-900/40 transition-colors"
              >
                <span className="text-sm">💡</span> How it works
              </button>
            </div>
            <p className="text-lg text-rose-800 dark:text-rose-200 leading-relaxed">
              Store prompt versions (<strong>v1, v2, v3…</strong>), run them all against the{' '}
              <strong>same test input</strong>, and compare outputs side-by-side. Track which version improves
              quality, latency, and token cost — the practical loop behind prompt debugging &amp; versioning.
            </p>
          </div>
        </div>
      </div>

      {/* How to use */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { icon: '📝', t: '1. One shared input', b: 'Everything is tested against the same input, so differences come purely from the prompt.' },
          { icon: '🌿', t: '2. Versions v1 → vN', b: 'Each version is an isolated system prompt. Add a note describing what you changed and why.' },
          { icon: '📊', t: '3. Compare & track', b: 'Run all, rate outputs 👍/👎, and watch tokens & latency in the improvement tracker.' },
        ].map(s => (
          <div key={s.t} className="rounded-xl border border-border p-4 flex gap-3">
            <span className="text-xl flex-shrink-0">{s.icon}</span>
            <div>
              <p className="font-semibold text-sm">{s.t}</p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{s.b}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Shared test input */}
      <div className="rounded-xl border-2 border-rose-200 dark:border-rose-800/40 bg-rose-50/40 dark:bg-rose-950/20 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-rose-700 dark:text-rose-300">
            📝 Shared Test Input
          </h2>
          <span className="text-xs text-muted-foreground">Sent as the user message to every version</span>
        </div>
        <textarea
          value={testInput}
          onChange={e => setTestInput(e.target.value)}
          rows={3}
          placeholder="Enter the input you want every prompt version to handle…"
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-rose-400 transition-shadow"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={runAll}
            disabled={anyRunning || !testInput.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-40"
          >
            {anyRunning ? <><Spinner /> Running…</> : `▶ Run all ${versions.length} versions`}
          </button>
          <button
            onClick={addVersion}
            title={versions.length >= MAX_VERSIONS ? `Maximum ${MAX_VERSIONS} versions` : 'Add another version'}
            aria-disabled={versions.length >= MAX_VERSIONS}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
              versions.length >= MAX_VERSIONS
                ? 'border-amber-300 dark:border-amber-700 text-muted-foreground'
                : 'border-border hover:bg-muted/50'
            }`}
          >
            ➕ Add version
            <span className={`text-xs ${versions.length >= MAX_VERSIONS ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
              {versions.length}/{MAX_VERSIONS}
            </span>
          </button>

          {/* Reasoning effort — applied equally to every version for a fair comparison */}
          <div className="flex items-center gap-2">
            <label htmlFor="reasoning-effort" className="text-xs font-medium text-muted-foreground whitespace-nowrap">🧠 Reasoning</label>
            <select
              id="reasoning-effort"
              value={reasoningEffort}
              onChange={e => setReasoningEffort(e.target.value as ReasoningEffort)}
              title={REASONING_EFFORTS.find(r => r.id === reasoningEffort)?.hint}
              className="px-2.5 py-2 rounded-lg border border-border bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              {REASONING_EFFORTS.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={resetAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors ml-auto"
          >
            ↺ Reset to demo
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          💡 This deployment is a reasoning model. <strong>Minimal</strong> turns off hidden &quot;thinking&quot; tokens so the
          token counts reflect the real prompt + answer cost. Raise it to see how reasoning affects quality, tokens &amp; latency.
        </p>
      </div>

      {/* Version cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-4 items-start`}>
        {versions.map(v => {
          const r = results[v.id]
          const isRunning = !!running[v.id]
          return (
            <div key={v.id} className="rounded-xl border border-border overflow-hidden flex flex-col">
              {/* Card header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-rose-600 text-white text-xs font-bold flex-shrink-0">
                  {v.name}
                </span>
                <input
                  value={v.note}
                  onChange={e => updateVersion(v.id, { note: e.target.value })}
                  placeholder="What changed in this version?"
                  className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/60"
                />
                <button
                  onClick={() => removeVersion(v.id)}
                  disabled={versions.length <= 1}
                  title={versions.length <= 1 ? 'Keep at least one version' : 'Delete version'}
                  className="text-muted-foreground hover:text-red-500 disabled:opacity-30 disabled:hover:text-muted-foreground transition-colors text-sm flex-shrink-0"
                >
                  🗑
                </button>
              </div>

              {/* System prompt editor */}
              <div className="p-4 space-y-3 flex-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">System Prompt</label>
                <textarea
                  value={v.systemPrompt}
                  onChange={e => updateVersion(v.id, { systemPrompt: e.target.value })}
                  rows={6}
                  placeholder="Define the instructions for this version…"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-rose-400 transition-shadow"
                />
                <button
                  onClick={() => runVersion(v)}
                  disabled={isRunning || !testInput.trim()}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-40"
                >
                  {isRunning ? <><Spinner /> Running…</> : `▶ Run ${v.name}`}
                </button>

                {/* Output */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Output</span>
                    {r && !r.error && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setRating(v.id, 'up')}
                          title="Mark this output as good"
                          className={`text-sm px-1.5 rounded transition-colors ${r.rating === 'up' ? 'bg-green-100 dark:bg-green-900/50' : 'hover:bg-muted'}`}
                        >
                          👍
                        </button>
                        <button
                          onClick={() => setRating(v.id, 'down')}
                          title="Mark this output as bad"
                          className={`text-sm px-1.5 rounded transition-colors ${r.rating === 'down' ? 'bg-red-100 dark:bg-red-900/50' : 'hover:bg-muted'}`}
                        >
                          👎
                        </button>
                      </div>
                    )}
                  </div>

                  {isRunning ? (
                    <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                      <Spinner /> Generating…
                    </div>
                  ) : r?.error ? (
                    <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300 p-3 text-xs">
                      ❌ {r.error}
                    </div>
                  ) : r ? (
                    <>
                      <pre className="rounded-lg bg-muted/40 border border-border p-3 text-xs whitespace-pre-wrap leading-relaxed max-h-72 overflow-auto">
                        {r.output}
                      </pre>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-muted-foreground">
                        <span>⚡ {r.latencyMs} ms</span>
                        {r.usage && (
                          <>
                            <span>↑ {r.usage.prompt_tokens} in</span>
                            <span>↓ {r.usage.completion_tokens} out</span>
                            {!!r.usage.completion_tokens_details?.reasoning_tokens && (
                              <span title="Hidden reasoning tokens — included in the output count">
                                🧠 {r.usage.completion_tokens_details.reasoning_tokens} think
                              </span>
                            )}
                            <span className="font-medium">Σ {r.usage.total_tokens} tok</span>
                          </>
                        )}
                        <span>{r.output.length} chars</span>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                      Not run yet — hit <span className="font-medium">Run {v.name}</span> or Run all.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Improvement tracker */}
      <div>
        <h2 className="text-2xl font-bold mb-1">📊 Improvement Tracker</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Compare versions at a glance. Lowest token cost and fastest response are highlighted — pair that with your
          👍/👎 rating to decide which version to promote.
        </p>
        <div className="rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-semibold text-xs">Version</th>
                <th className="text-left p-3 font-semibold text-xs">What changed</th>
                <th className="text-right p-3 font-semibold text-xs">Total tokens</th>
                <th className="text-right p-3 font-semibold text-xs">Latency</th>
                <th className="text-right p-3 font-semibold text-xs">Output size</th>
                <th className="text-center p-3 font-semibold text-xs">Rating</th>
              </tr>
            </thead>
            <tbody>
              {tracked.map((t, i) => (
                <tr key={t.version.id} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                  <td className="p-3 font-medium text-rose-700 dark:text-rose-400 whitespace-nowrap">{t.version.name}</td>
                  <td className="p-3 text-muted-foreground text-xs">{t.version.note || <span className="opacity-50">—</span>}</td>
                  <td className="p-3 text-right tabular-nums">
                    {t.totalTokens != null ? (
                      <span className={t.totalTokens === minTokens ? 'font-bold text-green-600 dark:text-green-400' : ''}>
                        {t.totalTokens}
                        {t.totalTokens === minTokens && ranRows.length > 1 && ' ✓'}
                      </span>
                    ) : (
                      <span className="opacity-40">—</span>
                    )}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {t.latencyMs != null ? (
                      <span className={t.latencyMs === minLatency ? 'font-bold text-green-600 dark:text-green-400' : ''}>
                        {t.latencyMs} ms
                        {t.latencyMs === minLatency && ranRows.length > 1 && ' ✓'}
                      </span>
                    ) : (
                      <span className="opacity-40">—</span>
                    )}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {t.chars != null ? `${t.chars} ch` : <span className="opacity-40">—</span>}
                  </td>
                  <td className="p-3 text-center">
                    {t.rating === 'up' ? '👍' : t.rating === 'down' ? '👎' : <span className="opacity-40">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {ranRows.length === 0 && (
          <p className="text-xs text-muted-foreground mt-2">Run at least one version to populate the tracker.</p>
        )}
      </div>

      {/* Educational footer */}
      <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong>💡 How this ties together:</strong> This playground is the hands-on version of the{' '}
          <strong>5 debugging steps</strong> (reproduce → isolate → refine → evaluate) and{' '}
          <strong>prompt versioning</strong> concepts. You isolate one variable (the prompt), keep the input fixed,
          and use measurable signals (tokens, latency, your rating) to prove an improvement before promoting a version.
          Your versions persist in this browser via <code className="bg-muted px-1 rounded">localStorage</code>.
        </p>
      </div>
    </div>
  )
}
