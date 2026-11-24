'use client'

import { marked } from 'marked'
import { useMemo } from 'react'

/** Tags a model reply may use. Anything else is replaced by its plain text. */
const ALLOWED = new Set([
  'P', 'BR', 'STRONG', 'EM', 'DEL', 'CODE', 'PRE', 'UL', 'OL', 'LI', 'BLOCKQUOTE',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'A', 'HR',
])

/**
 * Markdown → HTML → keep only safe tags and attributes.
 * Model replies can echo text from tool results (even third-party servers), so raw HTML,
 * scripts, images, event handlers and javascript: links must never reach the page.
 */
function toSafeHtml(markdown: string): string {
  const html = marked.parse(markdown, { async: false, gfm: true, breaks: true })
  const template = document.createElement('template') // inert: nothing in it runs
  template.innerHTML = html
  for (const el of [...template.content.querySelectorAll('*')]) {
    if (!ALLOWED.has(el.tagName)) {
      el.replaceWith(document.createTextNode(el.textContent ?? ''))
      continue
    }
    const href = el.tagName === 'A' ? el.getAttribute('href') : null
    for (const attr of [...el.attributes]) el.removeAttribute(attr.name)
    if (href && /^(https?:|mailto:)/i.test(href)) {
      el.setAttribute('href', href)
      el.setAttribute('target', '_blank')
      el.setAttribute('rel', 'noopener noreferrer')
    }
  }
  return template.innerHTML
}

/** Renders a model's Markdown reply (lists, bold, tables, code, links) safely. */
export function Markdown({ text }: { text: string }) {
  const html = useMemo(() => toSafeHtml(text), [text])
  return (
    <div
      className={[
        'space-y-2 break-words',
        '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5',
        '[&_strong]:font-semibold [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold [&_h2]:text-base',
        '[&_code]:font-mono [&_code]:text-xs [&_code]:bg-muted [&_code]:rounded [&_code]:px-1',
        '[&_pre]:bg-muted [&_pre]:rounded [&_pre]:p-2 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0',
        '[&_table]:w-full [&_table]:text-xs [&_th]:text-left [&_th]:font-medium [&_th]:border-b [&_th]:border-border [&_td]:border-b [&_td]:border-border [&_th]:py-1 [&_td]:py-1 [&_th]:pr-2 [&_td]:pr-2',
        '[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-2 [&_blockquote]:text-muted-foreground',
        '[&_a]:underline [&_hr]:border-border',
      ].join(' ')}
      // Safe: the HTML above has been reduced to an allow-list of tags with no attributes except checked links.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
