import { create } from 'zustand'

interface ActionState {
  wheelState: boolean
  wheelRotation: number
  screensaverActive: boolean
  setScreensaverActive: (state: boolean) => void
  setWheelRotation: (state: number) => void
  incrementWheelRotation: () => void
  decrementWheelRotation: () => void
  setWheelState: (state: boolean) => void
}

/**
 * Provides a Zustand store for managing the state of various UI elements, such as the wheel state, wheel rotation, and screensaver active state.
 *
 * @module stores/actionStore
 */
export const useActionStore = create<ActionState>()((set) => ({
  wheelState: false,
  wheelRotation: 0,
  screensaverActive: false,
  setWheelState: (state) => set({ wheelState: state }),
  setWheelRotation: (rotation) => set({ wheelRotation: rotation }),
  incrementWheelRotation: () => set((state) => ({ wheelRotation: state.wheelRotation + 1 })),
  decrementWheelRotation: () => set((state) => ({ wheelRotation: state.wheelRotation - 1 })),
  setScreensaverActive: (state) => set({ screensaverActive: state })
}))
