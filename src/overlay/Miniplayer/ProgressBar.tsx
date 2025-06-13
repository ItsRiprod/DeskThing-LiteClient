import { useMusicStore, useSettingsStore } from '@src/stores'
import { ViewMode } from '@deskthing/types'
import { useEffect, useState, memo } from 'react'
import Logger from '@src/utils/Logger'

interface ProgressBarProps {
  className?: string
}

/**
 * The `ProgressBar` component is a React functional component that renders a progress bar for a music player. It uses the `useMusicStore` and `useSettingsStore` hooks to access the necessary state and functions from the application's stores.

 * The component handles various user interactions, such as dragging the progress bar, clicking on the progress bar, and handling touch events. It updates the progress of the current song and triggers actions like seeking, playing the next song, or playing the previous song based on the user's interactions.

 * The component also manages the state of the progress bar, including the total length of the song, the current progress, and whether the user is currently dragging the progress bar. It updates the progress bar's appearance based on the current progress and the user's theme settings.
 */
const ProgressBar: React.FC<ProgressBarProps> = memo(({ className }) => {
  const miniplayerState = useSettingsStore((store) => store.preferences.miniplayer)
  const primary = useSettingsStore((store) => store.preferences.theme.primary)
  const setMiniplayerState = useSettingsStore((store) => store.updatePreferences)
  const songData = useMusicStore((store) => store.song)
  const seek = useMusicStore((store) => store.seek)
  const next = useMusicStore((store) => store.next)
  const previous = useMusicStore((store) => store.previous)
  const requestSongData = useMusicStore((store) => store.requestMusicData)
  const [totalLength, setTotalLength] = useState(0)
  const [progress, setCurrentProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [prevId, setPrevId] = useState('')

  useEffect(() => {
    if (!songData) return

    setPrevId(songData.id)

    if (songData && !isDragging) {
      if (songData.id != prevId) {
        setTotalLength(songData.track_duration || 30000)
        setCurrentProgress(songData.track_progress || 0)
      }

      if (songData.is_playing) {
        const timer = setInterval(() => {
          setCurrentProgress((prev) => {
            if (songData.track_progress !== undefined) {
              return Math.min(prev + 1000, totalLength)
            }
            return prev
          })
        }, 1000)
        return () => clearInterval(timer)
      }
    }
  }, [songData, totalLength, isDragging])

  useEffect(() => {
    // Checking if the song is done
    let isValid = true
    let timeoutId: NodeJS.Timeout | undefined = undefined
    if (totalLength <= progress && !isDragging) {
      setTotalLength(30000)
      setCurrentProgress(0)
      setIsDragging(false)
      
      timeoutId = setTimeout(() => { // manually request song data after a delay to avoid race conditions
        if (isValid) {
          requestSongData()
        }
      }, 2000)
    }

    return () => {
      isValid = false
      clearTimeout(timeoutId)
    }

  }, [progress, totalLength, isDragging])

  const handleMouseDown = (
    e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>
  ) => {
    if (miniplayerState.state == 'hidden') return
    if (e.cancelable) {
      e.preventDefault()
    }
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    if (miniplayerState.state == 'hidden') return
    Logger.info('mouse up ' + progress)
    if (totalLength <= progress) {
      next()
      setTotalLength(9999)
      setCurrentProgress(0)

      let oldSongId = songData?.id

      setTimeout(() => {
        if (oldSongId == songData?.id) {
          requestSongData() // attempt to request manually if the song didn't change
        }
      }, 2000)
    } else if (progress <= 0) {
      previous()
      setCurrentProgress(0)
    } else if (isDragging) {
      Logger.info('seeking to ' + progress)
      seek(Math.round(progress))
    }
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (miniplayerState.state == 'hidden') return
    if (isDragging) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = x / rect.width
      const newProgress = Math.max(0, Math.min(totalLength, percentage * totalLength))
      setCurrentProgress(newProgress)
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (miniplayerState.state == 'hidden') return
    if (isDragging) {
      const rect = e.currentTarget.getBoundingClientRect()
      const touch = e.touches[0]
      const x = touch.clientX - rect.left
      const percentage = x / rect.width
      const newProgress = Math.max(0, Math.min(totalLength, percentage * totalLength))
      setCurrentProgress(newProgress)
    }
  }

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (miniplayerState.state == 'hidden') {
      setMiniplayerState({
        miniplayer: {
          position: miniplayerState.position || 'bottom',
          state: ViewMode.PEEK,
          visible: miniplayerState.visible ?? true
        }
      })
    } else {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = x / rect.width
      const newProgress = Math.max(0, Math.min(totalLength, percentage * totalLength))
      setCurrentProgress(newProgress)
    }
  }

  return (
    <button
      className={`${className} w-screen ${isDragging ? 'h-6' : 'h-2'} transition-[height] bg-zinc-900`}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onTouchMove={handleTouchMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <div className="w-full absolute h-5 -top-5"></div>
      <div
        style={{ width: `${(progress / totalLength) * 100}%`, backgroundColor: primary }}
        className="h-full w-full bottom-0 bg-gray-200"
      ></div>
    </button>
  )
}, (prevProps, nextProps) => {
  return (
    prevProps.className === nextProps.className
  )
})

export default ProgressBar
