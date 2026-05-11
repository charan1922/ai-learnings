'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bot, Plus, Search, RefreshCw, AlertTriangle, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Upload, History } from 'lucide-react';

type TicketRow = {
  id: number;
  ticket_id: string;
  title: string;
  description: string;
  category: string;
  resolution: string;
  priority: string;
  status: string;
  vector_id: string | null;
  embedded_at: string | null;
  created_at: string;
};

type SimilarTicket = {
  ticketId: string;
  title: string;
  category: string;
  priority: string;
  resolution: string;
  score: number;
};

type ClassifyResult = {
  category: string;
  confidence: number;
  shouldEscalate: boolean;
  topMatches: SimilarTicket[];
  suggestedResolution: string;
  latencyMs: number;
};

type SeedResult = {
  message: string;
  total: number;
  inserted: number;
  embedded: number;
  deletedVectors: number;
  mode: 'full' | 'incremental';
  source: string;
  namespace: string;
  blobVersionId: string | null;
  documentVersion: string;
  errors: string[];
};

type BlobVersion = {
  name: string;
  versionId: string;
  lastModified: string;
  size: number;
};

type ITNamespace = {
  name: string;
  version: number | null;
  vectorCount: number;
  isActive: boolean;
};

type ITConfig = {
  active: string;
  previous: string | null;
  promotedAt: string | null;
  source: 'env' | 'runtime';
  namespaces: ITNamespace[];
};

type UploadResult = {
  blobName: string;
  versionId: string;
  uploadedAt: string;
  totalVersions: number;
  versions: BlobVersion[];
};

const CATEGORIES = ['Infrastructure', 'Application', 'Security', 'Database', 'Storage', 'Network', 'Access Management'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const EVAL_PAIRS = [
  {
    question: 'The web server is running at 100% CPU and response times are degraded. What should I do?',
    expectedAnswer: 'Provision additional resources or scale up the web server to resolve high CPU utilization.',
  },
  {
    question: 'Users cannot connect to the database. Connection timeouts are occurring on production.',
    expectedAnswer: 'Check for deadlocks and increase the maximum number of database connections to resolve timeout issues.',
  },
  {
    question: 'An employee account was locked out after multiple failed login attempts. How do I resolve it?',
    expectedAnswer: 'Enforce Multi-Factor Authentication on the account and review access logs for suspicious activity.',
  },
];
const PAGE_SIZES = [10, 20, 50, 100];

const PRIORITY_COLOR: Record<string, string> = {
  Low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const CATEGORY_COLOR: Record<string, string> = {
  Infrastructure: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Application: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Security: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  Database: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Storage: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  Network: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  'Access Management': 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
};

function Pagination({
  page, totalPages, pageSize, total,
  onPage, onPageSize,
}: {
  page: number; totalPages: number; pageSize: number; total: number;
  onPage: (p: number) => void; onPageSize: (s: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  // Build page window: always show first, last, and up to 3 around current
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border text-sm">
      <div className="text-muted-foreground text-xs">
        {total === 0 ? 'No results' : `Showing ${from}–${to} of ${total} tickets`}
      </div>

      <div className="flex items-center gap-1">
        <button onClick={() => onPage(1)} disabled={page === 1} className="p-1 rounded hover:bg-accent disabled:opacity-30">
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button onClick={() => onPage(page - 1)} disabled={page === 1} className="p-1 rounded hover:bg-accent disabled:opacity-30">
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-2 text-muted-foreground">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`min-w-[2rem] h-8 px-2 rounded text-xs font-medium transition-colors ${
                p === page ? 'bg-indigo-600 text-white' : 'hover:bg-accent'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button onClick={() => onPage(page + 1)} disabled={page === totalPages || totalPages === 0} className="p-1 rounded hover:bg-accent disabled:opacity-30">
          <ChevronRight className="h-4 w-4" />
        </button>
        <button onClick={() => onPage(totalPages)} disabled={page === totalPages || totalPages === 0} className="p-1 rounded hover:bg-accent disabled:opacity-30">
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Rows per page:</span>
        <select
          value={pageSize}
          onChange={e => onPageSize(Number(e.target.value))}
          className="border border-border rounded px-2 py-1 bg-background text-xs"
        >
          {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
}

export default function AgentITPage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'submit' | 'classify' | 'versions'>('browse');

  // Browse state
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [total, setTotal] = useState(0);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [browseError, setBrowseError] = useState('');
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  // Namespace / embedding config state
  const [itConfig, setItConfig] = useState<ITConfig | null>(null);
  const [switchingNamespace, setSwitchingNamespace] = useState('');
  const [switchLoading, setSwitchLoading] = useState(false);
  const [switchResult, setSwitchResult] = useState<{ previousActive: string; newActive: string } | null>(null);

  // Index versioning (#3) + re-indexing mode (#5) state
  const [candidateNamespace, setCandidateNamespace] = useState('it-tickets-v2');
  const [seedMode, setSeedMode] = useState<'incremental' | 'full'>('full');
  const [blobSeedMode, setBlobSeedMode] = useState<'incremental' | 'full'>('incremental');
  const [candidateSeedLoading, setCandidateSeedLoading] = useState(false);
  const [candidateSeedResult, setCandidateSeedResult] = useState<SeedResult | null>(null);
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [promoteResult, setPromoteResult] = useState<{ previousActive: string; newActive: string; promotedAt: string } | null>(null);
  const [rollbackLoading, setRollbackLoading] = useState(false);
  const [rollbackResult, setRollbackResult] = useState<{ previousActive: string; newActive: string; promotedAt: string } | null>(null);

  // Eval (#6) state
  type EvalPairResult = {
    question: string; expectedAnswer: string; actualAnswer: string;
    correct: boolean; reason: string; latencyMs: number; topMatchScore: number;
  };
  type EvalResult = {
    namespace: string; recall: number; accuracy: number;
    avgLatencyMs: number; pairs: EvalPairResult[]; passed: boolean;
  };
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const [evalError, setEvalError] = useState('');

  // Versions / upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [blobVersions, setBlobVersions] = useState<BlobVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<BlobVersion | null>(null);
  const [seedFromBlobLoading, setSeedFromBlobLoading] = useState(false);
  const [seedFromBlobResult, setSeedFromBlobResult] = useState<SeedResult | null>(null);

  // Submit state
  const [form, setForm] = useState({ title: '', description: '', category: '', resolution: '', priority: 'Medium' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ ticketId: string; vectorId: string } | null>(null);
  const [submitError, setSubmitError] = useState('');

  // Classify state
  const [classifyForm, setClassifyForm] = useState({ title: '', description: '' });
  const [classifyLoading, setClassifyLoading] = useState(false);
  const [classifyResult, setClassifyResult] = useState<ClassifyResult | null>(null);
  const [classifyError, setClassifyError] = useState('');

  const loadTickets = useCallback(async (p = page, ps = pageSize) => {
    setBrowseLoading(true);
    setBrowseError('');
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.set('category', filterCategory);
      if (filterPriority) params.set('priority', filterPriority);
      params.set('limit', String(ps));
      params.set('offset', String((p - 1) * ps));
      const res = await fetch(`/api/agent-it/tickets?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTickets(data.tickets);
      setTotal(data.total);
    } catch (err) {
      setBrowseError(err instanceof Error ? err.message : String(err));
    } finally {
      setBrowseLoading(false);
    }
  }, [filterCategory, filterPriority, page, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filterCategory, filterPriority]);

  useEffect(() => {
    if (activeTab === 'browse') loadTickets(page, pageSize);
  }, [activeTab, page, pageSize, filterCategory, filterPriority]); // eslint-disable-line

  function handlePageChange(p: number) {
    setPage(p);
  }

  function handlePageSizeChange(ps: number) {
    setPageSize(ps);
    setPage(1);
  }

  const loadITConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/agent-it/config');
      const data = await res.json();
      if (res.ok) setItConfig(data);
    } catch {}
  }, []);

  useEffect(() => {
    loadITConfig();
  }, [loadITConfig]);

  async function handleSwitchNamespace(ns: string) {
    setSwitchLoading(true);
    setSwitchResult(null);
    try {
      const res = await fetch('/api/agent-it/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namespace: ns }),
      });
      const data = await res.json();
      if (res.ok) {
        setSwitchResult({ previousActive: data.previousActive, newActive: data.newActive });
        loadITConfig();
      }
    } finally {
      setSwitchLoading(false);
    }
  }

  async function handleSeedCandidate() {
    if (!candidateNamespace.trim()) return;
    setCandidateSeedLoading(true);
    setCandidateSeedResult(null);
    try {
      const latest = blobVersions[0];
      const body: Record<string, string> = {
        namespace: candidateNamespace.trim(),
        documentVersion: `v${(new Date()).toISOString().slice(0, 10)}`,
        mode: seedMode,
      };
      if (latest) {
        body.blobName = latest.name;
        body.blobVersionId = latest.versionId;
      }
      const res = await fetch('/api/agent-it/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setCandidateSeedResult(data);
      if (res.ok) loadITConfig();
    } finally {
      setCandidateSeedLoading(false);
    }
  }

  async function handlePromote() {
    if (!candidateNamespace.trim()) return;
    setPromoteLoading(true);
    setPromoteResult(null);
    try {
      const res = await fetch('/api/agent-it/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namespace: candidateNamespace.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setPromoteResult({ previousActive: data.previousActive, newActive: data.newActive, promotedAt: data.promotedAt });
        loadITConfig();
      }
    } finally {
      setPromoteLoading(false);
    }
  }

  async function handleRollback() {
    if (!itConfig?.previous) return;
    setRollbackLoading(true);
    setRollbackResult(null);
    try {
      const res = await fetch('/api/agent-it/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namespace: itConfig.previous }),
      });
      const data = await res.json();
      if (res.ok) {
        setRollbackResult({ previousActive: data.previousActive, newActive: data.newActive, promotedAt: data.promotedAt });
        loadITConfig();
      }
    } finally {
      setRollbackLoading(false);
    }
  }

  async function handleEval() {
    setEvalLoading(true);
    setEvalResult(null);
    setEvalError('');
    try {
      const res = await fetch('/api/agent-it/eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namespace: candidateNamespace.trim(), pairs: EVAL_PAIRS }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEvalResult(data);
    } catch (err) {
      setEvalError(err instanceof Error ? err.message : String(err));
    } finally {
      setEvalLoading(false);
    }
  }

  const loadBlobVersions = useCallback(async (blobName: string) => {
    setVersionsLoading(true);
    try {
      const res = await fetch(`/api/agent-it/blob/versions?blob=${encodeURIComponent(blobName)}`);
      const data = await res.json();
      if (res.ok) setBlobVersions(data.versions ?? []);
    } finally {
      setVersionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'versions') loadBlobVersions('IT_Tickets_v1.xlsx');
  }, [activeTab, loadBlobVersions]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile) return;
    setUploadLoading(true);
    setUploadResult(null);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      const res = await fetch('/api/agent-it/blob/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUploadResult(data);
      setBlobVersions(data.versions ?? []);
      setUploadFile(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploadLoading(false);
    }
  }

  async function handleSeedFromBlob(version: BlobVersion) {
    setSeedFromBlobLoading(true);
    setSeedFromBlobResult(null);
    try {
      const res = await fetch('/api/agent-it/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blobName: version.name,
          blobVersionId: version.versionId,
          documentVersion: `blob-${version.versionId.slice(0, 8)}`,
          mode: blobSeedMode,
        }),
      });
      const data = await res.json();
      setSeedFromBlobResult(data);
    } finally {
      setSeedFromBlobLoading(false);
    }
  }

  async function handleSeed() {
    setSeedLoading(true);
    setSeedResult(null);
    try {
      const res = await fetch('/api/agent-it/seed', { method: 'POST' });
      const data = await res.json();
      setSeedResult(data);
      if (res.ok) { setPage(1); loadTickets(1, pageSize); }
    } finally {
      setSeedLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitResult(null);
    setSubmitError('');
    try {
      const res = await fetch('/api/agent-it/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitResult({ ticketId: data.ticketId, vectorId: data.vectorId });
      setForm({ title: '', description: '', category: '', resolution: '', priority: 'Medium' });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleClassify(e: React.FormEvent) {
    e.preventDefault();
    setClassifyLoading(true);
    setClassifyResult(null);
    setClassifyError('');
    try {
      const res = await fetch('/api/agent-it/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classifyForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setClassifyResult(data);
    } catch (err) {
      setClassifyError(err instanceof Error ? err.message : String(err));
    } finally {
      setClassifyLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
          <Bot className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Agent IT</h1>
          <p className="text-sm text-muted-foreground">AI-powered IT ticket routing &amp; resolution</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['browse', 'submit', 'classify', 'versions'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'browse' ? 'Browse Tickets' : tab === 'submit' ? 'Submit New' : tab === 'classify' ? 'Classify & Route' : 'Source Versions'}
          </button>
        ))}
      </div>

      {/* ── BROWSE TAB ── */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          {/* Filters + actions */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2 flex-wrap items-center">
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="text-sm border border-border rounded px-3 py-1.5 bg-background"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="text-sm border border-border rounded px-3 py-1.5 bg-background"
              >
                <option value="">All Priorities</option>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
              <button
                onClick={() => loadTickets(page, pageSize)}
                className="flex items-center gap-1 text-sm px-3 py-1.5 border border-border rounded hover:bg-accent"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>
            <button
              onClick={handleSeed}
              disabled={seedLoading}
              className="flex items-center gap-2 text-sm px-4 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {seedLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              {seedLoading ? 'Seeding...' : 'Seed from Excel'}
            </button>
          </div>

          {seedResult && (
            <div className={`text-sm px-4 py-3 rounded border ${seedResult.errors?.length ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800' : 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'}`}>
              {seedResult.message} — <strong>{seedResult.inserted}</strong> inserted, <strong>{seedResult.embedded}</strong> embedded out of <strong>{seedResult.total}</strong> total.
              {seedResult.errors?.length > 0 && <div className="mt-1 text-yellow-700 dark:text-yellow-300 text-xs">Errors: {seedResult.errors.join('; ')}</div>}
            </div>
          )}

          {browseError && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-4 py-3 rounded">{browseError}</div>
          )}

          {browseLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Bot className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No tickets yet. Click <strong>Seed from Excel</strong> to load the dataset.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      {['Ticket ID', 'Title', 'Category', 'Priority', 'Status', 'Embedded', 'Created'].map(h => (
                        <th key={h} className="text-left px-3 py-2 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(t => (
                      <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground whitespace-nowrap">{t.ticket_id}</td>
                        <td className="px-3 py-2 max-w-xs truncate" title={t.title}>{t.title}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLOR[t.category] ?? 'bg-muted text-muted-foreground'}`}>{t.category}</span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[t.priority] ?? ''}`}>{t.priority}</span>
                        </td>
                        <td className="px-3 py-2 capitalize text-muted-foreground text-xs">{t.status}</td>
                        <td className="px-3 py-2">
                          {t.vector_id
                            ? <CheckCircle className="h-4 w-4 text-green-500" />
                            : <XCircle className="h-4 w-4 text-muted-foreground/40" />}
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{new Date(t.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                total={total}
                onPage={handlePageChange}
                onPageSize={handlePageSizeChange}
              />
            </>
          )}
        </div>
      )}

      {/* ── SUBMIT TAB ── */}
      {activeTab === 'submit' && (
        <div className="max-w-xl space-y-4">
          <p className="text-sm text-muted-foreground">Submit a new ticket — saved to PostgreSQL and embedded into Pinecone automatically.</p>

          {submitResult && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 px-4 py-3 rounded text-sm space-y-1">
              <div className="flex items-center gap-2 font-medium text-green-700 dark:text-green-300">
                <CheckCircle className="h-4 w-4" /> Ticket created &amp; embedded
              </div>
              <div className="font-mono text-xs text-muted-foreground">ID: {submitResult.ticketId}</div>
              <div className="font-mono text-xs text-muted-foreground">Vector: {submitResult.vectorId}</div>
            </div>
          )}

          {submitError && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-4 py-3 rounded text-sm text-red-700 dark:text-red-300">{submitError}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Web Server - High CPU Utilization"
                className="w-full text-sm border border-border rounded px-3 py-2 bg-background"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the issue in detail..."
                rows={4}
                className="w-full text-sm border border-border rounded px-3 py-2 bg-background resize-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full text-sm border border-border rounded px-3 py-2 bg-background"
                  required
                >
                  <option value="">Select...</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority *</label>
                <select
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full text-sm border border-border rounded px-3 py-2 bg-background"
                >
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Resolution (optional)</label>
              <textarea
                value={form.resolution}
                onChange={e => setForm(f => ({ ...f, resolution: e.target.value }))}
                placeholder="Known resolution steps..."
                rows={2}
                className="w-full text-sm border border-border rounded px-3 py-2 bg-background resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitLoading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {submitLoading ? 'Creating...' : 'Create & Embed Ticket'}
            </button>
          </form>
        </div>
      )}

      {/* ── CLASSIFY TAB ── */}
      {activeTab === 'classify' && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">Enter an incoming ticket — the agent classifies it, routes it to the right department, and suggests a resolution.</p>

          <form onSubmit={handleClassify} className="max-w-xl space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ticket Title *</label>
              <input
                value={classifyForm.title}
                onChange={e => setClassifyForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Database connection timeout on prod"
                className="w-full text-sm border border-border rounded px-3 py-2 bg-background"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                value={classifyForm.description}
                onChange={e => setClassifyForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the issue..."
                rows={4}
                className="w-full text-sm border border-border rounded px-3 py-2 bg-background resize-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={classifyLoading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {classifyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {classifyLoading ? 'Classifying...' : 'Classify & Route'}
            </button>
          </form>

          {classifyError && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-4 py-3 rounded text-sm text-red-700 dark:text-red-300">{classifyError}</div>
          )}

          {classifyResult && (
            <div className="space-y-4 max-w-2xl">
              <div className={`flex items-start gap-3 px-4 py-3 rounded border ${
                classifyResult.shouldEscalate
                  ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
                  : 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
              }`}>
                {classifyResult.shouldEscalate
                  ? <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  : <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />}
                <div className="space-y-1">
                  <div className="font-medium text-sm">
                    {classifyResult.shouldEscalate ? 'Escalate to human agent' : 'Auto-routed'}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLOR[classifyResult.category] ?? 'bg-muted'}`}>
                      {classifyResult.category}
                    </span>
                    <span className="text-muted-foreground">
                      Confidence: <strong>{(classifyResult.confidence * 100).toFixed(1)}%</strong>
                    </span>
                    <span className="text-muted-foreground">
                      Latency: <strong>{classifyResult.latencyMs}ms</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded p-4 space-y-2">
                <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Suggested Resolution</div>
                <p className="text-sm">{classifyResult.suggestedResolution}</p>
              </div>

              <div className="border border-border rounded overflow-hidden">
                <div className="px-4 py-2 bg-muted/50 border-b border-border text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                  Similar Past Tickets
                </div>
                <div className="divide-y divide-border/50">
                  {classifyResult.topMatches.map((m, i) => (
                    <div key={i} className="px-4 py-3 text-sm space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">{m.title}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {(m.score * 100).toFixed(1)}% match
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${CATEGORY_COLOR[m.category] ?? 'bg-muted'}`}>{m.category}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${PRIORITY_COLOR[m.priority] ?? ''}`}>{m.priority}</span>
                      </div>
                      {m.resolution && <p className="text-xs text-muted-foreground line-clamp-2">{m.resolution}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── VERSIONS TAB ── */}
      {activeTab === 'versions' && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Upload a new version of the ticket dataset to Azure Blob Storage. Each upload creates an immutable snapshot — you can seed from any version.
          </p>

          {/* Embedding namespace config */}
          {itConfig && (
            <div className="border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Embedding Namespaces</div>
                <button onClick={loadITConfig} className="flex items-center gap-1 text-xs px-2 py-1 border border-border rounded hover:bg-accent">
                  <RefreshCw className="h-3 w-3" /> Refresh
                </button>
              </div>

              {/* Active namespace badge */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Active:</span>
                <span className="font-mono text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">{itConfig.active}</span>
                <span className="text-xs text-muted-foreground">({itConfig.source})</span>
                {itConfig.promotedAt && <span className="text-xs text-muted-foreground">promoted {new Date(itConfig.promotedAt).toLocaleString()}</span>}
              </div>

              {/* All namespaces table */}
              {itConfig.namespaces.length > 0 ? (
                <div className="border border-border rounded overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        {['Namespace', 'Version', 'Vectors', 'Status', 'Action'].map(h => (
                          <th key={h} className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {itConfig.namespaces.map(ns => (
                        <tr key={ns.name} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="px-3 py-2 font-mono text-xs">{ns.name}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{ns.version ?? '—'}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{ns.vectorCount.toLocaleString()}</td>
                          <td className="px-3 py-2">
                            {ns.isActive
                              ? <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">active</span>
                              : <span className="text-xs text-muted-foreground">standby</span>}
                          </td>
                          <td className="px-3 py-2">
                            {!ns.isActive && (
                              <button
                                onClick={() => handleSwitchNamespace(ns.name)}
                                disabled={switchLoading}
                                className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                              >
                                {switchLoading ? <Loader2 className="h-3 w-3 animate-spin inline" /> : 'Set Active'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No it-tickets-* namespaces found in Pinecone yet. Seed data first.</p>
              )}

              {/* Manual namespace switch */}
              <div className="flex gap-2 items-center">
                <input
                  value={switchingNamespace}
                  onChange={e => setSwitchingNamespace(e.target.value)}
                  placeholder="e.g. it-tickets-v2"
                  className="text-xs border border-border rounded px-3 py-1.5 bg-background flex-1"
                />
                <button
                  onClick={() => handleSwitchNamespace(switchingNamespace)}
                  disabled={!switchingNamespace.trim() || switchLoading}
                  className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap"
                >
                  Switch Namespace
                </button>
              </div>

              {switchResult && (
                <div className="text-xs bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 px-3 py-2 rounded font-mono">
                  <span className="line-through text-muted-foreground">{switchResult.previousActive}</span>
                  {' → '}
                  <strong className="text-green-700 dark:text-green-300">{switchResult.newActive}</strong>
                </div>
              )}
            </div>
          )}


          {/* ── Index Lifecycle (#3) ── */}
          <div className="border border-border rounded-lg p-5 space-y-5">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              <div className="text-sm font-medium">Index Lifecycle — Promote &amp; Rollback</div>
            </div>

            {/* Active / Previous status row */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="border border-border rounded-lg p-3 space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Active</div>
                <div className="font-mono text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                  {itConfig?.active ?? '—'}
                </div>
                {itConfig?.promotedAt && (
                  <div className="text-xs text-muted-foreground">promoted {new Date(itConfig.promotedAt).toLocaleString()}</div>
                )}
              </div>
              <div className="border border-border rounded-lg p-3 space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Previous (rollback target)</div>
                <div className={`font-mono text-xs px-2 py-1 rounded ${itConfig?.previous ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300' : 'text-muted-foreground'}`}>
                  {itConfig?.previous ?? 'none yet'}
                </div>
              </div>
            </div>

            {/* Candidate namespace input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Candidate Namespace</label>
              <div className="flex gap-2">
                <input
                  value={candidateNamespace}
                  onChange={e => setCandidateNamespace(e.target.value)}
                  placeholder="e.g. it-tickets-v2"
                  className="text-xs border border-border rounded px-3 py-1.5 bg-background flex-1 font-mono"
                />
              </div>
              <p className="text-xs text-muted-foreground">Ingest the latest blob version into this namespace. Active queries keep hitting the current active namespace during seeding.</p>
            </div>

            {/* Re-index mode selector */}
            <div className="flex items-center gap-3 text-xs">
              <span className="text-muted-foreground font-medium">Re-index mode:</span>
              {(['full', 'incremental'] as const).map(m => (
                <label key={m} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="seedMode"
                    value={m}
                    checked={seedMode === m}
                    onChange={() => setSeedMode(m)}
                    className="accent-indigo-600"
                  />
                  <span className={seedMode === m ? 'font-medium' : 'text-muted-foreground'}>{m}</span>
                </label>
              ))}
              <span className="text-muted-foreground">
                {seedMode === 'full' ? '— wipes entire namespace first' : '— deletes only this source\'s old vectors'}
              </span>
            </div>

            {/* Step buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSeedCandidate}
                disabled={candidateSeedLoading || !candidateNamespace.trim()}
                className="flex items-center gap-2 text-sm px-4 py-2 border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/30 disabled:opacity-50"
              >
                {candidateSeedLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                1. Seed Candidate
              </button>
              <button
                onClick={handlePromote}
                disabled={promoteLoading || !candidateNamespace.trim()}
                className="flex items-center gap-2 text-sm px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {promoteLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                2. Promote to Active
              </button>
              <button
                onClick={handleRollback}
                disabled={rollbackLoading || !itConfig?.previous}
                className="flex items-center gap-2 text-sm px-4 py-2 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 rounded hover:bg-amber-50 dark:hover:bg-amber-950/30 disabled:opacity-50"
              >
                {rollbackLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                ↩ Rollback
              </button>
            </div>

            {/* Seed candidate result */}
            {candidateSeedResult && (
              <div className={`text-xs px-3 py-2 rounded border font-mono ${candidateSeedResult.errors?.length ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800' : 'bg-slate-50 dark:bg-slate-900/40 border-border'}`}>
                <div className="font-sans font-medium mb-1">{candidateSeedResult.message}</div>
                mode: <strong>{candidateSeedResult.mode}</strong> | deleted: {candidateSeedResult.deletedVectors === -1 ? 'all' : candidateSeedResult.deletedVectors} | inserted: {candidateSeedResult.inserted} | embedded: {candidateSeedResult.embedded} | total: {candidateSeedResult.total}
                <br />namespace: <strong>{candidateSeedResult.namespace}</strong> | docVersion: {candidateSeedResult.documentVersion}
                {candidateSeedResult.blobVersionId && <><br />blobVersionId: {candidateSeedResult.blobVersionId.slice(0, 20)}…</>}
                {candidateSeedResult.errors?.length > 0 && <div className="text-yellow-700 dark:text-yellow-400 mt-1">Errors: {candidateSeedResult.errors.join('; ')}</div>}
              </div>
            )}

            {/* ── Eval gate (#6) ── */}
            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Step 1.5 — Evaluate Before Promoting</div>
                <button
                  onClick={handleEval}
                  disabled={evalLoading || !candidateNamespace.trim()}
                  className="flex items-center gap-2 text-sm px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {evalLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                  {evalLoading ? 'Evaluating...' : 'Run Eval'}
                </button>
              </div>

              {/* Hardcoded Q&A pairs preview */}
              <div className="space-y-1">
                {EVAL_PAIRS.map((p, i) => (
                  <div key={i} className="text-xs text-muted-foreground border border-border/50 rounded px-3 py-1.5">
                    <span className="font-medium text-foreground">Q{i + 1}:</span> {p.question}
                  </div>
                ))}
              </div>

              {evalError && (
                <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-3 py-2 rounded">{evalError}</div>
              )}

              {evalResult && (
                <div className="space-y-3">
                  {/* Summary banner */}
                  <div className={`px-4 py-3 rounded border flex items-start gap-3 ${evalResult.passed ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'}`}>
                    {evalResult.passed
                      ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      : <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />}
                    <div className="space-y-1">
                      <div className={`text-sm font-medium ${evalResult.passed ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
                        {evalResult.passed ? 'Eval passed — safe to promote' : 'Eval failed — re-ingest before promoting'}
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Recall: <strong>{(evalResult.recall * 100).toFixed(0)}%</strong></span>
                        <span>Accuracy: <strong>{(evalResult.accuracy * 100).toFixed(0)}%</strong></span>
                        <span>Avg latency: <strong>{evalResult.avgLatencyMs}ms</strong></span>
                        <span>Namespace: <strong className="font-mono">{evalResult.namespace}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Per-pair results table */}
                  <div className="border border-border rounded overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          {['#', 'Question', 'Result', 'Latency', 'Judge Reason'].map(h => (
                            <th key={h} className="text-left px-3 py-2 font-medium text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {evalResult.pairs.map((p, i) => (
                          <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                            <td className="px-3 py-2 max-w-xs">
                              <div className="truncate" title={p.question}>{p.question}</div>
                              <div className="text-muted-foreground mt-0.5 truncate" title={p.actualAnswer}>↳ {p.actualAnswer}</div>
                            </td>
                            <td className="px-3 py-2">
                              {p.correct
                                ? <CheckCircle className="h-4 w-4 text-green-500" />
                                : <XCircle className="h-4 w-4 text-red-400" />}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{p.latencyMs}ms</td>
                            <td className="px-3 py-2 text-muted-foreground max-w-xs">
                              <span title={p.reason} className="line-clamp-2">{p.reason}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Promote result */}
            {promoteResult && (
              <div className="text-xs px-3 py-2 rounded border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 font-mono space-y-0.5">
                <div className="font-sans font-medium text-green-700 dark:text-green-300 flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5" /> Promoted successfully</div>
                <span className="line-through text-muted-foreground">{promoteResult.previousActive}</span>{' → '}<strong className="text-green-700 dark:text-green-300">{promoteResult.newActive}</strong>
                <br />at {new Date(promoteResult.promotedAt).toLocaleString()}
                <div className="font-sans text-muted-foreground mt-1">Update <code>IT_TICKETS_NAMESPACE={promoteResult.newActive}</code> in .env.local to persist across server restarts.</div>
              </div>
            )}

            {/* Rollback result */}
            {rollbackResult && (
              <div className="text-xs px-3 py-2 rounded border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 font-mono space-y-0.5">
                <div className="font-sans font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5" /> Rolled back</div>
                <span className="line-through text-muted-foreground">{rollbackResult.previousActive}</span>{' → '}<strong className="text-amber-700 dark:text-amber-300">{rollbackResult.newActive}</strong>
                <br />at {new Date(rollbackResult.promotedAt).toLocaleString()}
              </div>
            )}
          </div>

          {/* Upload form */}
          <div className="max-w-xl border border-border rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2 font-medium text-sm">
              <Upload className="h-4 w-4 text-indigo-500" />
              Upload New Version
            </div>
            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Select file (.xlsx or .csv)</label>
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm border border-border rounded px-3 py-2 bg-background"
                />
                {uploadFile && (
                  <p className="text-xs text-muted-foreground mt-1">{uploadFile.name} — {(uploadFile.size / 1024).toFixed(1)} KB</p>
                )}
              </div>
              <button
                type="submit"
                disabled={!uploadFile || uploadLoading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {uploadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploadLoading ? 'Uploading...' : 'Upload to Azure Blob'}
              </button>
            </form>
            {uploadError && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-3 py-2 rounded">{uploadError}</div>
            )}
            {uploadResult && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 px-3 py-2 rounded text-sm space-y-1">
                <div className="flex items-center gap-2 font-medium text-green-700 dark:text-green-300">
                  <CheckCircle className="h-4 w-4" /> Uploaded — new blob version created
                </div>
                <div className="font-mono text-xs text-muted-foreground">blob: {uploadResult.blobName}</div>
                <div className="font-mono text-xs text-muted-foreground">versionId: {uploadResult.versionId}</div>
                <div className="font-mono text-xs text-muted-foreground">uploaded: {new Date(uploadResult.uploadedAt).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total versions: {uploadResult.totalVersions}</div>
              </div>
            )}
          </div>

          {/* Version history table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 font-medium text-sm">
                <History className="h-4 w-4 text-indigo-500" />
                Version History — IT_Tickets_v1.xlsx
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground">Mode:</span>
                {(['incremental', 'full'] as const).map(m => (
                  <label key={m} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="blobSeedMode"
                      value={m}
                      checked={blobSeedMode === m}
                      onChange={() => setBlobSeedMode(m)}
                      className="accent-indigo-600"
                    />
                    <span className={blobSeedMode === m ? 'font-medium' : 'text-muted-foreground'}>{m}</span>
                  </label>
                ))}
                <button
                  onClick={() => loadBlobVersions('IT_Tickets_v1.xlsx')}
                  className="flex items-center gap-1 px-3 py-1.5 border border-border rounded hover:bg-accent"
                >
                  <RefreshCw className="h-3 w-3" /> Refresh
                </button>
              </div>
            </div>

            {versionsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : blobVersions.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
                No versions in Azure Blob yet. Upload a file above to create the first snapshot.
              </div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      {['Version ID', 'Last Modified', 'Size', 'Action'].map(h => (
                        <th key={h} className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {blobVersions.map((v, i) => (
                      <tr key={v.versionId} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                          {v.versionId.slice(0, 20)}…
                          {i === 0 && <span className="ml-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full text-xs">latest</span>}
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(v.lastModified).toLocaleString()}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{(v.size / 1024).toFixed(1)} KB</td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => { setSelectedVersion(v); handleSeedFromBlob(v); }}
                            disabled={seedFromBlobLoading}
                            className="flex items-center gap-1 text-xs px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {seedFromBlobLoading && selectedVersion?.versionId === v.versionId
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <RefreshCw className="h-3 w-3" />}
                            Seed this version
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {seedFromBlobResult && (
              <div className={`text-sm px-4 py-3 rounded border ${seedFromBlobResult.errors?.length ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800' : 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'}`}>
                <strong>{seedFromBlobResult.message}</strong> — mode: <strong>{seedFromBlobResult.mode}</strong> | deleted: {seedFromBlobResult.deletedVectors === -1 ? 'all' : seedFromBlobResult.deletedVectors} | inserted: {seedFromBlobResult.inserted} | embedded: {seedFromBlobResult.embedded}
                <div className="font-mono text-xs text-muted-foreground mt-1">
                  source: {seedFromBlobResult.source} | version: {seedFromBlobResult.documentVersion}
                  {seedFromBlobResult.blobVersionId && <> | blobVersionId: {seedFromBlobResult.blobVersionId.slice(0, 20)}…</>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
