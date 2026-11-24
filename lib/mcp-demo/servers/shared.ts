/** Small result builders every server uses. */

/** A tool result with one text block. */
export const toolText = (text: string) => ({ content: [{ type: 'text' as const, text }] })

/** A tool result the model can read as an error — `isError: true`, never a thrown protocol error. */
export const toolError = (text: string) => ({ ...toolText(text), isError: true })

/** A resources/read result holding one JSON document. */
export const jsonContents = (uri: URL, data: unknown) => ({
  contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(data, null, 2) }],
})

/** Case-insensitive prefix match, used by completions ("bar" → Barcelona). */
export const startingWith = (values: string[], typed: string): string[] =>
  values.filter((v) => v.toLowerCase().startsWith(typed.toLowerCase()))
