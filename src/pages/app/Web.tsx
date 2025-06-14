import { TimeUpdater } from '@src/components/TimeUpdater'
import {
  useAppStore,
  useMappingStore,
  useMusicStore,
  useSettingsStore,
  useWebSocketStore
} from '@src/stores'
import { useTimeStore } from '@src/stores/timeStore'
import {
  CLIENT_REQUESTS,
  ClientToDeviceData,
  DEVICE_CLIENT,
  DEVICE_DESKTHING,
  DeviceToClientCore
} from '@deskthing/types'
import { useRef, useEffect } from 'react'
import Logger from '@src/utils/Logger'

interface WebPageProps {
  currentView: string
}

/**
 * The `WebPage` component is responsible for rendering an iframe that displays the current view of the application. It handles various interactions between the iframe and the main application, such as triggering actions, handling button and key presses, and responding to requests for music, settings, apps, key icons, and action icons.
 *
 * The component uses several hooks to access the state and functionality of the application, including the `useAppStore`, `useMusicStore`, `useSettingsStore`, `useWebSocketStore`, and `useTimeStore`.
 *
 * The component sets up event listeners to handle messages received from the iframe, and sends data to the iframe as needed. It also sets up a timeout to send default data (music, settings, and time) to the iframe after a short delay.
 *
 * @param {WebPageProps} props - The props for the `WebPage` component.
 * @param {string} props.currentView - The current view of the application.
 * @returns {JSX.Element} - The rendered `WebPage` component.
 */
const WebPage: React.FC<WebPageProps> = ({ currentView }: WebPageProps): JSX.Element => {
  const ip = useSettingsStore((state) => state.manifest?.context?.ip)
  const port = useSettingsStore((state) => state.manifest?.context?.port)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const appSettings = useAppStore((state) => state.appSettings)
  const music = useMusicStore((state) => state.song)
  const apps = useAppStore((state) => state.apps)
  const addWebsocketListener = useWebSocketStore((state) => state.addListener)
  const sendSocket = useWebSocketStore((state) => state.send)
  const getActionUrl = useMappingStore((state) => state.getActionUrl)
  const getKeyUrl = useMappingStore((state) => state.getKeyUrl)
  const executeAction = useMappingStore((state) => state.executeAction)
  const executeKey = useMappingStore((state) => state.executeKey)
  const currentTime = useTimeStore((state) => state.currentTimeFormatted)
  const manifest = useSettingsStore((state) => state.manifest)

  // Handles any music requests from the iframe to the main app
  const handleMusic = () => {
    send({ type: DEVICE_CLIENT.MUSIC, app: 'client', payload: music })
  }

  // Handles any settings requests from the iframe to the main app
  const handleSettings = () => {
    send({ type: DEVICE_CLIENT.SETTINGS, app: 'client', payload: appSettings[currentView] })
  }

  // Handles any apps requests from the iframe to the main app
  const handleApps = () => {
    send({ type: DEVICE_CLIENT.APPS, app: 'client', payload: apps })
  }

  // Handles any key icon requests from the iframe to the main app
  const handleKeyIcon = (
    payload: Extract<ClientToDeviceData, { request: 'key'; app: 'client'; type: 'get' }>['payload']
  ) => {
    const actionUrl = getKeyUrl(payload)
    send({
      type: payload.id,
      app: 'client',
      payload: actionUrl,
      request: 'set'
    } as DeviceToClientCore)
  }

  // Handles any action icon requests from the iframe to the main app
  const handleActionIcon = (
    payload: Extract<
      ClientToDeviceData,
      { request: 'action'; app: 'client'; type: 'get' }
    >['payload']
  ) => {
    const actionUrl = getActionUrl(payload)
    send({
      type: payload.id,
      app: 'client',
      payload: actionUrl,
      request: 'set'
    } as DeviceToClientCore)
  }

  const handleManifest = () => {
    send({ type: DEVICE_CLIENT.MANIFEST, app: 'client', payload: manifest })
  }
  const getRequestHandlers: {
    [key in Extract<ClientToDeviceData, { app: 'client'; type: 'get' }>['request']]: (
      data: Extract<ClientToDeviceData, { request: key; app: 'client'; type: 'get' }>['payload']
    ) => void
  } = {
    music: handleMusic,
    settings: handleSettings,
    apps: handleApps,
    key: handleKeyIcon,
    action: handleActionIcon,
    manifest: handleManifest
  }

  const send = (data: DeviceToClientCore) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const augmentedData = { ...data, source: 'deskthing' }
      iframeRef.current.contentWindow.postMessage(augmentedData, '*')
    }
  }

  useEffect(() => {
    const removeListener = addWebsocketListener((data) => {
      if (data.app != currentView) return

      send(data as unknown as DeviceToClientCore)
    })

    return () => {
      removeListener()
    }
  }, [currentView, addWebsocketListener])

  useEffect(() => {
    if (music) {
      send({ type: DEVICE_CLIENT.MUSIC, app: 'client', payload: music })
    }
  }, [music])

  useEffect(() => {
    if (apps) {
      send({ type: DEVICE_CLIENT.APPS, app: 'client', payload: apps })
    }
  }, [apps])

  useEffect(() => {
    if (appSettings && appSettings[currentView]) {
      send({
        type: DEVICE_CLIENT.SETTINGS,
        app: 'client',
        payload: appSettings[currentView]
      })
    }
  }, [appSettings, currentView])

  useEffect(() => {
    if (currentTime) {
      send({ type: DEVICE_CLIENT.TIME, app: 'client', request: 'set', payload: currentTime })
    }
  }, [currentTime])

  useEffect(() => {
    const sendDefaultData = async () => {
      send({ type: DEVICE_CLIENT.MUSIC, app: 'client', payload: music })
      if (appSettings && appSettings[currentView]) {
        send({
          type: DEVICE_CLIENT.SETTINGS,
          app: 'client',
          payload: appSettings[currentView]
        })
      }
      currentTime &&
        send({ type: DEVICE_CLIENT.TIME, app: 'client', request: 'set', payload: currentTime })
    }

    const id = setTimeout(sendDefaultData, 1000)

    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    const handleIframeEvent = (event: MessageEvent) => {
      if (event.origin != `http://${ip}:${port}`) return

      const appDataRequest = event.data.payload as ClientToDeviceData

      if (appDataRequest.app == 'client') {
        if (appDataRequest.type === CLIENT_REQUESTS.GET) {
          if (getRequestHandlers[appDataRequest.request]) {
            const handler = getRequestHandlers[appDataRequest.request] as (
              payload: typeof appDataRequest.payload
            ) => void
            handler(appDataRequest.payload)
          } else {
            Logger.error('Unknown request type: ', appDataRequest.request)
          }
        } else if (appDataRequest.type === 'key') {
          executeKey(appDataRequest.payload.id, appDataRequest.payload.mode)
        } else if (appDataRequest.type === 'action') {
          executeAction({ source: currentView, ...appDataRequest.payload })
        } else if (appDataRequest.type === 'log') {
          Logger.log(appDataRequest.request, currentView, appDataRequest.payload.message, ...appDataRequest.payload.data)
        }
      } else {
        sendSocket({
          type: DEVICE_DESKTHING.APP_PAYLOAD,
          payload: appDataRequest,
          app: typeof appDataRequest.app == 'string' ? appDataRequest.app : currentView
        })
      }
    }

    window.addEventListener('message', handleIframeEvent)

    return () => {
      window.removeEventListener('message', handleIframeEvent)
    }
  }, [ip, port, sendSocket, appSettings, currentView])

  return (
    <>
      <TimeUpdater />
      <iframe
        ref={iframeRef}
        key={currentView}
        src={`http://${ip}:${port}/app/${currentView}`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Web View"
        height="100%"
        width="100%"
      />
    </>
  )
}

export default WebPage
