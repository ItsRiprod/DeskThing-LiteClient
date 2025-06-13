import { create } from 'zustand'
import {
  AUDIO_REQUESTS,
  ClientPlatformIDs,
  DeviceToDeskthingData,
  SongData,
  SongEvent
} from '@deskthing/types'
import useWebSocketStore from './websocketStore'
import { useMappingStore } from './mappingStore'
import Logger from '@src/utils/Logger'
import { useSettingsStore } from './settingsStore'

/**
 * The `useMusicStore` is a Zustand store that manages the state of the music player.
 * It provides various actions to control the music playback, such as playing, pausing, seeking, and more.
 * The store also updates the UI icons based on the current state of the music player.
 */
export interface MusicState {
  song?: SongData | null
  setSong: (song: SongData) => void
  requestMusicData: (force?: boolean) => void
  next: () => void
  previous: () => void
  rewind: () => void
  fastForward: () => void
  play: () => void
  pause: () => void
  seek: (position: number) => void
  like: () => void
  setVolume: (volume: number) => void
  setRepeat: (state: 'context' | 'track' | 'off') => void
  setShuffle: () => void
}

export const useMusicStore = create<MusicState>((set, get) => ({
  song: null,
  setSong: (newData) => {
    Logger.info(`Received song ${newData.id}`)
    const currentSong = get().song

    // Encoding the url for use by the app
    if (newData.thumbnail) {

      // Handle any http urls
      if (newData.thumbnail.startsWith('http')) {
        const context = useSettingsStore.getState().manifest?.context
        if (context.id == ClientPlatformIDs.CarThing || context.ip == 'localhost') {
          if (newData.thumbnail.includes(`${context.ip}:${context.port}`)) return // already parsed as a corrected IP
          
          newData.thumbnail = `http://${context.ip}:${context.port}/proxy/v1?url=${encodeURIComponent(newData.thumbnail)}`
        }
      } else if (newData.thumbnail.startsWith('/')) {
        const context = useSettingsStore.getState().manifest?.context
        newData.thumbnail = `http://${context.ip}:${context.port}${newData.thumbnail}`
      }
    }

    if (!currentSong) {
      set({ song: newData })
      return
    }

    const hasChanges = Object.keys(newData).some((key) => newData[key] !== currentSong[key])

    if (hasChanges) {
      set({ song: { ...currentSong, ...newData } as SongData })
    }

    const updateIcons = async () => {
      const updateIcon = useMappingStore.getState().updateIcon
      newData?.is_playing !== undefined && updateIcon('play', newData?.is_playing ? 'pause' : '')
      newData?.repeat_state !== undefined &&
        updateIcon(
          'repeat',
          newData?.repeat_state == 'context'
            ? 'repeatActive'
            : newData?.repeat_state == 'off'
              ? 'repeatDisabled'
              : ''
        )
      newData?.shuffle_state !== undefined &&
        updateIcon('shuffle', newData?.shuffle_state ? '' : 'shuffleDisabled')
    }

    updateIcons()
  },

  requestMusicData: (force?: boolean) => {
    createWSAction({
      request: AUDIO_REQUESTS.SONG,
      app: 'music',
      type: SongEvent.GET,
      payload: force
    })
  },

  next: () => {
    const previousState = get().song
    set({ song: { ...previousState, track_progress: 0 } })
    createWSAction({
      request: AUDIO_REQUESTS.NEXT,
      app: 'music',
      type: SongEvent.SET,
      payload: previousState.id
    }).catch(() => {
      set({ song: previousState })
    })
  },

  previous: () => {
    const previousState = get().song
    set({ song: { ...previousState, track_progress: 0 } })
    createWSAction({ request: AUDIO_REQUESTS.PREVIOUS, app: 'music', type: SongEvent.SET }).catch(
      () => {
        set({ song: previousState })
      }
    )
  },

  rewind: () => {
    const previousState = get().song
    set({
      song: { ...previousState, track_progress: Math.min(previousState.track_progress - 15000, 0) }
    })
    createWSAction({ request: AUDIO_REQUESTS.REWIND, app: 'music', type: SongEvent.SET }).catch(
      () => {
        set({ song: previousState })
      }
    )
  },

  fastForward: () => {
    const previousState = get().song
    set({ song: { ...previousState, track_progress: previousState.track_progress + 15000 } })
    createWSAction({
      request: AUDIO_REQUESTS.FAST_FORWARD,
      app: 'music',
      type: SongEvent.SET
    }).catch(() => {
      set({ song: previousState })
    })
  },

  play: () => {
    const previousState = get().song
    set({ song: { ...previousState, is_playing: !previousState?.is_playing || false } })
    createWSAction({ request: AUDIO_REQUESTS.PLAY, app: 'music', type: SongEvent.SET }).catch(
      () => {
        set({ song: previousState })
      }
    )
  },

  pause: () => {
    const previousState = get().song
    set({ song: { ...previousState, is_playing: false } })
    createWSAction({ request: AUDIO_REQUESTS.PAUSE, app: 'music', type: SongEvent.SET }).catch(
      () => {
        set({ song: previousState })
      }
    )
  },

  seek: (position: number) => {
    const previousState = get().song
    set({ song: { ...get().song, track_progress: position } })
    createWSAction({
      request: AUDIO_REQUESTS.SEEK,
      payload: position,
      app: 'music',
      type: SongEvent.SET
    }).catch(() => {
      set({ song: previousState })
    })
  },

  like: () => {
    const previousState = get().song
    set({ song: { ...previousState, liked: !previousState.liked } })
    createWSAction({
      request: AUDIO_REQUESTS.LIKE,
      payload: !previousState.liked,
      app: 'music',
      type: SongEvent.SET
    }).catch(() => {
      set({ song: previousState })
    })
  },

  setVolume: (volume: number) => {
    const previousState = get().song
    set({ song: { ...get().song, volume: volume } })
    createWSAction({
      request: AUDIO_REQUESTS.VOLUME,
      payload: volume,
      app: 'music',
      type: SongEvent.SET
    }).catch(() => {
      set({ song: previousState })
    })
  },

  setRepeat: (state: 'context' | 'all' | 'track' | 'off') => {
    const previousState = get().song

    if (state == 'context') {
      state = 'all'
    }

    set({ song: { ...previousState, repeat_state: state } as SongData })
    createWSAction({
      request: AUDIO_REQUESTS.REPEAT,
      payload: state,
      app: 'music',
      type: SongEvent.SET
    }).catch(() => {
      set({ song: previousState })
    })
  },

  setShuffle: () => {
    const previousState = get().song
    set({ song: { ...previousState, shuffle_state: !previousState.shuffle_state } })
    createWSAction({
      request: AUDIO_REQUESTS.SHUFFLE,
      payload: !previousState.shuffle_state,
      app: 'music',
      type: SongEvent.SET
    }).catch(() => {
      set({ song: previousState })
    })
  }
}))
const debounceTimers: { [key in AUDIO_REQUESTS]?: NodeJS.Timeout } = {}

const createWSAction = async (
  songData: Extract<DeviceToDeskthingData, { app: 'music' }>
): Promise<void> => {
  try {

    const send = useWebSocketStore.getState().send

    // Clear any existing timeout for this request type
    if (debounceTimers[songData.request]) {
      clearTimeout(debounceTimers[songData.request])
      // Set a new timeout
      debounceTimers[songData.request] = setTimeout(() => {
        send(songData)
        delete debounceTimers[songData.request]
      }, 300) // 100ms debounce delay

    } else {

      // send first then wait on second
      send(songData)
      
      debounceTimers[songData.request] = setTimeout(() => {
        // do nothing timer
        delete debounceTimers[songData.request]
      }, 300) // 100ms debounce delay
    }
      
  } catch (error) {
    throw error
  }
}