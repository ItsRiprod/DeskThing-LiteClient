import { useParams } from 'react-router-dom'
import WebPage from './Web'
import { useWebSocketStore } from '@src/stores'
import { IconLogoGearLoading } from '@src/assets/Icons'

/**
 * Renders the main application page, which displays either a WebPage component or a loading indicator based on the WebSocket connection status.
 *
 * @returns {JSX.Element} The rendered application page.
 */
export default function AppPage() {
  const { app } = useParams()
  const isConnected = useWebSocketStore((state) => state.isConnected)

  if (isConnected) {
    return (
      <div className="w-screen h-full bg-black">
        <WebPage key={app} currentView={app || ''} />
      </div>
    )
  } else {
    return (
      <div className="w-screen h-full justify-center items-center flex bg-zinc-500">
        <IconLogoGearLoading iconSize={48} />
        <p className="text-4xl ml-2">Waiting for connection...</p>
      </div>
    )
  }
}
