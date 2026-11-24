import type { ServerDefinition } from '../types'
import { registerForecast } from './forecast'

/** The Weather server: the forecast. */
export const weatherServer: ServerDefinition = {
  register(server) {
    registerForecast(server)
  },
}
