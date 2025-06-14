import { useEffect } from 'react'
import { EventMode } from '@deskthing/types'
import { useUIStore } from '@src/stores/uiStore'

/**
 * The `ButtonListener` component is responsible for handling keyboard and mouse wheel events and executing corresponding actions.
 * 
 * It sets up event listeners for `keydown`, `keyup`, and `wheel` events, and uses the `useMappingStore` to retrieve and execute the appropriate actions based on the event type and key/scroll direction.
 * 
 * The component also manages the state of button presses, including handling long presses and differentiating between short and long presses.
 */
export const ButtonListener = () => {
  const setWheelRotation = useUIStore((state) => state.setWheelRotation)
  const handleButton = useUIStore((state) => state.buttonEventHandler)

  useEffect(() => {
    const longPressTimeouts = new Map<string, number>()
    const buttonStates: { [key: string]: EventMode } = {}

    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return

      // Ensure that you dont double-call a long press
      if (!longPressTimeouts.has(e.key)) {
        const timeout = window.setTimeout(() => {
          buttonStates[e.code] = EventMode.PressLong
          handleButton(e.code, EventMode.PressLong) // long press
        }, 400)

        longPressTimeouts.set(e.code, timeout)
      }
    }

    const keyUpHandler = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return

      // Dont notify if the most recent action was a longpress
      if (buttonStates[e.code] !== EventMode.PressLong) {
        handleButton(e.code, EventMode.PressShort) // short press
        buttonStates[e.code] = EventMode.PressShort
      }

      // Clear the event timeout to cancel a long press and cleanup
      if (longPressTimeouts.has(e.code)) {
        clearTimeout(longPressTimeouts.get(e.code)!)
        longPressTimeouts.delete(e.code)
      }
    }

    window.addEventListener('keydown', keyDownHandler)
    window.addEventListener('keyup', keyUpHandler)

    return () => {
      window.removeEventListener('keydown', keyDownHandler)
      window.removeEventListener('keyup', keyUpHandler)
      longPressTimeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [])

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      if (event.defaultPrevented) return
      event.preventDefault()
      const deltaY = event.deltaY
      const deltaX = event.deltaX

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal scroll
        setWheelRotation((prev) => prev + (deltaX > 0 ? 1 : -1))
      } else {
        // Vertical scroll
        setWheelRotation((prev) => prev + (deltaY > 0 ? 1 : -1))
      }

    }

    window.addEventListener('wheel', handleScroll, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleScroll)
    }
  }, [])

  return null
}
