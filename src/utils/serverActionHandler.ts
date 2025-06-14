import {
  useMusicStore,
  useSettingsStore,
  useAppStore,
  useMappingStore,
  useWebSocketStore
} from '../stores'
import { useUIStore } from '@src/stores/uiStore'
import {
  Action,
  AUDIO_REQUESTS,
  EventMode,
  ActionReference,
  ViewMode,
  DeviceToDeskthingData,
  DEVICE_DESKTHING,
  SongEvent,
  MusicEventPayloads
} from '@deskthing/types'
import Logger from './Logger'

/**
 * The `ActionHandler` class is a singleton that manages the execution of actions in the application.
 * It handles both server-side and client-side actions, and provides methods for common actions such as
 * play/pause, skip, seek, rewind, shuffle, repeat, volume control, and navigation between views.
 *
 * The class maintains a mapping of action IDs to their corresponding handler functions, and dispatches
 * actions to the appropriate handler based on the action's source (server or client).
 *
 * The `executeAction` method is used to execute an action based on a button press and event mode.
 * The `runAction` method is used to execute an action directly, and handles the appropriate logic
 * based on the action's source.
 *
 * The class also provides methods for handling specific actions, such as toggling fullscreen mode,
 * updating the app tray state, and navigating between views.
 */
export class ActionHandler {
  private static instance: ActionHandler

  private constructor() {}

  static getInstance(): ActionHandler {
    if (!ActionHandler.instance) {
      ActionHandler.instance = new ActionHandler()
    }
    return ActionHandler.instance
  }

  private sendMessage = async (data: DeviceToDeskthingData) => {
    const send = useWebSocketStore.getState().send
    await send(data)
  }

  executeAction = async (button: string, mode: EventMode): Promise<void> => {
    const action = useMappingStore.getState().getButtonAction?.(button, mode)
    if (!action) {
      return
    }

    this.runAction(action)
  }

  public runAction = async (action: Action | ActionReference): Promise<void> => {
    const { source } = action
    Logger.info(`Running action: ${action.id}`)

    if (source === 'server') {
      this.handleServerAction(action)
    } else {
      await this.handleAppAction(action)
    }
  }

  private async handleServerAction(action: Action | ActionReference): Promise<void> {
    const handler = this.actionMap[action.id]
    if (handler) {
      handler(action)
    } else {
      console.warn(`No handler found for action: ${action.id}`)
      const socketData: DeviceToDeskthingData = {
        type: DEVICE_DESKTHING.ACTION,
        app: 'server',
        payload: action
      }
      this.sendMessage(socketData)
    }
  }

  private async handleAppAction(action: Action | ActionReference): Promise<void> {
    try {
      const socketData: DeviceToDeskthingData = {
        type: DEVICE_DESKTHING.ACTION,
        app: 'server',
        payload: action
      }
      await this.sendMessage(socketData)
    } catch (error) {
      console.error(`Failed to forward action to server: ${error}`)
    }
  }

  private handleHideAction(action: Action): void {
    const currentState = useSettingsStore.getState().preferences.appTrayState
    const stateTransitions = {
      hide: {
        full: ViewMode.PEEK,
        peek: ViewMode.HIDDEN,
        hidden: ViewMode.HIDDEN
      },
      show: {
        hidden: ViewMode.PEEK,
        peek: ViewMode.FULL,
        full: ViewMode.FULL
      }
    }

    const newState = stateTransitions[action.value][currentState]
    useSettingsStore.getState().updatePreferences({ appTrayState: newState })
  }
  PlayPause = () => {
    const songData = useMusicStore.getState().song
    if (songData?.is_playing || false) {
      useMusicStore.getState().pause()
      useMappingStore.getState().updateIcon('play', '')
    } else {
      useMusicStore.getState().play()
      useMappingStore.getState().updateIcon('play', 'pause')
    }
  }

  Skip = () => {
    useMusicStore.getState().next()
  }

  Seek = (ms: number) => {
    useMusicStore.getState().seek(ms)
    this.handleSendCommand(AUDIO_REQUESTS.SEEK, ms)
  }

  Rewind = () => {
    useMusicStore.getState().previous()
    setTimeout(() => {
      useMusicStore.getState().requestMusicData()
    }, 1000)
  }

  Shuffle = () => {
    const songData = useMusicStore.getState().song
    if (songData?.shuffle_state) {
      useMappingStore.getState().updateIcon('shuffle', 'shuffleDisabled')
    } else {
      useMappingStore.getState().updateIcon('shuffle', '')
    }
    useMusicStore.getState().setShuffle()
  }

  Repeat = () => {
    const songData = useMusicStore.getState().song
    let newRepeatState
    switch (songData.repeat_state) {
      case 'off':
        newRepeatState = 'context'
        useMappingStore.getState().updateIcon('repeat', '')
        break
      case 'context':
        newRepeatState = 'track'
        useMappingStore.getState().updateIcon('repeat', 'repeatActive')
        break
      case 'track':
        newRepeatState = 'off'
        useMappingStore.getState().updateIcon('repeat', 'repeatDisabled')
        break
      default:
        newRepeatState = 'off'
    }
    useMusicStore.getState().setRepeat(newRepeatState)
  }

  Pref = (action: Action) => {
    const updateSettings = useSettingsStore.getState().updatePreferences

    const app = this.getAppByButtonIndex(Number(action.value))

    updateSettings({
      currentView: {
        name: app,
        enabled: true,
        running: true,
        timeStarted: 0,
        prefIndex: 0
      }
    })
  }

  private getAppByButtonIndex = (index: number): string => {
    const apps = useAppStore.getState().apps
    if (index < apps.length) {
      return apps[index]?.name || 'Unknown'
    }
    return 'dashboard'
  }

  Swap = async (action: Action) => {
    const currentView = useSettingsStore.getState().preferences?.currentView?.name
    const socketData: DeviceToDeskthingData = {
      app: 'server',
      type: DEVICE_DESKTHING.SET,
      request: 'update_pref_index',
      payload: {
        app: currentView,
        index: Number(action.value)
      }
    }

    this.sendMessage(socketData)
  }

  VolUp = () => {
    const volume = useMusicStore.getState().song.volume
    if (volume <= 95) {
      useMusicStore.getState().setVolume(volume + 5)
    }
  }

  VolDown = () => {
    const volume = useMusicStore.getState().song.volume
    if (volume >= 5) {
      useMusicStore.getState().setVolume(volume - 5)
    }
  }

  private handleSendCommand = <
    R extends Extract<MusicEventPayloads, { type: SongEvent.SET }>['request'],
    P extends Extract<MusicEventPayloads, { type: SongEvent.SET; request: R }>['payload']
  >(
    request: R,
    payload: P
  ) => {
    const data = {
      app: 'music',
      type: SongEvent.SET,
      request: request,
      payload: payload
    } as MusicEventPayloads
    this.sendMessage(data)
  }

  toggleFullscreen = () => {
    const doc = document

    try {
      if (!doc.fullscreenElement) {
        document.documentElement.requestFullscreen()
        Logger.info('Entering Fullscreen')
        useMappingStore.getState().updateIcon('fullscreen', 'fullscreenActive')
      } else {
        doc.exitFullscreen()
        Logger.info('Leaving Fullscreen')
        useMappingStore.getState().updateIcon('fullscreen', '')
      }
    } catch (error) {
      Logger.error(`Error with Fullscreen!`, error)
    }
  }

  swipeL() {
    const currentView = useSettingsStore.getState().preferences?.currentView?.name
    const apps = useAppStore.getState().apps
    const currentIndex = apps.findIndex((app) => app.name === currentView)
    const nextIndex = (currentIndex - 1 + apps.length) % apps.length
    useSettingsStore.getState().updatePreferences({
      currentView: apps[nextIndex] || {
        name: 'dashboard',
        enabled: true,
        running: true,
        timeStarted: 0,
        prefIndex: 0
      }
    })
  }

  Wheel() {
    // do nothing
  }

  swipeR() {
    const currentView = useSettingsStore.getState().preferences?.currentView?.name
    const apps = useAppStore.getState().apps
    const currentIndex = apps.findIndex((app) => app.name === currentView)
    const nextIndex = (currentIndex + 1) % apps.length
    useSettingsStore.getState().updatePreferences({
      currentView: apps[nextIndex] || {
        name: 'dashboard',
        enabled: true,
        running: true,
        timeStarted: 0,
        prefIndex: 0
      }
    })
  }

  open = (action: Action) => {
    useSettingsStore.getState().updatePreferences({
      currentView: {
        name: action.value,
        enabled: true,
        running: true,
        timeStarted: 0,
        prefIndex: 0
      }
    })
  }

  private actionMap = {
    fullscreen: this.toggleFullscreen,
    shuffle: this.Shuffle,
    rewind: this.Rewind,
    play: this.PlayPause,
    skip: this.Skip,
    repeat: this.Repeat,
    wheel: this.Wheel,
    pref: this.Pref,
    swap: this.Swap,
    voldown: this.VolDown,
    volup: this.VolUp,
    appslist: this.handleHideAction,
    swipel: this.swipeL,
    swiper: this.swipeR,
    open: this.open
  }
}

export default ActionHandler.getInstance()
