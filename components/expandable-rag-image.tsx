"use client"

import { useState, useEffect } from "react"

interface ExpandableRagImageProps {
  src: string
  alt: string
  className?: string
}

export function ExpandableRagImage({ src, alt, className }: ExpandableRagImageProps) {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setExpanded(false) }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [expanded])

  return (
    <>
      <div className="relative group">
        <img
          src={src}
          alt={alt}
          className={className}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
        />
        <button
          onClick={() => setExpanded(true)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 text-white rounded-lg px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm"
          aria-label="Expand image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
          </svg>
          Expand
        </button>
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setExpanded(false)}
        >
          <button
            onClick={() => setExpanded(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2 backdrop-blur-sm transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Close
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
