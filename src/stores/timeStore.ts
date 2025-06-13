import { create } from 'zustand'
import { useSettingsStore } from './settingsStore'

/**
 * Manages the time-related state and functionality for the application.
 * 
 * The `useTimeStore` is a Zustand store that provides the following:
 * - `currentTimeFormatted`: The current time formatted as a string based on the user's preferences.
 * - `utcTime`: The server's current UTC time in milliseconds.
 * - `timezoneOffset`: The server's timezone offset in minutes.
 * - `serverTimeOffset`: The offset between the server time and the client time in milliseconds.
 * - `syncTime`: A function to sync the client's time with the server's time.
 * - `updateCurrentTime`: A function to update the formatted current time based on the server's offset.
 */
interface TimeStore {
  currentTimeFormatted: string
  utcTime: number // Server's UTC time in ms
  timezoneOffset: number // Server's timezone offset in minutes
  serverTimeOffset: number // Offset between server time and client time in ms
  syncTime: (utcTime: number, timezoneOffset: number) => void // Sync with server time
  updateCurrentTime: () => void // Update formatted current time
}

export const useTimeStore = create<TimeStore>((set, get) => ({
  currentTimeFormatted: '',
  utcTime: 0,
  timezoneOffset: 0,
  serverTimeOffset: 0,

  // Sync time with server
  syncTime: (utcTime, timezoneOffset) => {
    const clientTime = Date.now() // Client's current time in ms
    const serverTimeOffset = utcTime - clientTime // Calculate server offset

    set({
      utcTime,
      timezoneOffset,
      serverTimeOffset
    })

    // Update the formatted current time immediately
    get().updateCurrentTime()
  },

  // Update formatted current time based on server's offset
  updateCurrentTime: () => {
    const { serverTimeOffset, timezoneOffset } = get()
    const currentTime = new Date(Date.now() + serverTimeOffset) // Adjust for server offset
    const is24Hour = useSettingsStore.getState().preferences.use24hour
    // Convert to server timezone
    const adjustedTime = new Date(currentTime.getTime() + timezoneOffset * 60000)

    // Format the time based on server time
    const [hours, minutes] = [adjustedTime.getUTCHours(), adjustedTime.getUTCMinutes()]
    const ampm = is24Hour ? '' : hours >= 12 ? 'PM' : 'AM'
    const formattedHours = is24Hour ? hours : hours % 12 || 12
    const formattedTime = `${formattedHours}:${minutes.toString().padStart(2, '0')}${!is24Hour ? ' ' + ampm : ''}`

    set({ currentTimeFormatted: formattedTime })
  }
}))
