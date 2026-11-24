import type { UiFeature } from '../types'
import { ChatPanel } from './chat-panel'

/** Spec 8 UI: chat mode with Claude choosing the tools. */
export const chatUi: UiFeature = {
  id: 'chat',
  panels: [{ id: 'chat', label: 'Chatbot', section: 'side', Component: ChatPanel }],
}
