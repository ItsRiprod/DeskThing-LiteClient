import { IconLoading } from '@src/assets/Icons'
import { useWebSocketStore } from '@src/stores/'
import { useUIStore } from '@src/stores/uiStore'

/**
 * Renders a component that displays the connection status of the WebSocket connection.
 *
 * If the WebSocket connection is connected, this component will not render anything.
 * If the WebSocket connection is disconnected, this component will render a fixed
 * notification at the top-left of the screen indicating the disconnection status.
 */
export const ServerStatus = () => {
  const isConnected = useWebSocketStore((state) => state.isConnected)
  const isReconnecting = useWebSocketStore((state) => state.isReconnecting)
  const isScreensaverActive = useUIStore((state) => state.isScreensaverActive)

  if (isConnected || isScreensaverActive) return null

  return (
    <div className="fixed top-4 left-4 z-40 flex items-center rounded-lg bg-rose-950 px-4 py-2 text-sm text-white">
      {isReconnecting ? (
        <div className="flex items-center">
          <IconLoading iconSize={12} strokeWidth={5} className='animate-spin mr-2' />
          <p>Reconnecting</p>
        </div>
      ) : (
        <div className="flex items-center">
          <div className="h-4 w-4 mr-2 rounded-full bg-red-500" />
          <p>Disconnected from server</p>
        </div>
      )}
    </div>
  )
}
