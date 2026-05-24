'use client';

import { useState } from 'react';
import { Bot, Search, Loader2, CheckCircle, AlertTriangle, GitBranch } from 'lucide-react';

type TraceEntry = { node: string; durationMs: number };

type SimilarTicket = {
  ticketId: string; title: string; category: string;
  priority: string; resolution: string; score: number;
};

type ClassifyResult = {
  category: string;
  confidence: number;
  shouldEscalate: boolean;
  topMatches: SimilarTicket[];
  suggestedResolution: string;
  latencyMs: number;
  trace: TraceEntry[];
};

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

const NODE_ORDER = [
  'formatQuery',
  'embedQuery',
  'searchSimilar',
  'evaluateConfidence',
  'escalate',
  'generateResolution',
  'formatResponse',
];

const NODE_LABELS: Record<string, string> = {
  formatQuery: 'Format Query',
  embedQuery: 'Embed Query',
  searchSimilar: 'Search Similar',
  evaluateConfidence: 'Evaluate Confidence',
  escalate: 'Escalate',
  generateResolution: 'Generate Resolution',
  formatResponse: 'Format Response',
};

const NODE_DESC: Record<string, string> = {
  formatQuery: 'formats title + description',
  embedQuery: 'AzureOpenAI embedding',
  searchSimilar: 'Pinecone top-K search',
  evaluateConfidence: 'score vs 0.75 threshold',
  escalate: 'GPT escalation triage',
  generateResolution: 'GPT resolution from context',
  formatResponse: 'assemble final result',
};

function GraphDiagram({ executedNodes, branch }: { executedNodes: Set<string>; branch: 'escalate' | 'generateResolution' | null }) {
  const nodeStyle = (name: string) => {
    const ran = executedNodes.has(name);
    const isEscalate = name === 'escalate';
    const isResolution = name === 'generateResolution';
    const isConditional = name === 'evaluateConfidence';
    let base = 'border rounded-lg px-3 py-2 text-xs font-medium transition-all ';
    if (!ran) return base + 'border-border bg-muted/30 text-muted-foreground opacity-60';
    if (isConditional) return base + 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300';
    if (isEscalate) return base + 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300';
    if (isResolution) return base + 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300';
    return base + 'border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300';
  };

  const arrow = (ran: boolean, color = 'text-muted-foreground') =>
    <div className={`text-center text-xs select-none ${ran ? color : 'text-muted-foreground/30'}`}>↓</div>;

  return (
    <div className="flex flex-col items-center gap-0.5 py-2">
      <div className={nodeStyle('formatQuery')}>
        <div>{NODE_LABELS.formatQuery}</div>
        <div className="text-[10px] opacity-70">{NODE_DESC.formatQuery}</div>
      </div>
      {arrow(executedNodes.has('formatQuery'))}
      <div className={nodeStyle('embedQuery')}>
        <div>{NODE_LABELS.embedQuery}</div>
        <div className="text-[10px] opacity-70">{NODE_DESC.embedQuery}</div>
      </div>
      {arrow(executedNodes.has('embedQuery'))}
      <div className={nodeStyle('searchSimilar')}>
        <div>{NODE_LABELS.searchSimilar}</div>
        <div className="text-[10px] opacity-70">{NODE_DESC.searchSimilar}</div>
      </div>
      {arrow(executedNodes.has('searchSimilar'))}
      <div className={nodeStyle('evaluateConfidence')}>
        <div>{NODE_LABELS.evaluateConfidence}</div>
        <div className="text-[10px] opacity-70">{NODE_DESC.evaluateConfidence}</div>
      </div>

      {/* Branch */}
      <div className="flex items-start gap-8 mt-1">
        <div className="flex flex-col items-center gap-0.5">
          <div className={`text-xs text-center select-none ${branch === 'escalate' ? 'text-amber-500' : 'text-muted-foreground/30'}`}>↙ escalate</div>
          <div className={nodeStyle('escalate')}>
            <div>{NODE_LABELS.escalate}</div>
            <div className="text-[10px] opacity-70">{NODE_DESC.escalate}</div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <div className={`text-xs text-center select-none ${branch === 'generateResolution' ? 'text-green-500' : 'text-muted-foreground/30'}`}>↘ resolve</div>
          <div className={nodeStyle('generateResolution')}>
            <div>{NODE_LABELS.generateResolution}</div>
            <div className="text-[10px] opacity-70">{NODE_DESC.generateResolution}</div>
          </div>
        </div>
      </div>

      <div className={`text-xs select-none mt-0.5 ${executedNodes.has('formatResponse') ? 'text-muted-foreground' : 'text-muted-foreground/30'}`}>↓</div>
      <div className={nodeStyle('formatResponse')}>
        <div>{NODE_LABELS.formatResponse}</div>
        <div className="text-[10px] opacity-70">{NODE_DESC.formatResponse}</div>
      </div>
    </div>
  );
}

export default function AgentITLangGraphPage() {
  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const [error, setError] = useState('');

  const executedNodes = new Set(result?.trace.map(t => t.node) ?? []);
  const branch = result
    ? (result.shouldEscalate ? 'escalate' : 'generateResolution')
    : null;

  async function handleClassify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const res = await fetch('/api/agent-it-langgraph/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/40">
          <GitBranch className="h-6 w-6 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Agent IT — LangGraph</h1>
          <p className="text-sm text-muted-foreground">Same solution as Agent IT, modelled as an explicit StateGraph with nodes, edges, and conditional branching</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Graph diagram */}
        <div className="lg:col-span-1 space-y-3">
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3 text-sm font-medium">
              <Bot className="h-4 w-4 text-violet-500" />
              Graph Structure
            </div>
            <GraphDiagram executedNodes={executedNodes} branch={branch} />
            <div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground border-t border-border pt-3">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-amber-200 dark:bg-amber-800 inline-block" /> Escalate path (confidence &lt; 75%)</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-green-200 dark:bg-green-800 inline-block" /> Resolve path (confidence ≥ 75%)</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-violet-200 dark:bg-violet-800 inline-block" /> Executed node</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm bg-muted inline-block opacity-60" /> Not yet executed</div>
            </div>
          </div>
        </div>

        {/* Right — Form + Trace + Result */}
        <div className="lg:col-span-2 space-y-5">
          {/* Classify form */}
          <div className="border border-border rounded-lg p-5 space-y-4">
            <div className="text-sm font-medium">Classify a Ticket</div>
            <form onSubmit={handleClassify} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Database connection timeout on prod"
                  className="w-full text-sm border border-border rounded px-3 py-2 bg-background"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the issue..."
                  rows={3}
                  className="w-full text-sm border border-border rounded px-3 py-2 bg-background resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm rounded hover:bg-violet-700 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {loading ? 'Running graph...' : 'Run Graph'}
              </button>
            </form>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-4 py-3 rounded">{error}</div>
          )}

          {/* Execution trace */}
          {result && (
            <div className="border border-border rounded-lg p-5 space-y-3">
              <div className="text-sm font-medium">Execution Trace</div>
              <div className="space-y-1">
                {NODE_ORDER.filter(n => executedNodes.has(n)).map((nodeName, i, arr) => {
                  const entry = result.trace.find(t => t.node === nodeName);
                  const isConditional = nodeName === 'evaluateConfidence';
                  const nextNode = arr[i + 1];
                  return (
                    <div key={nodeName} className="flex items-center gap-3 text-xs">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                      <span className={`font-mono font-medium w-40 ${
                        nodeName === 'escalate' ? 'text-amber-600 dark:text-amber-400' :
                        nodeName === 'generateResolution' ? 'text-green-600 dark:text-green-400' :
                        'text-foreground'
                      }`}>{nodeName}</span>
                      <span className="text-muted-foreground w-16 text-right">{entry?.durationMs ?? 0}ms</span>
                      {isConditional && nextNode && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          nextNode === 'escalate'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                        }`}>
                          → {nextNode}
                        </span>
                      )}
                    </div>
                  );
                })}
                <div className="flex items-center gap-3 text-xs pt-1 border-t border-border mt-1">
                  <span className="w-3.5" />
                  <span className="text-muted-foreground w-40">Total</span>
                  <span className="font-medium w-16 text-right">{result.latencyMs}ms</span>
                </div>
              </div>
            </div>
          )}

          {/* Classification result */}
          {result && (
            <div className="space-y-4">
              <div className={`flex items-start gap-3 px-4 py-3 rounded border ${
                result.shouldEscalate
                  ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
                  : 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
              }`}>
                {result.shouldEscalate
                  ? <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  : <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />}
                <div className="space-y-1">
                  <div className="font-medium text-sm">
                    {result.shouldEscalate ? 'Escalate to human agent' : 'Auto-routed'}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLOR[result.category] ?? 'bg-muted'}`}>
                      {result.category}
                    </span>
                    <span className="text-muted-foreground">
                      Confidence: <strong>{(result.confidence * 100).toFixed(1)}%</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded p-4 space-y-2">
                <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Suggested Resolution</div>
                <p className="text-sm">{result.suggestedResolution}</p>
              </div>

              <div className="border border-border rounded overflow-hidden">
                <div className="px-4 py-2 bg-muted/50 border-b border-border text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                  Similar Past Tickets
                </div>
                <div className="divide-y divide-border/50">
                  {result.topMatches.map((m, i) => (
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
      </div>
    </div>
  );
}
