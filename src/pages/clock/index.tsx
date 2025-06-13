import { TimeUpdater } from '@src/components/TimeUpdater'
import { useMusicStore, useSettingsStore } from '@src/stores'
import { useTimeStore } from '@src/stores/timeStore'
import { FC, useEffect, useState, useRef } from 'react'

/**
 * The main component for the Clock page, which displays the current time and provides settings to customize the appearance.
 *
 * The component renders the current time, with an optional blurred background image from the currently playing song. It also provides a configuration panel that allows the user to toggle the display of the album art, switch between 12-hour and 24-hour time formats, and customize the text color.
 *
 * The configuration panel is positioned absolutely and can be opened and closed by clicking on the main content area.
 */
const ClockPage: FC = () => {
  const musicData = useMusicStore((state) => state.song)
  const time = useTimeStore((state) => state.currentTimeFormatted)
  const syncTime = useTimeStore((state) => state.updateCurrentTime)
  const [showConfig, setShowConfig] = useState(false)
  const use24hour = useSettingsStore((state) => state.preferences.use24hour)

  const configRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (configRef.current && !configRef.current.contains(event.target as Node)) {
        setShowConfig(false)
      } else if (mainRef.current && mainRef.current.contains(event.target as Node)) {
        setShowConfig(true)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showConfig])

  useEffect(() => {
    syncTime()
  }, [use24hour])

  return (
    <div ref={mainRef} className="relative w-full flex items-center justify-center h-full">
      <TimeUpdater />
      {musicData && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${musicData.thumbnail})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(25px) brightness(0.5)',
            opacity: 0.8
          }}
        />
      )}
      <div className="absolute w-full h-full inset-0 flex items-center justify-center">
        <p
          className="text-9xl"
        >
          {time}
        </p>
      </div>
    </div>
  )
}

export default ClockPage