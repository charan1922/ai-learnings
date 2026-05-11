let _activeNamespace: string | null = null;
let _promotedAt: string | null = null;

export function getActiveNamespace(): string {
  return (
    _activeNamespace ??
    process.env.PINECONE_NAMESPACE ??
    process.env.NEXT_PUBLIC_PINECONE_NAMESPACE ??
    'rag-example-2'
  );
}

export function setActiveNamespace(ns: string): void {
  _activeNamespace = ns;
  _promotedAt = new Date().toISOString();
}

export function getPromotedAt(): string | null {
  return _promotedAt;
}

export function isRuntimeOverride(): boolean {
  return _activeNamespace !== null;
}
