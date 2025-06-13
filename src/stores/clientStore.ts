import {
  ClientManifest,
  ClientConnectionMethod,
  ClientPlatformIDs,
  ClientConfigurations,
  ViewMode,
  VolMode,
  Client,
  ConnectionState
} from '@deskthing/types'
import { create } from 'zustand'
import { useSettingsStore } from './settingsStore'
import { useMappingStore } from './mappingStore'

const defaultManifest: ClientManifest = {
  name: '',
  id: '',
  short_name: '',
  description: '',
  context: {
    method: ClientConnectionMethod.Unknown,
    id: ClientPlatformIDs.Unknown,
    name: 'Unknown Connection Method',
    ip: 'localhost',
    port: 8891
  },
  reactive: false,
  author: '',
  version: '0.0.1',
  compatibility: {
    server: '>=0.10.0',
    app: '>=0.0.1'
  },
  repository: ''
}

const defaultConfig: ClientConfigurations = {
  profileId: 'unset', 
  version: '',
  appTrayState: ViewMode.HIDDEN,
  volume: VolMode.WHEEL,
  ShowNotifications: false,
  Screensaver: {
    name: '',
    enabled: false,
    running: false,
    timeStarted: 0,
    prefIndex: 0,
    meta: undefined,
    manifest: {
      id: '',
      label: '',
      requires: [],
      version: '',
      description: '',
      author: '',
      platforms: [],
      homepage: '',
      repository: '',
      updateUrl: '',
      tags: [],
      requiredVersions: {
        server: '',
        client: ''
      },
      template: '',
      version_code: 0,
      compatible_server: [],
      compatible_client: [],
      isAudioSource: false,
      isScreenSaver: false,
      isLocalApp: false,
      isWebApp: false
    }
  },
  ScreensaverType: undefined,
  onboarding: false,
  showPullTabs: false,
  saveLocation: false,
  use24hour: false
}

/**
 * Will get filled in by the server
 */
const defaultClient: Client = {
  clientId: 'unspecified-id',
  connected: false,
  identifiers: {},
  connectionState: ConnectionState.Disconnected,
  timestamp: 0,
  currentConfiguration: defaultConfig,
  currentMapping: {
    profileId: 'unset',
    mapping: {},
    actions: [],
    keys: []
  },

  manifest: defaultManifest
}

export interface ClientState {
  client: Client
  updateClient: (client: Partial<Client>) => void
  updateConfiguration: (config: Partial<ClientConfigurations>) => void
  updateProfileId: (profileId: string) => void
  updateConnectionStatus: (connected: boolean) => void
  resetClient: () => void
}

export const useClientStore = create<ClientState>()((set, get) => ({
  client: defaultClient,
  updateClient: (newClient) => {
    if (newClient.currentConfiguration && (newClient.currentConfiguration?.profileId || undefined) !== get().client.currentConfiguration?.profileId || undefined) {
      const updatePreferences = useSettingsStore.getState().updatePreferences
      updatePreferences(newClient.currentConfiguration)
    }

    if (newClient.currentMapping && (newClient.currentMapping?.profileId || undefined) !== get().client.currentMapping?.profileId || undefined) {
        const setProfile = useMappingStore.getState().setProfile
        setProfile(newClient.currentMapping)
    }

    
    console.log('client ID updated to', newClient.clientId)

    set((state) => ({
      client: { ...state.client, ...newClient, currentConfiguration: { profileId: (newClient.currentConfiguration?.profileId || undefined)}, currentMapping: { profileId: (newClient.currentMapping?.profileId || undefined) } } as Client
    }))
  },  updateConfiguration: (newConfig) =>
    set((state) => ({
      client: {
        ...state.client,
        currentConfiguration: { ...state.client.currentConfiguration, ...newConfig }
      }
    })),
  updateProfileId: (profileId) =>
    set((state) => ({
      client: { ...state.client, currentProfileID: profileId }
    })),
  updateConnectionStatus: (connected) =>
    set((state) => ({
      client: { ...state.client, connected, timestamp: Date.now() } as Client
    })),
  resetClient: () => set({ client: defaultClient })
}))
