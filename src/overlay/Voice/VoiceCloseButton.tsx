import { FC, useEffect, useState, } from 'react'
import { useVoiceAgentStore } from '@src/stores/voiceAgentStore'
import { useUIStore } from '@src/stores/uiStore'

// Simple close "X" icon
const CloseIcon: FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="15" fill="rgba(24,24,27,0.85)" stroke="#444" />
    <path d="M10 10L22 22M22 10L10 22" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const VoiceCloseButton: FC = () => {
  const voiceAgentVisible = useUIStore((s) => s.agentVisible)
  const closeVoiceAgent = useVoiceAgentStore((s) => s.closeVoiceAgent)
  const [visible, setIsVisible] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    if (voiceAgentVisible) {
      timeoutId = setTimeout(() => setIsVisible(true), 500) // Match the CSS transition duration
    } else {
      setIsVisible(false)
    }
    return () => clearTimeout(timeoutId)
  }, [voiceAgentVisible])

  // Button animates in/out with opacity and translate
  return (
    <button
      aria-label="Close voice assistant"
      onClick={closeVoiceAgent}
      className={`
        fixed top-6 left-8
        transition-all duration-400
        ${visible ? 'opacity-80 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}
        active:scale-95
      `}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      <CloseIcon size={32} />
    </button>
  )
}