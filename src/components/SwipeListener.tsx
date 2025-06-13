import { useMappingStore } from '@src/stores'
import { useEffect } from 'react'
import { EventMode } from '@deskthing/types'

/**
 * A React component that listens for swipe gestures on the window and executes corresponding actions based on the swipe direction.
 * 
 * The component uses the `useMappingStore` hook to access the `executeAction` and `getButtonAction` functions from the store.
 * It sets up event listeners for `touchstart`, `touchend`, `mousedown`, and `mouseup` events on the window.
 * When a swipe gesture is detected, the component retrieves the corresponding action from the store and executes it.
 * The component returns `null` and does not render any UI elements.
 */
export const SwipeListener = () => {
  const executeAction = useMappingStore((store) => store.executeAction)
  const getActions = useMappingStore((store) => store.getButtonAction)

  useEffect(() => {
    let startX: number | null = null
    let startY: number | null = null
    let startTime: number | null = null
    const swipeThreshold = 50
    const swipeTimeThreshold = 500 // 500ms timeout for swipe

    const startHandler = (e: TouchEvent | MouseEvent) => {
      if (e.defaultPrevented) return
      if (e instanceof TouchEvent) {
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
      } else {
        startX = e.clientX
        startY = e.clientY
      }
      startTime = Date.now()
    }

    const endHandler = (e: TouchEvent | MouseEvent) => {
      if (e.defaultPrevented) return
      if (!startX || !startY || !startTime) return

      let endX: number
      let endY: number

      if (e instanceof TouchEvent) {
        endX = e.changedTouches[0].clientX
        endY = e.changedTouches[0].clientY
      } else {
        endX = e.clientX
        endY = e.clientY
      }
      const endTime = Date.now()

      const deltaX = endX - startX
      const deltaY = endY - startY
      const deltaTime = endTime - startTime

      if (deltaTime <= swipeTimeThreshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (Math.abs(deltaX) > swipeThreshold) {
            if (deltaX > 0) {
              const action = getActions('Swipe', EventMode.SwipeRight)
              action && executeAction(action)
            } else {
              const action = getActions('Swipe', EventMode.SwipeLeft)
              action && executeAction(action)
            }
          }
        } else {
          // Vertical swipe
          if (Math.abs(deltaY) > swipeThreshold) {
            if (deltaY > 0) {
              const action = getActions('Swipe', EventMode.SwipeDown)
              action && executeAction(action)
            } else {
              const action = getActions('Swipe', EventMode.SwipeUp)
              action && executeAction(action)
            }
          }
        }
      }

      startX = null
      startY = null
      startTime = null
    }

    window.addEventListener('touchstart', startHandler, { passive: true })
    window.addEventListener('touchend', endHandler, { passive: true })
    window.addEventListener('mousedown', startHandler, { passive: true })
    window.addEventListener('mouseup', endHandler, { passive: true })

    return () => {
      window.removeEventListener('touchstart', startHandler)
      window.removeEventListener('touchend', endHandler)
      window.removeEventListener('mousedown', startHandler)
      window.removeEventListener('mouseup', endHandler)
    }
  }, [])
  return null
}
