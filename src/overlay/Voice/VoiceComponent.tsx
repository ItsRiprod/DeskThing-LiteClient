import { useVoiceAgentStore } from '@src/stores/voiceAgentStore'
import { FC, useEffect, useState } from 'react'
import IconLogoGearLoading from '@src/assets/Icons/Icons/IconLogoGearLoading'
import { useUIStore } from '@src/stores/uiStore'
import { IconLogoGearAgent } from '@src/assets/Icons'
import { VoiceSpinner } from './VoiceSpinner'
import { VoiceCloseButton } from './VoiceCloseButton'
import { VoiceDebugComponent } from './VoiceDebugComponent'
import { VoiceResponseComponent } from './Messages/VoiceResponseComponent'
import { VoiceControls } from './controls/VoiceControls'
import { Hint } from '@src/components/Hint'

export const VoiceComponent: FC = () => {
  const status = useVoiceAgentStore((s) => s.status)
  const initialized = useVoiceAgentStore((s) => s.initialized)
  const voiceVisible = useUIStore((s) => s.agentVisible)

  const [render, setRender] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    if (voiceVisible) {
      setRender(true)
    } else {
      timeoutId = setTimeout(() => setRender(false), 500) // Match the CSS transition duration
    }

    return () => clearTimeout(timeoutId)
  }, [voiceVisible])

  // Choose gear icon based on status
  let GearIcon
  if (!initialized || status === 'connecting') {
    GearIcon = IconLogoGearLoading
  } else {
    GearIcon = IconLogoGearAgent
  }

  return (
    <div
      className={`absolute top-0 ${voiceVisible ? 'right-0' : '-right-full'} transition-all duration-500 w-screen h-screen z-20 gap-3`}
    >
      {render && (
        <div className="flex hover:bg-blue-500 items-center">
          <VoiceResponseComponent />
          <VoiceDebugComponent />
          <VoiceSpinner />
          <Hint title="Start/Stop Talking" flag="voiceSpinner" message="Click the gear or wheel to start/stop talking" position="top-right" />
          <VoiceCloseButton />
          <VoiceControls />
        </div>
      )}
    </div>
  )
}
