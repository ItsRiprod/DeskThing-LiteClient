import { create } from 'zustand'
import { useSettingsStore } from './settingsStore'
import { EventMode } from '@deskthing/types'

type KeyHandler = (code: string, eventMode: EventMode) => boolean // return true if handled

interface UIState {
  isScreensaverActive: boolean
  wheelRotation: number
  setPage: (page: string) => void
  setWheelRotation: (indexOrUpdater: number | ((prev: number) => number)) => void

  setScreensaverActive: (active: boolean) => void

  // Button related functions
  buttonEventHandler: (code: string, eventMode?: EventMode) => void
  keyHandlers: Map<string, KeyHandler>
  registerKeyHandler: (id: string, handler: KeyHandler) => () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  isScreensaverActive: false,
  wheelRotation: 0,
  keyHandlers: new Map(),
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

    const keyHandlers = get().keyHandlers
    
    // Try registered handlers first
    for (const [id, handler] of keyHandlers) {
      if (handler(code, eventMode)) {
        return // Handler consumed the event
      }
    }

    if (eventMode && eventMode != EventMode.PressLong && eventMode != EventMode.PressShort) {
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
        get().setPage('dashboard')
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
  registerKeyHandler: (id, handler) => {
    set((state) => {
      const newHandlers = new Map(state.keyHandlers)
      newHandlers.set(id, handler)
      return { keyHandlers: newHandlers }
    })
    return () => {
      set((state) => {
        const newHandlers = new Map(state.keyHandlers)
        newHandlers.delete(id)
        return { keyHandlers: newHandlers }
      })
    }
  },
}))