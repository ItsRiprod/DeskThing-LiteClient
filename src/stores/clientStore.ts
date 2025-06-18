import {
  ClientConfigurations,
  Client,
} from '@deskthing/types'
import { create } from 'zustand'
import { useSettingsStore } from './settingsStore'
import { useMappingStore } from './mappingStore'
import { defaultClient } from '@src/constants/defaultClient'

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
