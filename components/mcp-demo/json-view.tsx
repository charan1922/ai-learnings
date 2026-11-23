const HIGHLIGHT = /"(id|_meta|resultType)":/

/** Pretty JSON with the lesson's protocol fields (id, _meta, resultType) highlighted. */
export function JsonView({ value }: { value: unknown }) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  return (
    <pre className="bg-slate-900 text-slate-100 rounded-md p-3 text-[11px] leading-relaxed overflow-x-auto max-h-80">
      {text.split('\n').map((line, i) => (
        <div key={i} className={HIGHLIGHT.test(line) ? 'bg-amber-500/25 -mx-3 px-3' : undefined}>
          {line || ' '}
        </div>
      ))}
    </pre>
  )
}
