/**
 * Handles incoming WebSocket data from the server.
 *
 * The `handleServerSocket` function is responsible for dispatching the appropriate handler for the incoming WebSocket data based on the `type` and `request` properties of the `SocketData` object.
 *
 * The available handlers are defined in the `socketHandlers` object, which maps `type` and `request` values to their corresponding handler functions.
 *
 * The currently implemented handlers are:
 * - `get.manifest`: Sends the current application manifest back to the client.
 * - `set.time`: Synchronizes the client's time with the server's time.
 *
 * Additional handlers can be added to the `socketHandlers` object as needed.
 */

import { useAppStore, useClientStore, useMappingStore, useSettingsStore, useWebSocketStore } from '@src/stores'
import { useTimeStore } from '@src/stores/timeStore'
import Logger from './Logger'
import { DESKTHING_DEVICE, DeskThingToDeviceCore, DEVICE_DESKTHING, DeviceToDeskthingData } from '@deskthing/types'


type DeskThingToDevice<T extends DESKTHING_DEVICE> = Extract<DeskThingToDeviceCore, { type: T }>

type SocketHandler = {
  [T in DESKTHING_DEVICE]: (
    data: DeskThingToDevice<T>
  ) => void
}

// TODO: Make this type-safe
const sendData = (data) => {
  const send = useWebSocketStore.getState().send
  send(data)
}

const handleGetManifest = (data: DeskThingToDevice<DESKTHING_DEVICE.GET>) => {
  switch (data.request) {
    case 'manifest': {
      const manifest = useSettingsStore.getState().manifest

      const returnData: DeviceToDeskthingData = {
        type: DEVICE_DESKTHING.MANIFEST,
        app: 'server',
        payload: manifest
      }

      Logger.info('Sending manifest', returnData)
      sendData(returnData)

      break
    }
    default:
      Logger.error('Unknown request type: ', data.request)
  }
}

const handleSetTime = (data: DeskThingToDevice<DESKTHING_DEVICE.TIME>) => {
  const syncTime = useTimeStore.getState().syncTime

  if (typeof data.payload === 'string') return // not useful

  if (data.payload.utcTime && data.payload.timezoneOffset) {
    syncTime(data.payload.utcTime, data.payload.timezoneOffset)
  }
}

const HANDLE_GLOBAL_SETTINGS = (
  data: DeskThingToDevice<DESKTHING_DEVICE.GLOBAL_SETTINGS>
) => {
  const setAppSettings = useAppStore.getState().setAppSettings
  setAppSettings(data.payload)
}
const HANDLE_MAPPINGS = (data: DeskThingToDevice<DESKTHING_DEVICE.MAPPINGS>) => {
  const setMappings = useMappingStore.getState().setProfile
  setMappings(data.payload)
}
const HANDLE_ERROR = (data: DeskThingToDevice<DESKTHING_DEVICE.ERROR>) => {
  Logger.error('Received error', data.payload)
}
const HANDLE_PONG = (_data: DeskThingToDevice<DESKTHING_DEVICE.PONG>) => {
  // do nothing
}
const HANDLE_PING = (_data: DeskThingToDevice<DESKTHING_DEVICE.PING>) => {
  // do nothing
}
const HANDLE_HEARTBEAT = (_data: DeskThingToDevice<DESKTHING_DEVICE.HEARTBEAT>) => {
  // do nothing
}

const HANDLE_MUSIC = (_data: DeskThingToDevice<DESKTHING_DEVICE.MUSIC>) => {
  // dont actually do anything
}

const HANDLE_SETTINGS = (data: DeskThingToDevice<DESKTHING_DEVICE.SETTINGS>) => {
  const updateAppSettings = useAppStore.getState().updateAppSettings
  const { app, settings } = data.payload
  updateAppSettings(app, settings)
}

const HANDLE_APPS = (data: DeskThingToDevice<DESKTHING_DEVICE.APPS>) => {
  const setApps = useAppStore.getState().setApps
  setApps(data.payload)
}

const HANDLE_ICON = (data: DeskThingToDevice<DESKTHING_DEVICE.ICON>) => {
  const updateIcon = useMappingStore.getState().updateIcon
  updateIcon(data.payload.action.id, data.payload.icon, data.payload.source)
}

const HANDLE_META_DATA = (data: DeskThingToDevice<DESKTHING_DEVICE.META_DATA>) => {
  const updateClient = useClientStore.getState().updateClient
  console.log('Handling meta data', data)
  updateClient(data.payload)

  // TODO: Handle the rest of this payload
}

const HANDLE_CONFIG = (data: DeskThingToDevice<DESKTHING_DEVICE.CONFIG>) => {
  const updateConfig = useSettingsStore.getState().updatePreferences
  console.log('Received config', data)
  updateConfig(data.payload)
}

const socketHandlers: SocketHandler = {
  [DESKTHING_DEVICE.GET]: handleGetManifest,
  [DESKTHING_DEVICE.TIME]: handleSetTime,
  [DESKTHING_DEVICE.GLOBAL_SETTINGS]: HANDLE_GLOBAL_SETTINGS,
  [DESKTHING_DEVICE.MAPPINGS]: HANDLE_MAPPINGS,
  [DESKTHING_DEVICE.ERROR]: HANDLE_ERROR,
  [DESKTHING_DEVICE.PONG]: HANDLE_PONG,
  [DESKTHING_DEVICE.PING]: HANDLE_PING,
  [DESKTHING_DEVICE.HEARTBEAT]: HANDLE_HEARTBEAT,
  [DESKTHING_DEVICE.SETTINGS]: HANDLE_SETTINGS,
  [DESKTHING_DEVICE.APPS]: HANDLE_APPS,
  [DESKTHING_DEVICE.ICON]: HANDLE_ICON,
  [DESKTHING_DEVICE.META_DATA]: HANDLE_META_DATA,
  [DESKTHING_DEVICE.MUSIC]: HANDLE_MUSIC,
  [DESKTHING_DEVICE.CONFIG]: HANDLE_CONFIG
}

export const handleServerSocket = (data: DeskThingToDeviceCore) => {
  const handler = socketHandlers[data.type]

  if (handler) {
    handler(data as any)
  }
}