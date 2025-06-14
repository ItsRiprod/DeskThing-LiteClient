import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  App,
  ClientConfigurations,
  ClientManifest,
  DEVICE_DESKTHING,
  Log,
} from '@deskthing/types'
import useWebSocketStore from './websocketStore'
export interface SettingsState {
  logs: Log[]
  manifest: ClientManifest | undefined
  preferences: ClientConfigurations | undefined
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
      manifest: undefined,
      preferences: undefined,
      flags: {},
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
      name: 'thinclient-settings-storage',
      partialize: (state) => ({
        manifest: state.manifest,
        preferences: state.preferences,
        flags: state.flags
      }),
      onRehydrateStorage: () => (state) => {

        let manifestLoaded = false;

        // Primary approach: Listen for the manifestLoaded event
        const handleManifestLoaded = () => {
          if (!manifestLoaded && window.manifest && state) {
            manifestLoaded = true;
            console.log('Manifest loaded via event', window.manifest);
            state.updateManifest(window.manifest);
            document.removeEventListener('manifestLoaded', handleManifestLoaded);
          }
        };

        document.addEventListener('manifestLoaded', handleManifestLoaded);

        // Fallback approach: Timeout in case event was already fired or missed
        setTimeout(() => {
          if (!manifestLoaded && window.manifest && state) {
            manifestLoaded = true;
            console.log('Manifest loaded via timeout fallback', window.manifest);
            state.updateManifest(window.manifest);
            document.removeEventListener('manifestLoaded', handleManifestLoaded);
          }
        }, 500); // Increased timeout as fallback
      }
    }
  )
)