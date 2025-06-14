import { FC, useRef, useEffect, useState, useCallback } from 'react'
import { TimeUpdater } from '@src/components/TimeUpdater'
import { useTimeStore, useAppStore, useSettingsStore } from '@src/stores'
import AppIcon from '@src/components/ui/AppButton'
import { useUIStore } from '@src/stores/uiStore'
import { App, EventMode } from '@deskthing/types'
import { InformationComponent } from './InformationComponent'
import { TopBarComponent } from './TopBarComponent'

export const DashboardPage: FC = () => {
  const apps = useAppStore((store) => store.apps)
  const wheelRotation = useUIStore((state) => state.wheelRotation)
  const registerKeyHandler = useUIStore((state) => state.registerKeyHandler)
  const setPage = useSettingsStore((state) => state.updateCurrentView)
  const selectedAppRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const appsContainerRef = useRef<HTMLDivElement>(null)

  const [scrollY, setScrollY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ y: 0, scrollY: 0 })
  const [maxScroll, setMaxScroll] = useState(0)

  const clampedWheelRotation = wheelRotation % apps.length

  // Calculate scroll position based on time visibility
  const timeHeight = 200 // Approximate height of time section

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
      console.log('handling event', code, eventMode)
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
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 overflow-hidden flex flex-col relative select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: 'none' }}
    >
      <TimeUpdater />
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
        <div className="w-full flex items-center pt-4 justify-center transition-all duration-300">
          <InformationComponent />
        </div>

        {/* Apps grid */}
        <div ref={appsContainerRef} className="justify-evenly flex flex-wrap p-8 w-full">
          {apps &&
            apps.map((app, index) => (
              <div ref={clampedWheelRotation === index ? selectedAppRef : null} key={app.name}>
                <button
                  className={`w-36 h-36 flex m-1 items-center flex-col justify-center p-4 rounded-3xl border-2 transition-all duration-300 ${
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
            ))}
        </div>
      </div>
    </div>
  )
}
