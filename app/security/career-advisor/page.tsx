'use client'

import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
type ExperienceLevel = 'Fresher (0 yrs)' | '1–3 yrs' | '3–6 yrs' | '6–10 yrs' | '10+ yrs'
type WorkStyle = 'Remote' | 'Hybrid' | 'On-site' | 'No preference'
type CompanyType = 'Tier-1 Service (TCS/Infosys/Wipro)' | 'MNC Product (Microsoft/Google/Amazon)' | 'Indian Startup/Unicorn' | 'Mid-tier IT' | 'No preference'
type Domain = 'BFSI' | 'E-commerce' | 'Telecom' | 'Healthcare IT' | 'ERP/SAP' | 'Testing/QA' | 'Cloud & DevOps' | 'Data & Analytics' | 'Government IT' | 'No preference'

interface Profile {
  currentRole: string
  experienceLevel: ExperienceLevel | ''
  skills: string[]
  interests: string[]
  careerGoal: string
  workStyle: WorkStyle | ''
  preferredCity: string
  companyType: CompanyType | ''
  domain: Domain | ''
}

interface Job {
  title: string
  companyTier: string
  matchScore: number
  whyMatch: string
  salaryRange: string
  growthOutlook: 'High' | 'Medium' | 'Low'
  topHiringCities: string[]
  keySkillsNeeded: string[]
  certificationBoost: string
}

interface RoadmapPhase {
  phase: number
  title: string
  durationWeeks: number
  goals: string[]
  resources: string[]
  indianContext: string
}

interface JobSearchStrategy {
  platforms: string[]
  resumeTips: string[]
  interviewPrep: string[]
}

interface ResponsibleAI {
  biasFlags: string[]
  fairnessNote: string
  transparencyNotes: string[]
  safeguardsApplied: string[]
  bondWarnings: string[]
  confidenceScore: number
  disclaimer: string
}

interface AdvisorResult {
  jobs: Job[]
  roadmap: { timelineMonths: number; phases: RoadmapPhase[] }
  jobSearchStrategy: JobSearchStrategy
  responsibleAI: ResponsibleAI
}

// ── Indian IT Constants ───────────────────────────────────────────────────────
const SKILL_SUGGESTIONS = [
  'Java', 'Spring Boot', 'Python', 'React', 'Angular', 'Node.js',
  '.NET / C#', 'SQL / PL-SQL', 'Oracle DB', 'Selenium', 'AWS', 'Azure',
  'Kubernetes', 'Docker', 'Microservices', 'System Design', 'SAP ABAP',
  'Salesforce', 'ServiceNow', 'Informatica', 'Machine Learning', 'LangChain',
  'TypeScript', 'CI/CD', 'Jenkins', 'REST APIs', 'Mainframe / COBOL',
]

const INTEREST_SUGGESTIONS = [
  'AI / GenAI', 'Cloud Architecture', 'Full Stack Dev', 'Data Engineering',
  'DevOps / SRE', 'Cybersecurity', 'Product Management', 'BFSI Tech',
  'FAANG/MNC India', 'Indian Startups', 'ERP Consulting', 'QA Automation',
  'Open Source', 'Tech Leadership', 'Data Science', 'SAP/Oracle',
]

const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  'Fresher (0 yrs)', '1–3 yrs', '3–6 yrs', '6–10 yrs', '10+ yrs',
]

const WORK_STYLES: WorkStyle[] = ['Remote', 'Hybrid', 'On-site', 'No preference']

const COMPANY_TYPES: CompanyType[] = [
  'Tier-1 Service (TCS/Infosys/Wipro)',
  'MNC Product (Microsoft/Google/Amazon)',
  'Indian Startup/Unicorn',
  'Mid-tier IT',
  'No preference',
]

const DOMAINS: Domain[] = [
  'BFSI', 'E-commerce', 'Telecom', 'Healthcare IT',
  'ERP/SAP', 'Testing/QA', 'Cloud & DevOps', 'Data & Analytics',
  'Government IT', 'No preference',
]

const CITIES = ['Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Mumbai', 'Delhi NCR', 'Noida/Gurugram', 'Open to any']

const TIER_COLORS: Record<string, string> = {
  'Tier-1 Service': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'MNC Product': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'Indian Startup/Unicorn': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'Mid-tier IT': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'Any': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

// ── Explain Modal ─────────────────────────────────────────────────────────────
function ExplainModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-start justify-between p-6 border-b border-border sticky top-0 bg-background z-10">
          <div>
            <h2 className="text-xl font-bold">What I Built — Career Advisor AI</h2>
            <p className="text-xs text-muted-foreground mt-1">End-to-end AI assistant · Indian IT Market · Responsible AI</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none flex-shrink-0 ml-4">✕</button>
        </div>

        <div className="p-6 space-y-6">

          {/* Overview */}
          <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200/60 rounded-xl p-4">
            <h3 className="font-semibold text-sm text-orange-800 dark:text-orange-200 mb-2">🎯 Project Overview</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A fully interactive AI assistant that takes an Indian IT professional&apos;s profile and returns
              personalised job recommendations (with ₹ LPA salaries), a phased learning roadmap, Indian job
              search strategy, and a complete Responsible AI audit — all generated live via Azure OpenAI <strong>gpt-5-mini</strong>.
            </p>
          </div>

          {/* What I implemented */}
          <div>
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">⚙️ What I Implemented</h3>
            <div className="space-y-2">
              {[
                { icon: '🖥️', title: 'Interactive Profile Form', desc: 'Multi-field form capturing role, experience (Fresher → 10+ yrs), 28 skill chips, interests, company type preference (Tier-1/MNC/Startup), domain (BFSI/Cloud/ERP etc.), preferred Indian city, and career goal.' },
                { icon: '🤖', title: 'Azure OpenAI Integration', desc: 'Calls Azure OpenAI gpt-5-mini via a Next.js API route (/api/security/career-advisor) with a structured system prompt. Uses response_format: json_object to enforce schema — no hallucinated fields.' },
                { icon: '📊', title: 'Structured JSON Output Enforcement', desc: 'System prompt defines a strict JSON schema with jobs[], roadmap{}, jobSearchStrategy{}, and responsibleAI{}. The model cannot return free-text — every field is typed and validated.' },
                { icon: '💼', title: '4 Job Recommendations (Indian IT)', desc: 'Each job includes: title, company tier, ₹ LPA salary range, match score (0–100) with bar, growth outlook, top hiring cities in India, skills to develop, and certification boost advice.' },
                { icon: '🗺️', title: 'Phased Learning Roadmap', desc: '3–4 phase plan with goals, resources (Indian YouTube channels, bootcamps), and an "Indian Context" callout per phase covering things like local meetups, AmbitionBox salary data, and bond transition planning.' },
                { icon: '🔎', title: 'Indian Job Search Strategy Tab', desc: 'Returns platform recommendations (Naukri, Cutshort, Instahyre, AngelList India), tailored resume tips for Indian IT hiring, and interview prep covering aptitude → DSA → system design → HR rounds.' },
                { icon: '🛡️', title: 'Responsible AI Audit Tab', desc: 'Displays confidence score, bias detection flags, fairness note, transparency notes, safeguards applied, bond warnings, and a disclaimer — all returned by the model as part of its structured output.' },
              ].map(item => (
                <div key={item.title} className="flex gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Responsible AI */}
          <div>
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">⚖️ Responsible AI Features</h3>
            <div className="space-y-2">
              {[
                { icon: '⚖️', principle: 'Fairness', color: 'text-blue-600 dark:text-blue-400', desc: 'System prompt explicitly instructs the model to never make assumptions based on caste, religion, gender, college tier, region (North/South India bias), or age. Recommendations are grounded in skills and goals only. The model self-audits this and returns a fairness note.' },
                { icon: '🔍', principle: 'Transparency', color: 'text-purple-600 dark:text-purple-400', desc: 'Every job recommendation includes a "Why this match" explanation — the model must justify each suggestion based on skills, not just return a list. The system prompt also surfaces the model\'s reasoning in transparencyNotes[].' },
                { icon: '🔒', principle: 'Safety (Output Validation)', color: 'text-green-600 dark:text-green-400', desc: 'JSON schema enforcement via response_format: json_object prevents free-form harmful outputs. The model must return structured, typed fields — it cannot output misleading salary claims or harmful advice outside the schema.' },
                { icon: '🌍', principle: 'Inclusiveness', color: 'text-teal-600 dark:text-teal-400', desc: 'System prompt mandates recommendations spanning multiple company tiers — not just IIT-gated product companies. Explicitly states: "Do not gatekeep product companies for non-IIT/NIT candidates." All career paths are treated equally.' },
                { icon: '📊', principle: 'Accountability', color: 'text-amber-600 dark:text-amber-400', desc: 'Model returns a confidenceScore (0–100) with every response, acknowledging uncertainty. Salary ranges include city-level caveats. Disclaimer field is mandatory in the schema.' },
                { icon: '⚠️', principle: 'Bond & Safety Warnings', color: 'text-red-600 dark:text-red-400', desc: 'Unique to Indian IT context — system prompt instructs the model to flag bond traps in service companies (TCS/Infosys notice periods, relocation bonds) and warn against predatory hiring practices. Returned in bondWarnings[].' },
              ].map(item => (
                <div key={item.principle} className="flex gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className={`text-sm font-semibold ${item.color}`}>{item.principle}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech stack */}
          <div>
            <h3 className="font-semibold text-base mb-3">🔧 Tech & Concepts Used</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['Azure OpenAI', 'gpt-5-mini via AzureOpenAI SDK'],
                ['Next.js API Route', '/api/security/career-advisor'],
                ['JSON Schema Enforcement', 'response_format: json_object'],
                ['Role Prompting', 'Indian IT Career Advisor persona'],
                ['Few-shot in System Prompt', 'Company tier examples & LPA ranges'],
                ['Structured Output', 'jobs[], roadmap{}, responsibleAI{}'],
                ['Responsible AI Guardrails', 'Bias, fairness, bond warnings'],
                ['React State', 'Multi-tab results, profile form, modal'],
              ].map(([tech, desc]) => (
                <div key={tech} className="bg-muted/40 rounded-lg p-2.5 border border-border">
                  <p className="text-xs font-semibold">{tech}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How it connects to the course */}
          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/60 rounded-xl p-4">
            <h3 className="font-semibold text-sm text-indigo-800 dark:text-indigo-200 mb-2">🔗 How It Connects to What We Learned</h3>
            <ul className="space-y-1.5">
              {[
                'Role Prompting (Prompt Engineering) → System prompt gives the model an Indian IT Advisor persona',
                'Few-Shot Examples → Company tier definitions + LPA salary bands in the system prompt',
                'Structured Output / Template Pattern → JSON schema enforced via response_format',
                'Context Engineering → Compact, high-signal profile sent as user message — no irrelevant tokens',
                'Responsible AI (4-Stage Lifecycle) → Map risks (bias), Measure (confidence score), Mitigate (guardrails), Manage (disclaimer)',
                'Guardrails → Output validation via schema + bias flags + bond warnings in responsibleAI{}',
                'OWASP LLM01 Prompt Injection → System prompt boundaries prevent the model from being hijacked by user input',
              ].map((point, i) => (
                <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                  <span className="text-indigo-400 flex-shrink-0 font-bold">→</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="px-6 pb-6">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80
    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
    : score >= 60
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
    : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
  return <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${color}`}>{score}% match</span>
}

function GrowthBadge({ outlook }: { outlook: 'High' | 'Medium' | 'Low' }) {
  const s = {
    High: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    Low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  }
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s[outlook]}`}>{outlook} growth</span>
}

function TierBadge({ tier }: { tier: string }) {
  const key = Object.keys(TIER_COLORS).find(k => tier?.includes(k)) ?? 'Any'
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIER_COLORS[key]}`}>{tier}</span>
}

type TabId = 'jobs' | 'roadmap' | 'job-search' | 'responsible-ai'

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CareerAdvisorPage() {
  const [profile, setProfile] = useState<Profile>({
    currentRole: '', experienceLevel: '', skills: [], interests: [],
    careerGoal: '', workStyle: '', preferredCity: '', companyType: '', domain: '',
  })
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AdvisorResult | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('jobs')
  const [showPrompt, setShowPrompt] = useState(false)
  const [showExplain, setShowExplain] = useState(false)

  const toggle = <K extends 'skills' | 'interests'>(key: K, val: string) => {
    setProfile(p => ({
      ...p,
      [key]: (p[key] as string[]).includes(val)
        ? (p[key] as string[]).filter(v => v !== val)
        : [...(p[key] as string[]), val],
    }))
  }

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !profile.skills.includes(s)) { setProfile(p => ({ ...p, skills: [...p.skills, s] })); setSkillInput('') }
  }

  const handleSubmit = async () => {
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch('/api/security/career-advisor', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data); setActiveTab('jobs')
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
    finally { setLoading(false) }
  }

  const canSubmit = profile.currentRole.trim() || profile.skills.length > 0

  return (
    <div className="space-y-5">

      {showExplain && <ExplainModal onClose={() => setShowExplain(false)} />}

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/40 dark:to-red-950/40 border-2 border-orange-200 dark:border-orange-800/50 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-orange-200 dark:border-orange-700">
            🇮🇳 INDIAN IT MARKET · END-TO-END RESPONSIBLE AI DEMO
          </div>
          <button
            onClick={() => setShowExplain(true)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-300 dark:border-orange-700 bg-white dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-semibold hover:bg-orange-50 dark:hover:bg-orange-900/40 transition-colors"
          >
            <span className="text-sm">💡</span> What I Built
          </button>
        </div>
        <h1 className="text-3xl font-bold mb-2">Career Advisor AI</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Built for the <strong>Indian IT job market</strong> — LPA salaries, Tier-1/MNC/Startup paths, BFSI/cloud domains,
          Indian cities, and Naukri/LinkedIn strategy. Combines <strong>role prompting</strong>, <strong>structured JSON output</strong>,
          and <strong>Responsible AI guardrails</strong> including bias detection and bond warnings.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {['₹ LPA Salaries', 'Tier-1 / MNC / Startup', 'BFSI & Cloud Domains', 'Bond Warnings', 'Naukri Strategy', 'Bias Detection', 'Fairness Check', 'JSON Schema'].map(c => (
            <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-white dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 font-medium">{c}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ── Profile Form ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
              Your IT Profile
            </h2>

            {/* Role */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Current Role / Designation</label>
              <input value={profile.currentRole} onChange={e => setProfile(p => ({ ...p, currentRole: e.target.value }))}
                placeholder="e.g. Java Developer, Fresher, Data Analyst, QA Engineer"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Experience</label>
              <div className="flex flex-wrap gap-1.5">
                {EXPERIENCE_LEVELS.map(l => (
                  <button key={l} onClick={() => setProfile(p => ({ ...p, experienceLevel: l }))}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${profile.experienceLevel === l ? 'bg-orange-500 text-white border-orange-500' : 'border-border hover:bg-muted/50'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Skills <span className="text-muted-foreground/60">({profile.skills.length} selected)</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {SKILL_SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => toggle('skills', s)}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${profile.skills.includes(s) ? 'bg-blue-500 text-white border-blue-500' : 'border-border hover:bg-muted/50'}`}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()}
                  placeholder="Add custom skill…"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-blue-300"
                />
                <button onClick={addSkill} className="px-3 py-1.5 text-xs rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">Add</button>
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Interests / Areas</label>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_SUGGESTIONS.map(i => (
                  <button key={i} onClick={() => toggle('interests', i)}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${profile.interests.includes(i) ? 'bg-purple-500 text-white border-purple-500' : 'border-border hover:bg-muted/50'}`}>
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* Company type */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Company Type Preference</label>
              <div className="flex flex-col gap-1.5">
                {COMPANY_TYPES.map(c => (
                  <button key={c} onClick={() => setProfile(p => ({ ...p, companyType: c }))}
                    className={`text-xs px-3 py-1.5 rounded-lg border text-left transition-colors ${profile.companyType === c ? 'bg-indigo-500 text-white border-indigo-500' : 'border-border hover:bg-muted/50'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Domain */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Preferred Domain</label>
              <div className="flex flex-wrap gap-1.5">
                {DOMAINS.map(d => (
                  <button key={d} onClick={() => setProfile(p => ({ ...p, domain: d }))}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${profile.domain === d ? 'bg-teal-500 text-white border-teal-500' : 'border-border hover:bg-muted/50'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* City */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Preferred City</label>
              <div className="flex flex-wrap gap-1.5">
                {CITIES.map(c => (
                  <button key={c} onClick={() => setProfile(p => ({ ...p, preferredCity: c }))}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${profile.preferredCity === c ? 'bg-green-500 text-white border-green-500' : 'border-border hover:bg-muted/50'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Work style */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Work Style</label>
              <div className="flex flex-wrap gap-1.5">
                {WORK_STYLES.map(w => (
                  <button key={w} onClick={() => setProfile(p => ({ ...p, workStyle: w }))}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${profile.workStyle === w ? 'bg-slate-600 text-white border-slate-600' : 'border-border hover:bg-muted/50'}`}>
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Career goal */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Career Goal</label>
              <textarea value={profile.careerGoal} onChange={e => setProfile(p => ({ ...p, careerGoal: e.target.value }))} rows={2}
                placeholder="e.g. Move from service company to product company, become a Data Engineer, crack FAANG..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            <button onClick={handleSubmit} disabled={loading || !canSubmit}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-colors disabled:opacity-40">
              {loading ? <><Spinner /> Analysing Indian IT market…</> : '🎯 Get Indian IT Career Advice'}
            </button>

            {error && (
              <div className="rounded-lg px-3 py-2.5 text-xs bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300">❌ {error}</div>
            )}
          </div>

          {/* RA principles */}
          <div className="rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-sm font-semibold">🛡️ Responsible AI Applied</h3>
            {[
              { icon: '⚖️', label: 'Fairness', desc: 'No caste, college-tier, gender, or region bias' },
              { icon: '🔍', label: 'Transparency', desc: 'Every recommendation includes a "why" based on skills only' },
              { icon: '⚠️', label: 'Bond Warnings', desc: 'Flags service-company bond traps and predatory practices' },
              { icon: '📊', label: 'Accountability', desc: 'Confidence score + LPA range with city-level caveats' },
            ].map(p => (
              <div key={p.label} className="flex gap-3 items-start">
                <span className="text-base flex-shrink-0">{p.icon}</span>
                <div>
                  <p className="text-xs font-semibold">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* System prompt viewer */}
          <div className="rounded-xl border border-border">
            <button onClick={() => setShowPrompt(p => !p)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/40 rounded-xl transition-colors">
              <span>🔍 View system prompt</span>
              <span className="text-muted-foreground">{showPrompt ? '▲' : '▼'}</span>
            </button>
            {showPrompt && (
              <div className="px-4 pb-4 border-t border-border pt-3">
                <pre className="text-xs bg-slate-900 text-slate-100 rounded-lg p-3 whitespace-pre-wrap leading-relaxed overflow-auto max-h-64">{`You are a Career Advisor AI specialised in the Indian IT job market.

INDIAN IT CONTEXT:
- Salaries in LPA (₹ Lakhs Per Annum)
- Company tiers: Tier-1 Service (TCS/Infosys/Wipro/HCL)
  MNC Product (Microsoft/Google/Amazon/SAP Labs)
  Indian Unicorn (Flipkart/Zomato/Razorpay/Freshworks)
  Mid-tier IT (Mphasis/Hexaware/Coforge)
- Cities: Bengaluru, Hyderabad, Pune, Chennai, Mumbai, NCR
- Popular skills: Java, Spring Boot, .NET, SAP, Selenium, etc.
- Platforms: Naukri.com, LinkedIn, Instahyre, Cutshort

RESPONSIBLE AI:
- No caste/college/gender/region bias
- Explain every recommendation WHY
- Flag bond periods and salary exaggerations
- Confidence score with LPA caveats
- Identical output regardless of demographics`}</pre>
              </div>
            )}
          </div>
        </div>

        {/* ── Results ── */}
        <div className="lg:col-span-3 space-y-4">
          {!result && !loading && (
            <div className="rounded-xl border border-dashed border-border p-10 text-center space-y-3 flex flex-col items-center justify-center min-h-96">
              <span className="text-4xl">🇮🇳</span>
              <p className="font-semibold text-sm">Fill your profile and get Indian IT career advice</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Get LPA salary bands, Tier-1 vs product company paths, roadmap with Indian resources,
                Naukri/LinkedIn strategy, and Responsible AI guardrails.
              </p>
            </div>
          )}

          {loading && (
            <div className="rounded-xl border border-border p-10 flex flex-col items-center justify-center gap-4 min-h-96">
              <Spinner />
              <div className="text-center space-y-1.5 text-xs text-muted-foreground">
                <p className="font-semibold text-sm text-foreground mb-2">Analysing Indian IT market…</p>
                <p>✓ Mapping skills to Indian IT roles</p>
                <p>✓ Calculating LPA salary bands</p>
                <p>✓ Checking Tier-1 / MNC / Startup fit</p>
                <p>✓ Building roadmap with Indian resources</p>
                <p>✓ Running bias & bond-warning checks</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-1 bg-muted/40 rounded-lg p-1">
                {([
                  { id: 'jobs', label: '💼 Jobs', count: result.jobs?.length },
                  { id: 'roadmap', label: '🗺️ Roadmap', count: result.roadmap?.phases?.length },
                  { id: 'job-search', label: '🔎 Job Search', count: null },
                  { id: 'responsible-ai', label: '🛡️ Safe AI', count: null },
                ] as { id: TabId; label: string; count: number | null }[]).map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 text-xs font-medium px-2 py-2 rounded-md transition-colors ${activeTab === tab.id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                    {tab.label}
                    {tab.count != null && <span className="ml-1 text-[10px] bg-muted px-1.5 py-0.5 rounded-full">{tab.count}</span>}
                  </button>
                ))}
              </div>

              {/* ── Jobs Tab ── */}
              {activeTab === 'jobs' && (
                <div className="space-y-3">
                  {result.jobs?.map((job, i) => (
                    <div key={i} className="rounded-xl border border-border p-5 space-y-3 hover:bg-muted/20 transition-colors">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className="font-semibold text-base">{job.title}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <TierBadge tier={job.companyTier} />
                            <span className="text-sm font-bold text-green-700 dark:text-green-400">{job.salaryRange}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                          <ScoreBadge score={job.matchScore} />
                          <GrowthBadge outlook={job.growthOutlook} />
                        </div>
                      </div>

                      {/* Match bar */}
                      <div className="space-y-1">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${job.matchScore >= 80 ? 'bg-green-500' : job.matchScore >= 60 ? 'bg-amber-500' : 'bg-red-400'}`}
                            style={{ width: `${job.matchScore}%` }} />
                        </div>
                      </div>

                      {/* Hiring cities */}
                      {job.topHiringCities?.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">📍 Top hiring:</span>
                          {job.topHiringCities.map(city => (
                            <span key={city} className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border">{city}</span>
                          ))}
                        </div>
                      )}

                      {/* Why match */}
                      <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">🔍 Why this match (Transparency)</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{job.whyMatch}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Skills needed */}
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1.5">Skills to develop</p>
                          <div className="flex flex-wrap gap-1">
                            {job.keySkillsNeeded?.map(skill => (
                              <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border">{skill}</span>
                            ))}
                          </div>
                        </div>
                        {/* Cert boost */}
                        {job.certificationBoost && (
                          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 rounded-lg p-2.5">
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">🏆 Cert Boost</p>
                            <p className="text-xs text-muted-foreground">{job.certificationBoost}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Roadmap Tab ── */}
              {activeTab === 'roadmap' && (
                <div className="space-y-4">
                  <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/50 rounded-lg px-4 py-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                      🗺️ {result.roadmap?.timelineMonths}-month roadmap · {result.roadmap?.phases?.length} phases
                    </p>
                  </div>
                  {result.roadmap?.phases?.map((phase, i) => {
                    const colors = ['border-blue-400', 'border-purple-400', 'border-green-400', 'border-amber-400']
                    const bgs = ['bg-blue-50/50 dark:bg-blue-950/20', 'bg-purple-50/50 dark:bg-purple-950/20', 'bg-green-50/50 dark:bg-green-950/20', 'bg-amber-50/50 dark:bg-amber-950/20']
                    const badges = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500']
                    return (
                      <div key={i} className={`rounded-xl border-l-4 ${colors[i % 4]} ${bgs[i % 4]} border border-border p-5 space-y-3`}>
                        <div className="flex items-center gap-3">
                          <span className={`h-7 w-7 rounded-full ${badges[i % 4]} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>{phase.phase}</span>
                          <div>
                            <h4 className="font-semibold text-sm">{phase.title}</h4>
                            <p className="text-xs text-muted-foreground">{phase.durationWeeks} weeks</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Goals</p>
                          <ul className="space-y-1">{phase.goals?.map((g, j) => (
                            <li key={j} className="text-xs flex gap-2"><span className="text-green-500 flex-shrink-0">✓</span>{g}</li>
                          ))}</ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Resources</p>
                          <ul className="space-y-1">{phase.resources?.map((r, j) => (
                            <li key={j} className="text-xs flex gap-2 text-muted-foreground"><span className="flex-shrink-0">📚</span>{r}</li>
                          ))}</ul>
                        </div>
                        {phase.indianContext && (
                          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200/50 rounded-lg p-2.5">
                            <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-0.5">🇮🇳 Indian Context</p>
                            <p className="text-xs text-muted-foreground">{phase.indianContext}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* ── Job Search Strategy Tab ── */}
              {activeTab === 'job-search' && result.jobSearchStrategy && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-border p-5 space-y-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">🌐 Job Platforms</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.jobSearchStrategy.platforms?.map((p, i) => (
                        <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 text-blue-700 dark:text-blue-400 font-medium">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border p-5 space-y-3">
                    <h3 className="font-semibold text-sm">📄 Resume Tips for Indian IT</h3>
                    <ul className="space-y-2">{result.jobSearchStrategy.resumeTips?.map((t, i) => (
                      <li key={i} className="flex gap-2 text-xs bg-muted/30 rounded-lg p-2.5">
                        <span className="text-blue-500 flex-shrink-0">→</span>{t}
                      </li>
                    ))}</ul>
                  </div>
                  <div className="rounded-xl border border-border p-5 space-y-3">
                    <h3 className="font-semibold text-sm">🎯 Interview Prep (Indian IT Style)</h3>
                    <ul className="space-y-2">{result.jobSearchStrategy.interviewPrep?.map((t, i) => (
                      <li key={i} className="flex gap-2 text-xs bg-muted/30 rounded-lg p-2.5">
                        <span className="text-green-500 flex-shrink-0">✓</span>{t}
                      </li>
                    ))}</ul>
                  </div>
                </div>
              )}

              {/* ── Responsible AI Tab ── */}
              {activeTab === 'responsible-ai' && result.responsibleAI && (
                <div className="space-y-4">
                  {/* Confidence */}
                  <div className="rounded-xl border border-border p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">Confidence Score</h3>
                      <span className={`text-xl font-bold ${result.responsibleAI.confidenceScore >= 80 ? 'text-green-600' : result.responsibleAI.confidenceScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                        {result.responsibleAI.confidenceScore}%
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${result.responsibleAI.confidenceScore >= 80 ? 'bg-green-500' : result.responsibleAI.confidenceScore >= 60 ? 'bg-amber-500' : 'bg-red-400'}`}
                        style={{ width: `${result.responsibleAI.confidenceScore}%` }} />
                    </div>
                  </div>

                  {/* Bond warnings */}
                  {result.responsibleAI.bondWarnings?.length > 0 && (
                    <div className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 p-5 space-y-2">
                      <h3 className="font-semibold text-sm flex items-center gap-2 text-amber-800 dark:text-amber-200">
                        ⚠️ Bond & Offer Warnings
                      </h3>
                      {result.responsibleAI.bondWarnings.map((w, i) => (
                        <div key={i} className="flex gap-2 text-xs border border-amber-200 dark:border-amber-700 rounded-lg p-2.5 bg-white/60 dark:bg-black/20">
                          <span className="flex-shrink-0">🔔</span>{w}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bias detection */}
                  <div className="rounded-xl border border-border p-5 space-y-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      ⚖️ Bias Detection
                      {result.responsibleAI.biasFlags?.length === 0
                        ? <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-2 py-0.5 rounded-full">Clean</span>
                        : <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-0.5 rounded-full">{result.responsibleAI.biasFlags.length} flags</span>}
                    </h3>
                    {result.responsibleAI.biasFlags?.length === 0
                      ? <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2"><span>✅</span> No caste, college-tier, gender, or regional bias detected.</p>
                      : result.responsibleAI.biasFlags.map((f, i) => (
                        <div key={i} className="flex gap-2 text-xs bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5">
                          <span>⚠️</span>{f}
                        </div>
                      ))
                    }
                    <div className="bg-muted/40 rounded-lg p-3">
                      <p className="text-xs font-semibold mb-1">Fairness Note</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{result.responsibleAI.fairnessNote}</p>
                    </div>
                  </div>

                  {/* Transparency */}
                  <div className="rounded-xl border border-border p-5 space-y-3">
                    <h3 className="font-semibold text-sm">🔍 Transparency Notes</h3>
                    {result.responsibleAI.transparencyNotes?.map((n, i) => (
                      <div key={i} className="flex gap-2 text-xs bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 rounded-lg p-2.5">
                        <span className="text-blue-500 flex-shrink-0">ℹ️</span>{n}
                      </div>
                    ))}
                  </div>

                  {/* Safeguards */}
                  <div className="rounded-xl border border-border p-5 space-y-2">
                    <h3 className="font-semibold text-sm">🔒 Safeguards Applied</h3>
                    {result.responsibleAI.safeguardsApplied?.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs"><span className="text-green-500 flex-shrink-0">✓</span>{s}</div>
                    ))}
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-xs font-semibold mb-1">📋 Disclaimer</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{result.responsibleAI.disclaimer}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
