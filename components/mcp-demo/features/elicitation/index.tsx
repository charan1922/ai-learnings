'use client'

import type { PanelProps, UiFeature } from '../types'
import { BookingPanel } from './booking-panel'
import { CapabilityToggle } from './capability-toggle'
import { requestElicitation } from './elicitation-bridge'
import { ElicitationDialog } from './elicitation-dialog'
import { ElicitationNotes } from './notes'

function ElicitationPanel(props: PanelProps) {
  return (
    <div className="space-y-4">
      <CapabilityToggle host={props.host} />
      <BookingPanel {...props} />
      <ElicitationNotes />
      <ElicitationDialog />
    </div>
  )
}

/** Spec 4 UI: declare elicitation, answer the server's questions in a dialog, and the "Elicitation" panel. */
export const elicitationUi: UiFeature = {
  id: 'elicitation',
  // Declared from the first connect. The panel's toggle can change it later.
  capabilities: { elicitation: { form: {}, url: {} } },
  clientSetup: (client) => {
    try {
      // The SDK calls this for every embedded elicitation in an input_required result (MRTR round 1),
      // waits for our answer, then sends round 2 by itself.
      client.setRequestHandler('elicitation/create', (request) =>
        requestElicitation(client.getServerVersion()?.name ?? 'An MCP server', request.params),
      )
    } catch {
      // The SDK refuses this handler when the client did not declare elicitation ("None" in the toggle).
    }
  },
  panels: [{ id: 'elicitation', label: 'Elicitation', section: 'client', Component: ElicitationPanel }],
}
