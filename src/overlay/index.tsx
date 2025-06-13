import { useSettingsStore, useWebSocketStore } from '@src/stores'
import AppTray from './AppTray'
import VolumeOverlay from './Volume'
import { useMemo } from 'react'
import { ServerStatus } from './ConnectionStatus'
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
  const preferences = useSettingsStore((store) => store.preferences)
  const isConnected = useWebSocketStore((state) => state.isConnected)
  const height = useMemo(() => {
    return preferences?.theme?.scale == 'small'
      ? 'pb-16'
      : preferences?.theme?.scale == 'medium'
        ? 'pb-32'
        : 'pb-48'
  }, [preferences?.theme?.scale])

  const margin = useMemo(() => {
    return preferences?.miniplayer.state !== 'hidden'
  }, [preferences?.miniplayer.state])
  const memoChildren = useMemo(() => children, [children])

  return (
    <div className="flex bg-black flex-col w-screen max-h-screen h-screen items-center justify-end">
      <AppTray />
      <ServerStatus />
      <VolumeOverlay />
      {!isConnected && <ScreenSaverWrapper />}
      <div
        className={`h-full w-full transition-[padding] ${margin && height}`}
      >
        {memoChildren}
      </div>
    </div>
  )
}

export default Overlays
