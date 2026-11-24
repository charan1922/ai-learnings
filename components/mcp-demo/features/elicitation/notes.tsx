/** Two info cards. The text is the MCP Client lesson's own wording. */
export function ElicitationNotes() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
      <div className="rounded-lg border border-border p-3 space-y-2">
        <p className="text-sm font-semibold">What if you close the whole app?</p>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Before confirming:</strong> The app may close without sending a cancel action. In
          this example, the server still needs your confirmation before it can book.
        </p>
        <p className="text-muted-foreground">
          <strong className="text-foreground">After confirming:</strong> If the client already sent the second call, the server
          may finish booking even if you close the app before seeing the result. Check the booking status before trying again.
        </p>
      </div>
      <div className="rounded-lg border border-border p-3 space-y-2">
        <p className="text-sm font-semibold">Older features: roots and sampling (deprecated in 2026-07-28)</p>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Roots</strong> let the client tell the server which folders or files it could work
          with. For new implementations: pass the paths through tool arguments, use resource URIs, or configure them on the
          server.
        </p>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Sampling</strong> let the server ask the client to get a response from an AI model.
          For new implementations: have the server call a model provider’s API directly when it needs an AI response.
        </p>
      </div>
    </div>
  )
}
