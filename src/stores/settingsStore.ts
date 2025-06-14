import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  App,
  ClientConfigurations,
  ClientConnectionMethod,
  ClientManifest,
  ClientPlatformIDs,
  DEVICE_DESKTHING,
  Log,
  Theme,
  ViewMode,
  VolMode
} from '@deskthing/types'
import useWebSocketStore from './websocketStore'
export interface SettingsState {
  logs: Log[]
  manifest: ClientManifest | undefined
  preferences: ClientConfigurations | undefined
  updateManifest: (settings: Partial<ClientManifest>) => void
  updatePreferences: (preferences: Partial<ClientConfigurations>) => void
  updateCurrentView: (view: App) => void
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
      manifest: undefined,
      preferences: undefined,
      updateManifest: (newSettings) =>
        set((state) => ({
          manifest: { ...state.manifest, ...newSettings }
        })),
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
                previousApp: state.preferences?.currentView?.name,
              }
            })
          }
          return {
            preferences: { ...state.preferences, ...newPreferences }
          }
        }),
      updateCurrentView: (newView) => {

        const prevView = get().preferences?.currentView?.name

        // Skip if both the prevView is missing and the new name is dashboard
        if (!(!prevView && newView.name == 'dashboard')) {
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
    }),
    {
      name: 'thinclient-settings-storage',
      partialize: (state) => ({
        manifest: state.manifest,
        preferences: state.preferences
      }),
      onRehydrateStorage: () => (state) => {
        // wait till the next tick
        setTimeout(() => {
          if (window.manifest) {
            console.log('manifest loaded', window.manifest)
            state?.updateManifest(window.manifest)
          }
        }, 0)
      }
    }
  )
)