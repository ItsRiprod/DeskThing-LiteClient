import { IconAlbum, IconArrowDown, IconLoading } from '@src/assets/Icons'
import ActionComponent from '@src/components/ui/Action'
import Key from '@src/components/ui/Key'
import { useMappingStore, useMusicStore, useSettingsStore } from '@src/stores'
import { Action, EventMode, ViewMode } from '@deskthing/types'
import { ScrollingText } from '@src/components/ui/ScrollingText'
import React, { MouseEvent, useEffect, useState } from 'react'
import ProgressBar from './ProgressBar'
import Button from '@src/components/ui/Button'

const fullscreenAction: Action = {
  name: 'Open App',
  id: 'open',
  value: 'nowplaying',
  value_instructions: 'The id of the app to open',
  description: 'Opens the app defined in the value',
  source: 'server',
  version: '0.9.0',
  version_code: 9,
  enabled: true
}

/**
 * The Miniplayer component is a React component that renders a mini player UI for a music player application.
 * It displays the current song information, a progress bar, and various actions that can be performed on the player.
 * The component is designed to be responsive and can adjust its size and layout based on the user's preferences and the current view mode.
 * The component also handles refreshing the song data and managing the visibility and state of the mini player.
 */
const Miniplayer: React.FC = () => {
  const miniplayer = useSettingsStore((store) => store.preferences.miniplayer)
  const theme = useSettingsStore((store) => store.preferences.theme)
  const song = useMusicStore((store) => store.song)
  const getSong = useMusicStore((store) => store.requestMusicData)
  const currentView = useSettingsStore((store) => store.preferences.currentView)
  const isPullTabVisible = useSettingsStore((store) => store.preferences.showPullTabs)
  const [tabVisible, setTabVisible] = useState(true)
  const setMiniplayerState = useSettingsStore((store) => store.updatePreferences)

  const [height, setHeight] = useState('h-16')
  const [width, setWidth] = useState('w-16')
  const [expanded, setExpanded] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const [refreshing, setIsRefreshing] = useState(false)

  const [isAudioSource, setIsAudioSource] = useState(false)

  useEffect(() => {
    if (currentView.name == 'nowplaying' || currentView?.manifest?.isAudioSource) {
      setIsAudioSource(true)
      setExpanded(true)
    } else {
      setIsAudioSource(false)
      setExpanded(false)
    }
  }, [currentView])

  useEffect(() => {
    setHeight(theme.scale == 'small' ? 'h-16' : theme.scale == 'medium' ? 'h-32' : 'h-48')
    setWidth(theme.scale == 'small' ? 'w-16' : theme.scale == 'medium' ? 'w-32' : 'w-48')
  }, [theme])

  const refreshSong = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // Early break to stop spamming
    if (refreshing) return

    // Set the refreshing state
    setIsRefreshing(true)

    // Set the timeout to clear the state
    setTimeout(
      () => {
        setIsRefreshing(false)
      },
      Math.random() * 1000 + 1000
    )

    getSong(true)
    onClick()
  }

  const onClick = () => {
    if (timeoutId) clearTimeout(timeoutId)
    const newTimeout = setTimeout(() => {
      if (currentView.name != 'nowplaying' || !currentView?.manifest?.isAudioSource) return
      setExpanded(false)
    }, 12000)
    setTimeoutId(newTimeout)

    if (expanded) {
      if (currentView.name != 'nowplaying' || !currentView?.manifest?.isAudioSource) return
      setExpanded(false)
    } else {
      setExpanded(true)
    }
  }

  const onToggleHeight = () => {
    if (miniplayer.state == ViewMode.PEEK) {
      setMiniplayerState({
        miniplayer: {
          position: miniplayer.position || 'bottom',
          state: ViewMode.HIDDEN,
          visible: miniplayer.visible ?? true
        }
      })
    } else if (miniplayer.state == ViewMode.HIDDEN) {
      setMiniplayerState({
        miniplayer: {
          position: miniplayer.position || 'bottom',
          state: ViewMode.PEEK,
          visible: miniplayer.visible ?? true
        }
      })
    }
  }

  useEffect(() => {
    setTabVisible(true)
    const timer = setTimeout(() => {
      setTabVisible(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [miniplayer.state, currentView])

  if (miniplayer.position == 'left') return null

  return (
    <div
      style={{ background: theme.background }}
      className={`absolute left-0 flex flex-col h-fit w-screen bottom-0`}
    >
      {isPullTabVisible && (
        <div
          className={`absolute rounded-t-lg flex justify-center -top-12 items-center h-12 w-24 bg-zinc-900/90 backdrop-blur-md shadow-lg transition-all duration-300 ${tabVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'}`}
          onMouseEnter={() => setTabVisible(true)}
          onTouchStart={() => setTabVisible(true)}
        >
          <Button 
            className="hover:bg-zinc-800 rounded-full p-2 transition-colors duration-200" 
            onClick={onToggleHeight}
          >
            <IconArrowDown
              className={`w-6 h-6 ${miniplayer.state == ViewMode.HIDDEN ? 'rotate-180' : ''} transition-transform duration-200 ease-in-out`}
            />
          </Button>
        </div>
      )}
      <ProgressBar />
      <div
        className={`${miniplayer.state == ViewMode.PEEK ? height : 'h-0'} transition-[height] overflow-hidden flex w-full items-center justify-center`}
      >
        {!isAudioSource && (
          <button
            onClick={refreshSong}
            className={`${height} ${width} ${miniplayer.state == ViewMode.HIDDEN ? 'max-h-0 overflow-hidden' : 'flex-shrink-0'} flex items-center justify-center`}
          >
            {song?.thumbnail ? (
              <img src={song.thumbnail} className="w-full h-full object-cover" />
            ) : (
              <IconAlbum className="h-full w-full p-4" />
            )}
            <div
              className={`${refreshing ? '' : 'opacity-0'} ${miniplayer.state == ViewMode.HIDDEN ? 'max-h-0 overflow-hidden' : 'flex-shrink-0'} bg-black/50 duration-1000 transition-opacity absolute flex items-center justify-center ${expanded ? height : 'h-0'} ${width}`}
            >
              <IconLoading
                className={`${refreshing ? 'animate-spin opacity-100' : 'opacity-0'} w-1/2 h-1/2 rounded-full`}
              />
            </div>
          </button>
        )}
        <div className={`flex justify-evenly w-full ${height}`}>
          {!expanded && (
            <button
              onClick={onClick}
              className={`animate-drop max-w-80 sm:max-w-96 md:max-w-[75%] lg:max-w-[1024px] xl:max-w-[75%] ml-4 w-full flex flex-col items-start justify-center`}
            >
              <ScrollingText
                className="text-3xl text-justify max-w-80 sm:max-w-96 md:max-w-[400px] lg:max-w-[1024px] xl:max-w-[75%] font-semibold"
                fadeWidth={48}
                text={song?.track_name || 'Loading Song Name'}
              />
              <p className="text-gray-500">{song?.artist || 'Loading Artist'}</p>
            </button>
          )}
          {expanded && (
            <DynamicAction>
              <div className="flex items-center justify-center cursor-pointer w-full h-full">
                <LowerMiniplayer onClick={onToggleHeight} className="w-1/2 h-full" />
              </div>
            </DynamicAction>
          )}
          {expanded && <DynamicAction keyId="DynamicAction1" />}
          {expanded && <DynamicAction keyId="DynamicAction2" />}
          {expanded && <DynamicAction keyId="DynamicAction3" />}
          {expanded && <DynamicAction keyId="DynamicAction4" />}
          {<DynamicAction keyId="Action5" />}
          {<DynamicAction keyId="Action6" />}
          {<DynamicAction keyId="Action7" />}
          {!isAudioSource && expanded && (
            <DynamicAction>
              <ActionComponent className="!w-1/2 h-full" action={fullscreenAction} />
            </DynamicAction>
          )}
        </div>
      </div>
    </div>
  )
}

interface DynamicActionProps {
  keyId?: string
  children?: React.ReactNode
  className?: string
}

const DynamicAction: React.FC<DynamicActionProps> = ({ keyId, children, className }) => {
  const getButtonAction = useMappingStore((state) => state.getButtonAction)
  const [action, setAction] = useState<Action>()

  useEffect(() => {
    const action = getButtonAction(keyId, EventMode.KeyDown)
    setAction(action)
  }, [])

  if (keyId && (!action || action.id == 'hidden')) return null

  return (
    <div className={className + ` animate-drop flex-grow h-full`}>
      {keyId && <Key className="w-1/2 h-full" keyId={keyId} />}
      {children}
    </div>
  )
}

interface LowerMiniplayerProps {
  className?: string
  onClick: () => void
}

const LowerMiniplayer: React.FC<LowerMiniplayerProps> = ({ className, onClick }) => {
  const iconColor = useSettingsStore((store) => store.preferences.theme.icons)

  return (
    <button
      className="flex items-center justify-center flex-grow h-full cursor-pointer"
      onClick={onClick}
    >
      <IconArrowDown color={iconColor} className={className + ' w-1/2 h-full'} />
    </button>
  )
}

export default Miniplayer
