import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  App,
  ClientConfigurations,
  ClientManifest,
  DEVICE_DESKTHING,
  DeviceToDeskthingData,
  Log
} from '@deskthing/types'
import useWebSocketStore from './websocketStore'
import { defaultManifest } from '@src/constants/defaultManifest'
import { defaultPreferences } from '@src/constants/defaultPreferences'
import Logger from '@src/utils/Logger'
import { SystemApps } from '@src/components/nav/Router'
export interface SettingsState {
  logs: Log[]
  manifest: ClientManifest
  preferences: ClientConfigurations
  flags: Record<string, boolean>
  updateManifest: (settings: Partial<ClientManifest>) => void
  updatePreferences: (preferences: Partial<ClientConfigurations>) => void
  updateCurrentView: (view: App) => void
  checkFlag: (key: string) => boolean
  setFlag: (key: string, value: boolean) => void
}

/**
 * Provides a state management store for the application's settings, including logs, manifest, and preferences.
 * The store uses the `zustand` library with the `persist` middleware to save and restore the state.
 * The store includes methods to manage the logs, update the manifest and preferences, and reset the preferences to their default values.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      logs: [],
      manifest: defaultManifest,
      preferences: defaultPreferences,
      flags: {},
      updateManifest: (newSettings) => {
        set((state) => {
          const combinedManifest = { ...state.manifest, ...newSettings }

          const updatePayload: DeviceToDeskthingData = {
            type: DEVICE_DESKTHING.MANIFEST,
            app: 'server',
            payload: combinedManifest
          }
          const send = useWebSocketStore.getState().send

          Logger.debug('Sending manifest data because of an update')

          send(updatePayload)

          return {
            manifest: combinedManifest
          }
        })
      },
      updatePreferences: (newPreferences) =>
        set((state) => {
          if (newPreferences?.currentView?.name != state.preferences?.currentView?.name) {
            const send = useWebSocketStore.getState().send
            send({
              type: DEVICE_DESKTHING.VIEW,
              request: 'change',
              app: 'server',
              payload: {
                currentApp: newPreferences?.currentView?.name,
                previousApp: state.preferences?.currentView?.name
              }
            })
          }
          return {
            preferences: { ...state.preferences, ...newPreferences }
          }
        }),
      updateCurrentView: (newView) => {
        const prevView = get().preferences?.currentView?.name

        // Skip if both the prevView is missing OR is a SystemApp and the new app is a system app
        if ((!prevView || SystemApps.includes(prevView)) && (SystemApps.includes(newView.name))) {
          const send = useWebSocketStore.getState().send
          send({
            app: 'server',
            type: DEVICE_DESKTHING.VIEW,
            request: 'change',
            payload: {
              currentApp: newView.name,
              previousApp: prevView
            }
          })
        }

        set((state) => ({
          preferences: { ...state.preferences, currentView: newView }
        }))
      },
      checkFlag: (key) => {
        return get().flags[key] || false
      },
      setFlag: (key, value) => {
        set((state) => ({
          flags: { ...state.flags, [key]: value }
        }))
      }
    }),
    {
      name: 'liteclient-settings-storage',
      partialize: (state) => ({
        manifest: state.manifest,
        preferences: state.preferences,
        flags: state.flags
      }),
      onRehydrateStorage: () => (state) => {
        let manifestLoaded = false

        // Primary approach: Listen for the manifestLoaded event
        const handleManifestLoaded = () => {
          if (!manifestLoaded && window.manifest && state) {
            manifestLoaded = true
            console.log('Manifest loaded via event', window.manifest)
            state.updateManifest(window.manifest)
            document.removeEventListener('manifestLoaded', handleManifestLoaded)
          }
        }

        document.addEventListener('manifestLoaded', handleManifestLoaded)

        // Fallback approach: Timeout in case event was already fired or missed
        setTimeout(() => {
          if (!manifestLoaded && window.manifest && state) {
            manifestLoaded = true
            console.log('Manifest loaded via timeout fallback', window.manifest)
            state.updateManifest(window.manifest)
            document.removeEventListener('manifestLoaded', handleManifestLoaded)
          }
        }, 500) // Increased timeout as fallback
      }
    }
  )
)
