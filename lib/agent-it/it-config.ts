// Active namespace singleton for IT tickets.
// Survives across requests in the same Node process.
// Falls back to env var on cold start.

let _activeNamespace: string | null = null;
let _promotedAt: string | null = null;
let _previousNamespace: string | null = null;

export function getActiveITNamespace(): string {
  return _activeNamespace
    ?? process.env.IT_TICKETS_NAMESPACE
    ?? 'it-tickets-v1';
}

export function setActiveITNamespace(ns: string): void {
  _previousNamespace = _activeNamespace ?? process.env.IT_TICKETS_NAMESPACE ?? 'it-tickets-v1';
  _activeNamespace = ns;
  _promotedAt = new Date().toISOString();
}

export function getPreviousITNamespace(): string | null {
  return _previousNamespace;
}

export function getITPromotedAt(): string | null {
  return _promotedAt;
}

export function isITRuntimeOverride(): boolean {
  return _activeNamespace !== null;
}

// Parse version number from namespace e.g. "it-tickets-v3" → 3
export function parseITVersion(ns: string): number | null {
  const m = ns.match(/-v(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

// Build a versioned namespace name e.g. ("it-tickets", 2) → "it-tickets-v2"
export function makeITNamespace(base: string, version: number): string {
  return `${base}-v${version}`;
}
