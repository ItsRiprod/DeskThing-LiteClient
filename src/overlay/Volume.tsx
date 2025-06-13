import { useMusicStore, useSettingsStore } from '@src/stores'
import { useCallback, useEffect, useState } from 'react'

/**
 * A React component that renders a volume overlay UI element.
 * The overlay allows the user to adjust the volume of the current music track by interacting with a volume slider.
 * The overlay is initially visible for 3 seconds, then fades out and becomes hidden until the user interacts with it again.
 */
const VolumeOverlay: React.FC = () => {
  const setMusicVolume = useMusicStore((store) => store.setVolume)
  const color = useSettingsStore((store) => store.preferences.theme?.primary)
  const musicVolume = useMusicStore((store) => store.song?.volume)
  const [touching, setIsTouching] = useState(false)
  const [visible, setIsVisible] = useState(false)

  const handleInput = useCallback(
    (clientX: number, element: HTMLDivElement) => {
      setIsTouching(true)
      const rect = element.getBoundingClientRect()
      const x = clientX - rect.left
      const width = rect.width
      const percentage = Math.min(Math.max((x / width) * 100, 0), 100)
      if (percentage !== musicVolume) {
        setMusicVolume(Math.round(percentage))
      }
    },
    [musicVolume]
  )

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
      setIsTouching(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [musicVolume])

  const handleMouse = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      handleInput(e.clientX, e.currentTarget)
    },
    [handleInput]
  )

  const handleTouch = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      handleInput(e.touches[0].clientX, e.currentTarget)
    },
    [handleInput]
  )

  return (
    <div
      className={`${visible ? 'top-4' : 'top-0 opacity-0'} ${touching ? 'h-8' : ' h-2'} transition-all ease-in-out fixed overflow-hidden w-2/3 bg-black/50 rounded-full flex flex-col items-start cursor-pointer`}
      onMouseDown={handleMouse}
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
    >
      <div style={{ width: `${musicVolume}%`, background: color }} className={`h-full`}></div>
    </div>
  )
}

export default VolumeOverlay
