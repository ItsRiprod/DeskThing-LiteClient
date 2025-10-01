import { EventMode } from '@deskthing/types'
import { IconLogoGear, IconLogoGearX } from '@src/assets/Icons'
import { Hint } from '@src/components/Hint'
import { useUIStore } from '@src/stores/uiStore'
import { useVoiceAgentStore } from '@src/stores/voiceAgentStore'
import { useEffect, useState } from 'react'
import { VoiceControlsPanel } from './VoiceControlsPanel'

export const VoiceControls = () => {
  const captureInput = useUIStore((s) => s.registerKeyHandler)
  const toggleListenState = useVoiceAgentStore((s) => s.toggleVoiceAgent)

  const voiceAgentVisible = useUIStore((s) => s.agentVisible)

  // state
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const clickHandler = captureInput('voiceScrollHandler', (code, eventMode) => {
      if (eventMode !== EventMode.PressShort || code !== 'Enter') return false
      toggleListenState()
      return true
    })
    const escapeHandler = captureInput('escapeHandler', (code, eventMode) => {
      if (eventMode !== EventMode.PressShort || code !== 'Escape') return false
      toggleExpand()
      return true
    })

    return () => {
      clickHandler()
      escapeHandler()
    }
  }, [expanded])

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  return (
    <div
      className={`fixed right-0 flex space-x-4 pointer-events-auto ${voiceAgentVisible ? 'opacity-100 bottom-5' : 'opacity-0 -bottom-5'} transition-[opacity, bottom] duration-500`}
    >
      <Hint
        title="Voice Agent Settings"
        flag="agentControls"
        message="You can hit the circle button or ESCAPE to expand/hide controls"
        position="bottom-right"
      />

      <VoiceControlsPanel visible={expanded} />
      <button
        className={`${expanded ? '-rotate-90' : 'text-zinc-400'} transition-transform duration-300`}
        onClick={toggleExpand}
        title="Expand/Collapse Voice Controls"
      >
        <IconLogoGearX close={expanded} iconSize={48} />
      </button>
    </div>
  )
}
