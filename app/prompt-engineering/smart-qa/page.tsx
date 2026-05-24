'use client'

import { useState, useMemo } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = { id: string; label: string; emoji: string; color: string; systemPrompt: string }
type PromptStyle = { id: string; label: string; emoji: string; description: string; suffix: string }
type FewShotSet = { id: string; label: string; examples: { user: string; assistant: string }[] }

// ── Config ────────────────────────────────────────────────────────────────────
const ROLES: Role[] = [
  {
    id: 'tutor',
    label: 'Helpful Tutor',
    emoji: '🎓',
    color: 'blue',
    systemPrompt: 'You are a helpful and patient tutor. Explain concepts clearly using simple language, analogies, and step-by-step breakdowns. Encourage the learner and check for understanding.',
  },
  {
    id: 'expert',
    label: 'Senior Engineer',
    emoji: '⚙️',
    color: 'purple',
    systemPrompt: 'You are a senior software engineer with 15 years of experience. Give precise, technical answers. Mention trade-offs, edge cases, and production considerations. Skip basic explanations.',
  },
  {
    id: 'eli5',
    label: 'ELI5 Explainer',
    emoji: '🧒',
    color: 'green',
    systemPrompt: 'You are an expert at explaining complex topics to a 5-year-old. Use very simple words, fun analogies, and relatable real-world examples. Avoid jargon completely.',
  },
  {
    id: 'socratic',
    label: 'Socratic Teacher',
    emoji: '🏛️',
    color: 'orange',
    systemPrompt: 'You are a Socratic teacher. Instead of giving direct answers, guide the learner to the answer by asking thought-provoking questions. Help them discover insights themselves.',
  },
  {
    id: 'coach',
    label: 'Career Coach',
    emoji: '💼',
    color: 'teal',
    systemPrompt: 'You are an experienced career coach specialising in tech roles. Give actionable, honest career advice. Focus on practical steps, mindset, and real-world impact.',
  },
]

const PROMPT_STYLES: PromptStyle[] = [
  {
    id: 'direct',
    label: 'Direct Answer',
    emoji: '⚡',
    description: 'Concise, straight-to-the-point response',
    suffix: 'Give a clear, direct answer.',
  },
  {
    id: 'cot',
    label: 'Chain of Thought',
    emoji: '🔗',
    description: 'Think step-by-step before answering',
    suffix: 'Think through this step by step before giving your final answer. Show your reasoning.',
  },
  {
    id: 'structured',
    label: 'Structured Output',
    emoji: '📋',
    description: 'Formatted with headers, bullets, summary',
    suffix: 'Structure your response with: 1) A one-line summary, 2) Key points as bullet points, 3) A practical example.',
  },
]

const FEW_SHOT_SETS: FewShotSet[] = [
  {
    id: 'none',
    label: 'No Examples',
    examples: [],
  },
  {
    id: 'concepts',
    label: 'CS Concepts',
    examples: [
      {
        user: 'What is a cache?',
        assistant: 'A cache is a temporary storage layer that holds frequently accessed data so future requests can be served faster, avoiding expensive recomputation or network calls.',
      },
      {
        user: 'What is a race condition?',
        assistant: 'A race condition occurs when two concurrent operations depend on shared state and the outcome differs based on the order they execute — often causing unpredictable bugs.',
      },
    ],
  },
  {
    id: 'career',
    label: 'Career Q&A',
    examples: [
      {
        user: 'How do I prepare for a system design interview?',
        assistant: 'Start with the fundamentals: scalability, availability, and consistency. Practice designing 3-4 well-known systems (URL shortener, Twitter feed, rate limiter). Verbalise your trade-offs — interviewers care more about your thinking than the perfect answer.',
      },
      {
        user: 'Should I take a pay cut to join a startup?',
        assistant: 'Evaluate three things: the equity offer (vesting schedule, strike price, dilution), the market size the startup is targeting, and how much you trust the founding team. A 20% pay cut at a well-funded Series B with real equity can outperform staying at a FAANG long-term — but only if the upside is real.',
      },
    ],
  },
]

const COLOR_MAP: Record<string, { bg: string; border: string; badge: string; text: string; btn: string; ring: string }> = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-950/30',     border: 'border-blue-200 dark:border-blue-800/40',   badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',   text: 'text-blue-700 dark:text-blue-300',   btn: 'bg-blue-600 hover:bg-blue-700',   ring: 'ring-blue-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800/40', badge: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300', text: 'text-purple-700 dark:text-purple-300', btn: 'bg-purple-600 hover:bg-purple-700', ring: 'ring-purple-400' },
  green:  { bg: 'bg-green-50 dark:bg-green-950/30',   border: 'border-green-200 dark:border-green-800/40',  badge: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',  text: 'text-green-700 dark:text-green-300',  btn: 'bg-green-600 hover:bg-green-700',  ring: 'ring-green-400' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800/40', badge: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300', text: 'text-orange-700 dark:text-orange-300', btn: 'bg-orange-600 hover:bg-orange-700', ring: 'ring-orange-400' },
  teal:   { bg: 'bg-teal-50 dark:bg-teal-950/30',     border: 'border-teal-200 dark:border-teal-800/40',   badge: 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300',   text: 'text-teal-700 dark:text-teal-300',   btn: 'bg-teal-600 hover:bg-teal-700',   ring: 'ring-teal-400' },
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SmartQAPage() {
  const [selectedRole, setSelectedRole] = useState<string>('tutor')
  const [selectedStyle, setSelectedStyle] = useState<string>('direct')
  const [selectedFewShot, setSelectedFewShot] = useState<string>('none')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [tokenUsage, setTokenUsage] = useState<{ prompt_tokens: number; completion_tokens: number } | null>(null)

  const role = ROLES.find(r => r.id === selectedRole)!
  const style = PROMPT_STYLES.find(s => s.id === selectedStyle)!
  const fewShotSet = FEW_SHOT_SETS.find(f => f.id === selectedFewShot)!
  const c = COLOR_MAP[role.color]

  const builtSystemPrompt = useMemo(() => {
    return `${role.systemPrompt}\n\n${style.suffix}`
  }, [role, style])

  const fewShotMessages = useMemo(() => {
    return fewShotSet.examples.flatMap(ex => [
      { role: 'user' as const, content: ex.user },
      { role: 'assistant' as const, content: ex.assistant },
    ])
  }, [fewShotSet])

  const handleAsk = async () => {
    if (!question.trim()) return
    setLoading(true)
    setError(null)
    setAnswer(null)
    setTokenUsage(null)
    try {
      const res = await fetch('/api/prompt-engineering/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          systemPrompt: builtSystemPrompt,
          messages: fewShotMessages,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAnswer(data.answer)
      if (data.usage) setTokenUsage(data.usage)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  const SAMPLE_QUESTIONS: Record<string, string[]> = {
    tutor:    ['Explain recursion to me', 'How does HTTP work?', 'What is Big O notation?'],
    expert:   ['When should I use Redis vs Memcached?', 'How do you design a rate limiter?', 'Explain CQRS pattern'],
    eli5:     ['What is the internet?', 'How does a computer work?', 'What is machine learning?'],
    socratic: ['Is premature optimisation always bad?', 'Should every function be tested?', 'When is a monolith better than microservices?'],
    coach:    ['How do I negotiate a higher salary?', 'Should I switch from backend to full-stack?', 'How do I stand out in tech interviews?'],
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-xl border-2 p-6 ${c.bg} ${c.border}`}>
        <h1 className="text-3xl font-bold mb-2">Smart Q&A Assistant</h1>
        <p className="text-muted-foreground">
          Explore how <strong>role prompting</strong>, <strong>few-shot examples</strong>, and <strong>prompt styles</strong> change
          the model&apos;s response — using the exact same question.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left panel: Controls ── */}
        <div className="lg:col-span-1 space-y-5">

          {/* Role selector */}
          <div className="rounded-xl border border-border p-4 space-y-3">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">1. Choose a Role</h2>
            <div className="space-y-2">
              {ROLES.map(r => {
                const rc = COLOR_MAP[r.color]
                const isSelected = selectedRole === r.id
                return (
                  <button
                    key={r.id}
                    onClick={() => { setSelectedRole(r.id); setAnswer(null) }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm ${
                      isSelected
                        ? `${rc.bg} ${rc.border} ring-2 ${rc.ring}`
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{r.emoji}</span>
                      <div>
                        <div className={`font-medium ${isSelected ? rc.text : ''}`}>{r.label}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Prompt style */}
          <div className="rounded-xl border border-border p-4 space-y-3">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">2. Prompt Style</h2>
            <div className="space-y-2">
              {PROMPT_STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedStyle(s.id); setAnswer(null) }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm ${
                    selectedStyle === s.id
                      ? `${c.bg} ${c.border} ring-2 ${c.ring}`
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{s.emoji}</span>
                    <div>
                      <div className={`font-medium ${selectedStyle === s.id ? c.text : ''}`}>{s.label}</div>
                      <div className="text-xs text-muted-foreground">{s.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Few-shot */}
          <div className="rounded-xl border border-border p-4 space-y-3">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">3. Few-Shot Examples</h2>
            <div className="space-y-2">
              {FEW_SHOT_SETS.map(f => (
                <button
                  key={f.id}
                  onClick={() => { setSelectedFewShot(f.id); setAnswer(null) }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm ${
                    selectedFewShot === f.id
                      ? `${c.bg} ${c.border} ring-2 ${c.ring}`
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${selectedFewShot === f.id ? c.text : ''}`}>{f.label}</span>
                    {f.examples.length > 0 && (
                      <span className="text-xs text-muted-foreground">{f.examples.length} pair{f.examples.length > 1 ? 's' : ''}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Show few-shot examples detail */}
            {fewShotSet.examples.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-border">
                <p className="text-xs text-muted-foreground font-medium">Examples injected:</p>
                {fewShotSet.examples.map((ex, i) => (
                  <div key={i} className="rounded-lg bg-muted/40 p-2.5 text-xs space-y-1">
                    <div><span className="font-semibold text-blue-600 dark:text-blue-400">User:</span> {ex.user}</div>
                    <div><span className="font-semibold text-green-600 dark:text-green-400">AI:</span> {ex.assistant}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel: Q&A ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Active config banner */}
          <div className={`rounded-xl border-2 p-4 ${c.bg} ${c.border}`}>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">Active config:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.badge}`}>{role.emoji} {role.label}</span>
              <span className="text-muted-foreground">+</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.badge}`}>{style.emoji} {style.label}</span>
              <span className="text-muted-foreground">+</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.badge}`}>
                {fewShotSet.examples.length > 0 ? `${fewShotSet.examples.length} examples` : 'No examples'}
              </span>
            </div>
          </div>

          {/* Built system prompt preview */}
          <div className="rounded-xl border border-border">
            <button
              onClick={() => setShowPrompt(p => !p)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/40 rounded-xl transition-colors"
            >
              <span>🔍 View constructed system prompt</span>
              <span className="text-muted-foreground">{showPrompt ? '▲' : '▼'}</span>
            </button>
            {showPrompt && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">System Prompt</p>
                  <pre className="text-xs bg-slate-900 text-slate-100 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">{builtSystemPrompt}</pre>
                </div>
                {fewShotMessages.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Few-Shot Messages ({fewShotMessages.length} turns)</p>
                    <div className="rounded-lg bg-muted/30 p-3 space-y-2">
                      {fewShotMessages.map((m, i) => (
                        <div key={i} className="text-xs">
                          <span className={`font-semibold ${m.role === 'user' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}>
                            [{m.role}]
                          </span>{' '}
                          {m.content}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Then your question</p>
                  <pre className="text-xs bg-muted/30 rounded p-2 whitespace-pre-wrap">[user] {question || '(your question here)'}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Sample questions */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">Try a sample question:</p>
            <div className="flex flex-wrap gap-2">
              {(SAMPLE_QUESTIONS[selectedRole] ?? []).map(q => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors hover:ring-1 ${c.border} ${c.bg} ${c.text}`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Question input */}
          <div className="space-y-2">
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleAsk() }}
              rows={3}
              placeholder="Ask anything…"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-1 transition-shadow"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">⌘+Enter to submit</span>
              <button
                onClick={handleAsk}
                disabled={loading || !question.trim()}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${c.btn} disabled:opacity-40`}
              >
                {loading ? <><Spinner /> Thinking…</> : `${role.emoji} Ask`}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300">
              ❌ {error}
            </div>
          )}

          {/* Answer */}
          {answer && (
            <div className={`rounded-xl border-2 p-5 space-y-3 ${c.bg} ${c.border}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold uppercase tracking-widest ${c.text}`}>
                  {role.emoji} {role.label} · {style.emoji} {style.label}
                  {fewShotSet.examples.length > 0 && ` · ${fewShotSet.examples.length}-shot`}
                </span>
                {tokenUsage && (
                  <span className="text-xs text-muted-foreground">
                    {tokenUsage.prompt_tokens}↑ {tokenUsage.completion_tokens}↓ tokens
                  </span>
                )}
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{answer}</div>
            </div>
          )}

          {/* Explainer callout */}
          {!answer && !loading && (
            <div className="rounded-xl border border-dashed border-border p-6 text-center space-y-2">
              <p className="text-2xl">🧪</p>
              <p className="text-sm font-medium">Try the same question with different roles and styles</p>
              <p className="text-xs text-muted-foreground">
                Ask &quot;What is a database?&quot; as a Tutor, then as an ELI5 Explainer, then with Chain of Thought — watch how the answer changes.
              </p>
            </div>
          )}

          {/* What's happening explainer */}
          <div className="rounded-xl border border-border p-4 space-y-3">
            <h3 className="font-semibold text-sm">What&apos;s happening under the hood?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { icon: '🎭', title: 'Role Prompting', body: 'The system message tells the model who to be. This primes its tone, depth, vocabulary and style for the entire conversation.' },
                { icon: '📚', title: 'Few-Shot Examples', body: 'Example Q&A pairs are injected as prior conversation turns. The model learns the expected output format and style from them.' },
                { icon: '🧩', title: 'Prompt Style', body: 'A suffix instruction changes how the model structures its answer — direct, reasoning chain, or formatted output.' },
              ].map(item => (
                <div key={item.title} className="bg-muted/40 rounded-lg p-3 space-y-1">
                  <div className="text-base">{item.icon}</div>
                  <div className="text-xs font-semibold">{item.title}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{item.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
