
import { create } from 'zustand'

interface UIState {
  isScreensaverActive: boolean
  setScreensaverActive: (active: boolean) => void
}

/**
 * The `useUIStore` is a Zustand store that manages the UI state of the application.
 * 
 * The store provides the following functionality:
 * - `isScreensaverActive`: Tracks if the screensaver is currently active
 * - `isMenuOpen`: Tracks if the main menu is currently open
 * - `activeAppId`: Tracks which app is currently active/focused
 * - `setScreensaverActive`: Sets the screensaver active state
 * - `setMenuOpen`: Sets the menu open state
 * - `setActiveApp`: Sets the currently active app
 */
export const useUIStore = create<UIState>((set) => ({
  isScreensaverActive: false,

  setScreensaverActive: (active) => set({ isScreensaverActive: active }),
}))
