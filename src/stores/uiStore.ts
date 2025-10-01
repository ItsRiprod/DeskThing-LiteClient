import { create } from 'zustand'
import { useSettingsStore } from './settingsStore'
import { EventMode } from '@deskthing/types'
import { useVoiceAgentStore } from './voiceAgentStore'

type KeyHandler = (code: string, eventMode: EventMode) => boolean // return true if handled

interface UIState {
  isScreensaverActive: boolean
  wheelRotation: number
  agentVisible: boolean
  setPage: (page: string) => void
  setWheelRotation: (indexOrUpdater: number | ((prev: number) => number)) => void

  setScreensaverActive: (active: boolean) => void

  setAgentVisible: (visible: boolean) => void
  toggleAgentVisible: () => void

  // Button related functions
  buttonEventHandler: (code: string, eventMode?: EventMode) => void
  keyHandlers: Map<string, KeyHandler>
  keyHandlerOrder: string[];
  registerKeyHandler: (id: string, handler: KeyHandler) => () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  isScreensaverActive: false,
  wheelRotation: 0,
  agentVisible: false,
  keyHandlers: new Map(),
  keyHandlerOrder: [],

  setPage: (page) => {
    const settingStore = useSettingsStore.getState()
    settingStore.updateCurrentView({
      name: page,
      enabled: false,
      running: false,
      timeStarted: 0,
      prefIndex: 0
    })
  },
  setScreensaverActive: (active) => set({ isScreensaverActive: active }),
  setWheelRotation: (indexOrUpdater) => set((state) => ({
    wheelRotation: typeof indexOrUpdater === 'function' ? indexOrUpdater(state.wheelRotation) : indexOrUpdater
  })),
  buttonEventHandler: (code, eventMode) => {
    // react the UI based on keypresses
    console.debug('DEBUG: Key down event', code, eventMode)

    const keyHandlers = get().keyHandlers
    const keyHandlerOrder = get().keyHandlerOrder;

    // Try registered handlers first
    for (let i = keyHandlerOrder.length - 1; i >= 0; i--) {
      const id = keyHandlerOrder[i];
      const handler = keyHandlers.get(id);
      if (handler && handler(code, eventMode)) {
        console.log(`Key event handled by custom handler ${id}`);
        return;
      }
    }

    if (!eventMode || (eventMode != EventMode.PressLong && eventMode != EventMode.PressShort)) {
      return // dont handle
    }

    switch (code) {
      case 'ArrowUp':
        set((state) => ({ wheelRotation: state.wheelRotation - 1 }))
        break
      case 'ArrowDown':
        set((state) => ({ wheelRotation: state.wheelRotation + 1 }))
        break
      case 'ArrowRight':
        set((state) => ({ wheelRotation: state.wheelRotation + 1 }))
        break
      case 'ArrowLeft':
        set((state) => ({ wheelRotation: state.wheelRotation - 1 }))
        break
      case 'KeyM':
        console.log('Received key M with event mode', eventMode)
        if (eventMode == EventMode.PressLong) {
          get().setPage('dashboard')
        } else {
          get().toggleAgentVisible()
        }
        break
      case 'Digit1':
        break
      case 'Digit2':
        break
      case 'Digit3':
        break
      case 'Digit4':
        break
      case 'Escape':
        break
      default:
        break
    }
  },

  setAgentVisible: (visible) => set({ agentVisible: visible }),

  toggleAgentVisible: () => set((state) => ({ agentVisible: !state.agentVisible })),

  registerKeyHandler: (id, handler) => {
    set((state) => {
      const newHandlers = new Map(state.keyHandlers)
      const newOrder = state.keyHandlerOrder.filter(existingId => existingId !== id);
      newOrder.push(id);
      newHandlers.set(id, handler)
      return { keyHandlers: newHandlers, keyHandlerOrder: newOrder }
    })
    return () => {
      set((state) => {
        const newHandlers = new Map(state.keyHandlers)
        newHandlers.delete(id)
        const newOrder = state.keyHandlerOrder.filter(existingId => existingId !== id);
        return { keyHandlers: newHandlers, keyHandlerOrder: newOrder }
      })
    }
  },
}))