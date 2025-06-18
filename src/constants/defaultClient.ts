import { Client, ConnectionState } from "@deskthing/types"
import { defaultPreferences } from "./defaultPreferences"
import { defaultManifest } from "./defaultManifest"
import { defaultMapping } from "./defaultMapping"

/**
 * Will get filled in by the server
 */
export const defaultClient: Client = {
  clientId: 'unspecified-id',
  connected: false,
  identifiers: {},
  connectionState: ConnectionState.Disconnected,
  timestamp: 0,
  meta: {},
  currentConfiguration: defaultPreferences,
  currentMapping: defaultMapping,

  manifest: defaultManifest
}