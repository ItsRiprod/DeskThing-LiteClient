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
import { useRef, useEffect, useState } from 'react'
import Logger from '@src/utils/Logger'
import { Hint } from '@src/components/Hint'
import { useUIStore } from '@src/stores/uiStore'
import { encodeAppId } from '@src/utils/bufferUtils'

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
  const addWebsocketBinaryListener = useWebSocketStore((state) => state.addBinaryListener)
  const sendSocketData = useWebSocketStore((state) => state.send)
  const sendSocketBinary = useWebSocketStore((state) => state.sendBinary)
  const getActionUrl = useMappingStore((state) => state.getActionUrl)
  const getKeyUrl = useMappingStore((state) => state.getKeyUrl)
  const executeAction = useMappingStore((state) => state.executeAction)
  const executeKey = useMappingStore((state) => state.executeKey)
  const currentTime = useTimeStore((state) => state.currentTimeFormatted)
  const manifest = useSettingsStore((state) => state.manifest)

  const setPage = useUIStore((state) => state.setPage)

  // Add state for error handling
  const [appError, setAppError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const appExists = apps?.some((app) => app.name === currentView)

  useEffect(() => {
    if (apps && apps.length > 0 && !appExists) {
      setAppError(`App "${currentView}" not found`)
      setIsLoading(false)
    } else if (appExists) {
      setAppError(null)
    }
  }, [apps, currentView, appExists])

  const handleIframeLoad = () => {
    setIsLoading(false)
    setAppError(null)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setAppError(`Failed to load app "${currentView}". The app may not be running or accessible.`)
  }

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

  const sendBinary = (data: ArrayBuffer) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const augmentedData = { type: 'IFRAME_BINARY', payload: data, source: 'deskthing' }
      iframeRef.current.contentWindow.postMessage(augmentedData, '*', [data])
    }
  }

  useEffect(() => {
    const removeListener = addWebsocketListener((data) => {
      if (data.app != currentView) return

      send(data as unknown as DeviceToClientCore)
    })
    const removeBinaryListener = addWebsocketBinaryListener((data) => {
      if (data.appId != currentView) return

      sendBinary(data.data)
    })

    return () => {
      removeListener()
      removeBinaryListener()
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
      if (event.origin !== `http://${ip}:${port}`) {
        console.warn('Ignored iframe message from unexpected origin:', event.origin)
        return
      }

      console.debug('iframe message received', {
        origin: event.origin,
        dataType: event.data === null ? 'null' : Object.prototype.toString.call(event.data),
        data: event.data
      })

      if (!event.data || typeof event.data.type !== 'string') {
        console.warn('Unknown message shape from iframe:', event.data)
        return
      }

      if (event.data === null) {
        console.warn('Ignored null message from iframe')
        return
      }

      if (event.data instanceof ArrayBuffer) {
        // raw binary posted directly
        const buffer = encodeAppId(currentView, event.data)
        sendSocketBinary(buffer)
        return
      }

      if (event.data instanceof Blob) {
        // blob -> arrayBuffer
        event.data
          .arrayBuffer()
          .then((ab) => {
            const buffer = encodeAppId(currentView, ab)
            sendSocketBinary(buffer)
          })
          .catch((err) => {
            console.error('Failed to read Blob message from iframe', err)
          })
        return
      }

      if (typeof event.data !== 'object' || typeof event.data.type !== 'string') {
        console.warn('Unknown message shape from iframe:', event.data)
        return
      }

      // Check if the type is IFRAME_BINARY or IFRAME_ACTION
      if (event.data.type === 'IFRAME_BINARY') {
        // encode the appId into the buffer
        const buffer = encodeAppId(currentView, event.data.payload as ArrayBuffer)
        sendSocketBinary(buffer)
      } else if (event.data.type == 'IFRAME_ACTION') {
        const appDataRequest = event.data.payload as ClientToDeviceData

        // First check if the app target is the client (this) and can be handled locally
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
            Logger.log(
              appDataRequest.request,
              currentView,
              appDataRequest.payload.message,
              ...appDataRequest.payload.data
            )
          }
        } else {
          // Otherwise forward the request to the appropriate app via WebSocket
          sendSocketData({
            type: DEVICE_DESKTHING.APP_PAYLOAD,
            payload: appDataRequest,
            app: typeof appDataRequest.app == 'string' ? appDataRequest.app : currentView
          })
        }
      } else {
        Logger.warn('Received unknown message type from iframe: ', event.data)
      }
    }

    window.addEventListener('message', handleIframeEvent)

    return () => {
      window.removeEventListener('message', handleIframeEvent)
    }
  }, [ip, port, sendSocketData, appSettings, currentView])

  const handleGoBack = () => {
    setPage('dashboard')
  }

  if (appError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="mb-4 text-red-500 text-xl">⚠️</div>
        <h2 className="text-xl font-semibold mb-2">App Not Available</h2>
        <p className="text-gray-600 mb-4">{appError}</p>
        <button
          onClick={handleGoBack}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <Hint
        flag="firstTimeOpeningApp"
        message="Click the 5th top button (the small one) or the M key (on other devices) to go back to
        the Dashboard"
      />
      <Hint
        flag="mini-controls"
        message="Or tap the bottom right to go back"
        position="bottom-right"
      />
      {isLoading && apps && apps.length > 0 && (
        <div className="fixed flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-center bg-neutral-800 p-6 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p>Loading {currentView}...</p>
          </div>
        </div>
      )}
      <button
        onClick={handleGoBack}
        className="absolute transition-opacity opacity-0 hover:opacity-100 top-0 left-0 bg-neutral-800 border-neutral-500 w-16 h-8 border-b-2 border-r-2 rounded-br-lg"
      />
      <iframe
        ref={iframeRef}
        key={currentView}
        src={`http://${ip}:${port}/app/${currentView}`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="DeskThing App"
        height="100%"
        width="100%"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        allow="microphone; camera; autoplay; fullscreen"
      />
      <button
        onClick={handleGoBack}
        className="absolute transition-opacity opacity-0 hover:opacity-100 bottom-0 right-0 bg-neutral-800 border-neutral-500 w-16 h-8 border-t-2 border-l-2 rounded-tl-lg"
      />
    </div>
  )
}

export default WebPage
