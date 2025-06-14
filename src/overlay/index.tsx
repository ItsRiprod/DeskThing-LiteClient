import { useWebSocketStore } from '@src/stores'
import { useMemo } from 'react'
import ScreenSaverWrapper from './ScreenSaver/ScreenSaverWrapper'

interface OverlayProps {
  children: React.ReactNode
}

/**
 * The `Overlays` component is a React functional component that renders various overlays and UI elements on top of the main application content.
 *
 * It manages the state and visibility of the following overlays:
 * - AppTray
 * - Miniplayer
 * - NotificationOverlay
 * - VolumeOverlay
 * - SelectionWheel
 * - YouAreHere
 *
 * The component also adjusts the height and margin of the main content based on the user's preferences, such as the theme scale and miniplayer visibility.
 */
const Overlays: React.FC<OverlayProps> = ({ children }) => {
  const isConnected = useWebSocketStore((state) => state.isConnected)
  const memoChildren = useMemo(() => children, [children])

  return (
    <div className="flex bg-black flex-col w-screen max-h-screen h-screen items-center justify-end">
      {!isConnected && <ScreenSaverWrapper />}
      <div className={`h-full w-full transition-[padding]`}>{memoChildren}</div>
    </div>
  )
}

export default Overlays
