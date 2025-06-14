import { create } from 'zustand'
import { WebSocketManager } from '../utils/websocketManager' 
import { useSettingsStore } from './settingsStore'
import { useMusicStore } from './musicStore'
import { DeviceToDeskthingData, DeskThingToDeviceCore, DESKTHING_DEVICE, SongData } from '@deskthing/types'
import { useClientStore } from './clientStore'
import { handleServerSocket } from '@src/utils/serverWebsocketHandler'

/**
 * Provides a WebSocket store that manages the connection and communication with a WebSocket server.
 *
 * The store includes the following functionality:
 * - Connecting and disconnecting the WebSocket connection
 * - Reconnecting the WebSocket connection when it is lost
 * - Sending messages to the WebSocket server
 * - Adding and removing listeners for incoming WebSocket messages
 *
 * The store uses the `WebSocketManager` utility class to handle the low-level WebSocket connection and communication.
 * The store also integrates with the `settingsStore` to update the WebSocket connection URL when the settings change.
 */
export interface WebSocketState {
  socketManager: WebSocketManager
  isConnected: boolean
  isReconnecting: boolean
  connect: (url: string) => void
  disconnect: () => void
  reconnect: () => void
  send: (message: DeviceToDeskthingData) => Promise<void>
  addListener: (listener: (msg: DeskThingToDeviceCore & { app?: string }) => void) => () => void
  once: (listenData: Partial<DeskThingToDeviceCore>, listener: (msg: DeskThingToDeviceCore & { app?: string }) => void | Promise<void>) => () => void
  removeListener: (listener: (msg: DeskThingToDeviceCore & { app?: string }) => void) => void
}

export const useWebSocketStore = create<WebSocketState>((set, get) => {
  
  const manifest = useSettingsStore.getState().manifest
  const clientId = useClientStore.getState().client.clientId
  let prevTrackName = ''
  
  let wsUrl: string | undefined = undefined

  if (manifest?.context?.ip && manifest?.context?.port) {
    wsUrl = `ws://${manifest.context.ip}:${manifest.context.port}`
  } else {
    console.debug('WebSocket URL not ready yet, waiting...')
  }

  console.log('WebSocket URL:', wsUrl)

  const manager = new WebSocketManager(clientId, wsUrl)

  manager.addStatusListener((status) => {
    if (status == 'reconnecting') {
      const pause = useMusicStore.getState().pause
      pause()
    }
    set({
      isConnected: status === 'connected',
      isReconnecting: status === 'reconnecting'
    })
  })

  const handleSongData = (songData: SongData) => {
    if (songData.track_name != undefined && songData.track_name !== prevTrackName) {
      prevTrackName = songData.track_name
      useMusicStore.getState().requestMusicData()
    }
    useMusicStore.getState().setSong({ ...songData, id: String(Date.now()) })
  }

  const messageHandler = (socketData: DeskThingToDeviceCore & { app?: string }) => {
    if (socketData.app !== 'client') return

    if (socketData.type == DESKTHING_DEVICE.MUSIC) {
      handleSongData(socketData.payload)
    }
    handleServerSocket(socketData)
  }
  
  if (wsUrl) {
    manager.connect()
    manager.addListener(messageHandler)
  }

  useSettingsStore.subscribe((state) => {
    if (!state.manifest.context.ip || !state.manifest.context.port) {
      console.debug('WebSocket URL not ready yet, waiting...')
      return
    }

    const newWsUrl = `ws://${state.manifest.context.ip}:${state.manifest.context.port}`
    if (newWsUrl !== wsUrl) {
      console.debug('WebSocket URL changed, reconnecting...')
      manager.disconnect()
      wsUrl = newWsUrl
      manager.connect(newWsUrl)
    }
  })

  useClientStore.subscribe((state) => {
    if (state.client.clientId !== manager.getclientId()) {
      console.log('status update to', state.client.clientId)
      manager.setId(state.client.clientId)
    }
  })

  return {
    socketManager: manager,
    isConnected: false,
    isReconnecting: false,

    connect: (url: string) => {
      manager.connect(url)
    },

    disconnect: () => {
      const manager = get().socketManager
      if (manager) {
        manager.disconnect()
        set({
          isConnected: false,
          isReconnecting: false
        })
      }
    },

    reconnect: () => {
      const manager = get().socketManager
      if (manager) {
        manager.reconnect()
        set({
          isConnected: false,
          isReconnecting: true
        })
      }
    },

    send: async (message: DeviceToDeskthingData): Promise<void> => {
      const manager = get().socketManager
      if (manager) {
        await manager.sendMessage(message)
      } else {
        console.error('WebSocket is not connected')
      }
    },

    addListener: (listener: (msg: DeskThingToDeviceCore & { app?: string }) => void): (() => void) => {
      const manager = get().socketManager
      if (manager) {
        manager.addListener(listener)
      }
      return () => manager.removeListener(listener)
    },

    once: (listenData: Partial<DeskThingToDeviceCore>, listener: (msg: DeskThingToDeviceCore & { app?: string }) => void | Promise<void>): (() => void) => {
      const manager = get().socketManager

      const wrappedListener = (msg: DeskThingToDeviceCore & { app?: string }) => {
        if ((!listenData.type || msg.type === listenData.type) &&
            (!listenData.request || msg.request === listenData.request) &&
            (!listenData.app || msg.app === listenData.app)) {
          listener(msg)
          manager.removeListener(wrappedListener)
        }
      }

      if (manager) {
        manager.addListener(wrappedListener)
      }

      return () => manager.removeListener(wrappedListener)
    },

    removeListener: (listener: (msg: DeskThingToDeviceCore & { app?: string }) => void) => {
      const manager = get().socketManager
      if (manager) {
        manager.removeListener(listener)
      }
    }
  }
})

export default useWebSocketStore