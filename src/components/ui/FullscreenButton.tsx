import Button from './Button'
import { ActionReference } from '@deskthing/types'
import { useMappingStore } from '@src/stores'
import ActionIcon from './ActionIcon'
import { useEffect, useState } from 'react'

const FullscreenAction: ActionReference = {
  id: 'fullscreen',
  source: 'server',
  enabled: true
}

interface FullscreenButtonProps {
  expanded?: boolean
}

declare global {
  interface Document {
    webkitFullscreenEnabled?: boolean
    mozFullScreenEnabled?: boolean
    msFullscreenEnabled?: boolean
  }
}

/**
 * A button component that toggles the fullscreen mode of the application.
 *
 * @param {FullscreenButtonProps} props - The props for the FullscreenButton component.
 * @param {boolean} [props.expanded] - Whether the button should be in an expanded state.
 * @returns {JSX.Element} - The FullscreenButton component.
 */

const FullscreenButton: React.FC<FullscreenButtonProps> = ({ expanded }) => {
  const getActionUrl = useMappingStore((state) => state.getActionUrl)
  const [isFullscreenSupported, setIsFullscreenSupported] = useState(true)

  useEffect(() => {
    // Check if fullscreen is supported
    const supported = !!(
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled
    )
    setIsFullscreenSupported(supported)
  }, [])
  const onClick = async () => {
    if (!isFullscreenSupported) {
      // Show iOS-specific instructions
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      if (!isStandalone) {
        alert('For fullscreen on iOS: Tap the Share button and select "Add to Home Screen"')
      }
      return
    }

    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err)
    }
  }

  return (
    <Button 
      className="px-4 group items-center flex justify-center py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors duration-200" 
      onClick={onClick}
    >
      <p
        className={`${expanded ? 'w-fit' : 'w-0'} hidden xs:block text-sm text-white/80 text-nowrap overflow-hidden transition-[width]`}
      >
        {isFullscreenSupported ? 'Toggle Fullscreen' : 'Add to Home Screen'}
      </p>
      <div className={`flex items-center justify-center cursor-pointer`}>
        <ActionIcon url={getActionUrl(FullscreenAction)} />
      </div>
    </Button>
  )
}

export default FullscreenButton
