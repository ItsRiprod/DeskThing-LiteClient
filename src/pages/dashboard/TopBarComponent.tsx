import { IconLogoGear } from '@src/assets/Icons'
import Button from '@src/components/ui/Button'
import { useTimeStore, useWebSocketStore } from '@src/stores'
import { useUIStore } from '@src/stores/uiStore'

export const TopBarComponent = () => {
  const time = useTimeStore((state) => state.currentTimeFormatted)
  const isConnected = useWebSocketStore((state) => state.isConnected)
  const isReconnecting = useWebSocketStore((state) => state.isReconnecting)
  const connectionAddress = useWebSocketStore((state) => state.socketManager?.url || 'Unknown')
  const setView = useUIStore((state) => state.setPage)

  const navigateSettings = () => {
      setView('settings')
  }

  return (
    <div
      className="z-40 flex fixed w-full top-0 items-center justify-between px-4 py-2"
      style={{
        backgroundColor: 'rgba(10, 10, 10, 0.5)'
      }}
    >
      <div className="flex items-center">
        <p className="font-light">{time}</p>
      </div>
      <div className="flex items-center">
        {isConnected && (
          <div className="flex items-center">
            <div className="h-4 w-4 mr-2 rounded-full bg-green-500" />
            <p className="text-sm">Connected to {connectionAddress}</p>
          </div>
        )}
        {isReconnecting && (
          <div className="flex items-center">
            <div className="h-4 w-4 mr-2 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Connecting to {connectionAddress}</p>
          </div>
        )}
        {!isConnected && !isReconnecting && (
          <div className="flex items-center">
            <div className="h-4 w-4 mr-2 rounded-full bg-red-500" />
            <p className="text-sm">Disconnected from server</p>
          </div>
        )}
        <Button onClick={navigateSettings}>
          <IconLogoGear />
        </Button>
      </div>
    </div>
  )
}
