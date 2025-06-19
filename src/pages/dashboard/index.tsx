import { FC, useRef, useEffect, useState, useCallback } from 'react'
import { useWebSocketStore, useAppStore, useSettingsStore } from '@src/stores'
import AppIcon from '@src/components/ui/AppButton'
import { useUIStore } from '@src/stores/uiStore'
import { App, DESKTHING_DEVICE, EventMode } from '@deskthing/types'
import { InformationComponent } from './InformationComponent'
import { TopBarComponent } from './TopBarComponent'
import { Hint } from '@src/components/Hint'

export const DashboardPage: FC = () => {
  // App Data
  const apps = useAppStore((store) => store.apps)

  // UI Data
  const wheelRotation = useUIStore((state) => state.wheelRotation)
  const [scrollY, setScrollY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ y: 0, scrollY: 0 })
  const [maxScroll, setMaxScroll] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Actions
  const requestApps = useAppStore((store) => store.requestApps)
  const registerKeyHandler = useUIStore((state) => state.registerKeyHandler)
  const setPage = useSettingsStore((state) => state.updateCurrentView)
  const once = useWebSocketStore((state) => state.once)

  // Render Utilities
  const selectedAppRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const appsContainerRef = useRef<HTMLDivElement>(null)
  const clampedWheelRotation = ((wheelRotation % apps.length) + apps.length) % apps.length
  const timeHeight = 800 // Approx height of time section

  // Update max scroll when apps change
  useEffect(() => {
    if (appsContainerRef.current && containerRef.current) {
      const containerHeight = containerRef.current.clientHeight
      const contentHeight = appsContainerRef.current.scrollHeight + timeHeight
      setMaxScroll(Math.max(0, contentHeight - containerHeight))
    }
  }, [apps, timeHeight])

  // Auto-scroll when wheel rotation changes
  useEffect(() => {
    if (selectedAppRef.current && containerRef.current) {
      const selectedRect = selectedAppRef.current.getBoundingClientRect()
      const containerRect = containerRef.current.getBoundingClientRect()

      // Calculate if selected app is out of view
      const isAboveView = selectedRect.top < containerRect.top + timeHeight
      const isBelowView = selectedRect.bottom > containerRect.bottom

      if (isAboveView || isBelowView) {
        // Calculate target scroll position
        const selectedTop = selectedAppRef.current.offsetTop
        const containerHeight = containerRef.current.clientHeight
        const targetScroll = Math.max(0, selectedTop - containerHeight / 2 + 80) // Center the selected app

        // Smooth scroll to target
        const startScroll = scrollY
        const distance = targetScroll - startScroll
        const duration = 300
        const startTime = Date.now()

        const animateScroll = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          const easeProgress = 1 - Math.pow(1 - progress, 3) // Ease out cubic

          const newScrollY = startScroll + distance * easeProgress
          setScrollY(Math.max(0, Math.min(newScrollY, maxScroll)))

          if (progress < 1) {
            requestAnimationFrame(animateScroll)
          }
        }

        requestAnimationFrame(animateScroll)
      }
    }
  }, [clampedWheelRotation, maxScroll])

  // Handle touch/mouse drag
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true)
      setDragStart({
        y: e.clientY,
        scrollY: scrollY
      })
      e.preventDefault()
    },
    [scrollY]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return
      e.preventDefault()

      const deltaY = dragStart.y - e.clientY
      const newScrollY = Math.max(0, Math.min(dragStart.scrollY + deltaY, maxScroll))
      setScrollY(newScrollY)
    },
    [isDragging, dragStart, maxScroll]
  )

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handle key events
  useEffect(() => {
    const removeHandler = registerKeyHandler('dashboard', (code, eventMode) => {
      if (eventMode === EventMode.PressShort && code == 'Enter') {
        const app = apps[clampedWheelRotation]
        if (app) {
          setPage(app)
        }
        return true
      }
      return false
    })

    return removeHandler
  }, [registerKeyHandler, apps, clampedWheelRotation, setPage])

  const handleAppClick = (app: App) => {
    setPage(app)
    requestApps() // handle refreshing everything while the app is loading
  }

  const handleRefreshData = async () => {
    setIsRefreshing(true)
    requestApps()
    once({ type: DESKTHING_DEVICE.APPS }, () => {
      setIsRefreshing(false)
    })
  }

  return (
    <div
      ref={containerRef}
      className="w-full max-h-screen h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 overflow-hidden flex flex-col select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: 'none' }}
    >
      {/* Top Bar */}
      <TopBarComponent />
      {/* Scrollable content */}
      <div
        className="w-full flex flex-col"
        style={{
          transform: `translateY(-${scrollY}px)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        {/* Top section */}
        <div className="w-full my-5 mt-24 flex items-center justify-center transition-all duration-300">
          <InformationComponent />
        </div>

        {/* Apps grid */}
        <div ref={appsContainerRef} className="justify-evenly flex flex-wrap p-8 w-full">
          {apps.length > 0 ? (
            apps.map((app, index) => (
              <div ref={clampedWheelRotation === index ? selectedAppRef : null} key={index}>
                <button
                  className={`w-36 h-36 flex m-1 items-center flex-col justify-center transition-transform p-4 rounded-3xl border-2 ${
                    clampedWheelRotation === index
                      ? 'border-white/20 shadow-lg shadow-white/10 scale-105 bg-white/5'
                      : 'bg-neutral-950/50 border-transparent hover:bg-white/5'
                  }`}
                  onClick={() => handleAppClick(app)}
                >
                  <p className="text-ellipsis whitespace-nowrap w-full text-center text-sm mb-3 opacity-80">
                    {app.manifest?.label}
                  </p>
                  <AppIcon app={app} key={app.name} />
                </button>
              </div>
            ))
          ) : (
            <button
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="px-4 group items-center flex justify-center py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors duration-200"
            >
              <div className="group-disabled:hidden items-center flex">
                <p className="text-sm text-white/80">Refresh</p>
              </div>
              <div className="group-disabled:flex hidden items-center">
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 mr-2 animate-spin" />
                <p className="text-sm text-white/50">Refreshing</p>
              </div>
            </button>
          )}
        </div>
      </div>
      <Hint
        flag="welcome-card"
        title="Welcome to ThinThing"
        message="You'll notice there is nothing here besides apps, this page, and a screensaver. Config should be done from the Server"
        position="center"
      />
    </div>
  )
}
