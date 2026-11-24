import type { ElicitRequestParams, ElicitResult } from '@modelcontextprotocol/client'

/** The one elicitation the user is being asked right now (the dialog shows it). */
export interface PendingElicitation {
  id: number
  /** Which server is asking — the lesson says the client must show this. */
  server: string
  params: ElicitRequestParams
  respond: (result: ElicitResult) => void
}

let pending: PendingElicitation | undefined
let nextId = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

/**
 * Called by the client's `elicitation/create` handler. Shows the dialog and waits:
 * the promise resolves with accept / decline / cancel when the user answers.
 * Meanwhile client.callTool() is paused between MRTR round 1 and round 2.
 */
export function requestElicitation(server: string, params: ElicitRequestParams): Promise<ElicitResult> {
  pending?.respond({ action: 'cancel' }) // one dialog at a time
  return new Promise((resolve) => {
    const id = ++nextId
    pending = {
      id,
      server,
      params,
      respond: (result) => {
        if (pending?.id === id) {
          pending = undefined
          emit()
        }
        resolve(result)
      },
    }
    emit()
  })
}

/** Observable for React's useSyncExternalStore (same shape as log-store and the host). */
export const elicitationStore = {
  getSnapshot: () => pending,
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
