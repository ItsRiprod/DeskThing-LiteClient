import { create } from 'zustand'
import { useUIStore } from './uiStore'
import { AGENT_MESSAGE_TYPES, AgentMessage, DESKTHING_DEVICE, DEVICE_DESKTHING } from '@deskthing/types'
import useWebSocketStore from './websocketStore'
import { InitializedStore } from '@src/types'
import { AudioBackendStatus, AudioBackendType, audioManager, MicConfig } from '@deskthing/microphone'
import { analyzeAudioLevel, stripWavMetadata } from '@src/utils/audio/audioAnalysis'

export type VoiceAgentStatus = 'connecting' | 'connected' | 'disconnected' | 'listening' | 'error'

export type VoiceAgentState = 'Listening' | 'Idle' | 'Processing' | 'Disconnected'

type VoiceStoreAgentState = InitializedStore & {
  provider: AudioBackendType
  status: AudioBackendStatus
  audioChunks: number
  bytesReceived: number
  micConfig: MicConfig

  errorMsg?: string
  currentAudioLevel: number // Added for current chunk's audio level
  responseMessages: Extract<AgentMessage, { type: AGENT_MESSAGE_TYPES.TEXT }>[] // Last response message from server
  statusMessages: Extract<AgentMessage, { type: AGENT_MESSAGE_TYPES.STATUS }> | null // Last status message from server
  errorMessages: Extract<AgentMessage, { type: AGENT_MESSAGE_TYPES.ERROR }> | null // Last error message from server

  selectedMessageId: string | null // ID of the currently selected message

  // UI-related
  toggleVoiceAgent: () => void
  startVoiceAgent: () => void
  stopVoiceAgent: () => void
  closeVoiceAgent: () => void

  setSelectedMessageId: (id: string | null) => void

  // add to the next message
  addMessage: (msg: AgentMessage) => void
  clearMessage: () => void
  setMessages: (msgs: AgentMessage[]) => void
  addTokenToMessage: (messageId: string, token: string) => void

  fetchConversation: () => Promise<void>

  retryBackend: () => void

  reconfigureAudio: () => void
}

export const useVoiceAgentStore = create<VoiceStoreAgentState>((set, get) => ({
  provider: 'unset',
  status: 'disconnected',
  audioChunks: 0,
  bytesReceived: 0,
  micConfig: {
    sampleRate: 16000,
    channelCount: 1,
    bytesPerSample: 2,
    secondsPerChunk: 1,
  },

  initialized: false,
  errorMsg: undefined,
  currentAudioLevel: 0,

  selectedMessageId: null,

  // Initial value
  responseMessages: [],
  statusMessages: null,
  errorMessages: null,

  init: async () => {

    if (get().initialized) return // already initialized
    set({ initialized: true })

    // setup message receiving here

    useWebSocketStore.getState().addListener((msg) => {
      if (msg.app != 'client' || msg.type != DESKTHING_DEVICE.AGENT || !msg.payload) return

      switch (msg.request) {
        case 'response':
          get().addMessage(msg.payload as AgentMessage)
          break
        case 'disconnect':
          // do nothing for now
          get().stopVoiceAgent()
          break
        case 'context':
          if (msg.payload) {
            get().setMessages(msg.payload)
          }
          break
        case 'token':
          if (msg.payload.messageId && msg.payload.token) {
            get().addTokenToMessage(msg.payload.messageId, msg.payload.token)
          }
          break
      }
    })

    useWebSocketStore.getState().send({
      type: DEVICE_DESKTHING.AUDIO,
      request: 'fetch',
      app: 'server'
    })

    // setup the listener
    audioManager.onAudioPacket((packet) => {
      useWebSocketStore.getState().sendBinary(packet)

      const strippedPacket = stripWavMetadata(packet)
      const audioLevel = analyzeAudioLevel(strippedPacket)
      set({ currentAudioLevel: audioLevel })
    })

    audioManager.onMicStateChange((newState) => {
      set((state) => ({
        micConfig: {
          ...state.micConfig,
          ...newState
        },
        provider: newState.backend,
        status: newState.status,
        audioChunks: newState.audioChunks,
        bytesReceived: newState.bytesReceived,

      }))
    })

    await audioManager.retryBackend()

    audioManager.configureMic(get().micConfig)
  },


  toggleVoiceAgent: () => {
    const currentStatus = useVoiceAgentStore.getState().status
    if (currentStatus === 'listening') {
      useVoiceAgentStore.getState().stopVoiceAgent()
    } else {
      useVoiceAgentStore.getState().startVoiceAgent()
    }
  },

  startVoiceAgent: () => {
    audioManager.openMic()
    console.log('Starting voice agent and showing UI')
    useWebSocketStore.getState().send({
      type: DEVICE_DESKTHING.AUDIO,
      request: 'start',
      app: 'server'
    })
    useUIStore.getState().setAgentVisible(true) // always show the GUI for the voice agent listening
  },
  stopVoiceAgent: () => {
    audioManager.closeMic()
    useWebSocketStore.getState().send({
      type: DEVICE_DESKTHING.AUDIO,
      request: 'end',
      app: 'server'
    })
    console.log('Stopping voice agent')
  },
  closeVoiceAgent: () => {
    get().stopVoiceAgent()
    useUIStore.getState().setAgentVisible(false)
    console.log('Stopping voice agent and hiding UI')
  },
  addMessage: (msg: AgentMessage) => {
    msg = {
      messageId: `msg-${Math.random().toString(36).substring(2, 15)}`,
      timestamp: Date.now(),
      role: 'Agent',
      ...msg,
    }

    set((state) => {
      if (msg.type === AGENT_MESSAGE_TYPES.TEXT) {
        return {
          responseMessages: state.responseMessages ? [...state.responseMessages, msg] : [msg],
          statusMessages: null,
          errorMessages: null
        }
      } else if (msg.type === AGENT_MESSAGE_TYPES.STATUS) {
        return {
          statusMessages: msg
        }
      } else if (msg.type === AGENT_MESSAGE_TYPES.ERROR) {
        return {
          errorMessages: msg
        }
      }
      return {}
    })
  },
  clearMessage: () => {
    set({ responseMessages: [], statusMessages: null, errorMessages: null })
  },

  setMessages: (msgs) => set({ responseMessages: msgs.filter(m => m.type === AGENT_MESSAGE_TYPES.TEXT), statusMessages: null, errorMessages: null }),

  addTokenToMessage: (messageId, token) => {
    set((state) => {
      const updatedMessages = state.responseMessages.map((msg) => {
        if (msg.messageId === messageId) {
          return { ...msg, message: msg.message + token }
        }
        return msg
      })
      return { responseMessages: updatedMessages }
    })
  },

  fetchConversation: async () => {
    await useWebSocketStore.getState().send({
      type: DEVICE_DESKTHING.AUDIO,
      request: 'fetch',
      app: 'server'
    })
  },

  setSelectedMessageId: (id) => set({ selectedMessageId: id }),

  retryBackend: async () => {
    console.log('Retrying audio backend connection')
    await audioManager.retryBackend()
    console.log('Finished retrying audio backend')
  },

  reconfigureAudio: () => {
    audioManager.configureMic(get().micConfig)
  }
}))
