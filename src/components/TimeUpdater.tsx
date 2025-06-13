import { useEffect } from 'react'
import { useTimeStore } from '@src/stores/timeStore'
import { useSettingsStore } from '@src/stores'

/**
 * Provides a `TimeUpdater` component that updates the current time every minute.
 * 
 * The `TimeUpdater` component uses the `useTimeStore` and `useSettingsStore` hooks to access the current time and the user's 24-hour time preference, respectively.
 * 
 * The component sets up an interval that calls the `updateCurrentTime` function from the `useTimeStore` hook every minute, ensuring the current time is always up-to-date.
 * 
 * The component returns `null`, as it does not render any UI elements itself, but rather performs a side effect of updating the time.
 */
export const TimeUpdater = () => {
  const updateCurrentTime = useTimeStore((state) => state.updateCurrentTime)
  const is24Hour = useSettingsStore((state) => state.preferences.use24hour)

  useEffect(() => {
    const interval = setInterval(updateCurrentTime, 60000) // Update every minute
    return () => clearInterval(interval) // Cleanup on unmount
  }, [updateCurrentTime, is24Hour])

  return null
}
