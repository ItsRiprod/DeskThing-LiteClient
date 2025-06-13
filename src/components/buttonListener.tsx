import { useMappingStore } from '@src/stores'
import { useEffect } from 'react'
import { EventMode } from '@deskthing/types'

/**
 * The `ButtonListener` component is responsible for handling keyboard and mouse wheel events and executing corresponding actions.
 * 
 * It sets up event listeners for `keydown`, `keyup`, and `wheel` events, and uses the `useMappingStore` to retrieve and execute the appropriate actions based on the event type and key/scroll direction.
 * 
 * The component also manages the state of button presses, including handling long presses and differentiating between short and long presses.
 */
export const ButtonListener = () => {
  const executeAction = useMappingStore((store) => store.executeAction)
  const executeKey = useMappingStore((store) => store.executeKey)
  const getActions = useMappingStore((store) => store.getButtonAction)

  useEffect(() => {
    const longPressTimeouts = new Map<string, number>()
    const buttonStates: { [key: string]: EventMode } = {}

    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return

      // Only set down if it is not already down or already a long press
      if (
        buttonStates[e.key] !== EventMode.PressLong &&
        buttonStates[e.key] !== EventMode.KeyDown
      ) {
        const action = getActions(e.code, EventMode.KeyDown)
        if (action) executeAction(action)
        buttonStates[e.key] = EventMode.KeyDown
      }

      // Ensure that you dont double-call a long press
      if (!longPressTimeouts.has(e.key)) {
        const timeout = window.setTimeout(() => {
          buttonStates[e.key] = EventMode.PressLong
          const longPressAction = getActions(e.code, EventMode.PressLong)
          if (longPressAction) executeAction(longPressAction)
        }, 400)

        longPressTimeouts.set(e.key, timeout)
      }
    }
    const keyUpHandler = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return

      // Dont notify if the most recent action was a longpress
      if (buttonStates[e.key] !== EventMode.PressLong) {
        const shortPressAction = getActions(e.code, EventMode.PressShort)
        shortPressAction && executeAction(shortPressAction)
      }

      const action = getActions(e.code, EventMode.KeyUp)
      action && executeAction(action)
      buttonStates[e.key] = EventMode.KeyUp

      // Clear the event timeout to cancel a long press and cleanup
      if (longPressTimeouts.has(e.key)) {
        clearTimeout(longPressTimeouts.get(e.key)!)
        longPressTimeouts.delete(e.key)
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
      const deltaY = event.deltaY
      const deltaX = event.deltaX

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal scroll
        executeKey('Scroll', deltaX > 0 ? EventMode.ScrollRight : EventMode.ScrollLeft)
      } else {
        // Vertical scroll
        executeKey('Scroll', deltaY > 0 ? EventMode.ScrollDown : EventMode.ScrollUp)
      }
    }

    window.addEventListener('wheel', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleScroll)
    }
  }, [])

  return null
}
