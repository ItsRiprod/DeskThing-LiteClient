import { IconReload } from '@src/assets/Icons'
import { useVoiceAgentStore } from '@src/stores/voiceAgentStore'
import { useEffect, useState } from 'react'

type VoiceControlsPanelProps = {
  visible: boolean
}

export const VoiceControlsPanel = ({ visible }: VoiceControlsPanelProps) => {
  const [isVisible, setIsVisible] = useState(visible)
  const closeVoiceAgent = useVoiceAgentStore((s) => s.closeVoiceAgent)
  const fetchConversation = useVoiceAgentStore((s) => s.fetchConversation)
  const reconnect = useVoiceAgentStore((s) => s.retryBackend)
  const toggleListenState = useVoiceAgentStore((s) => s.toggleVoiceAgent)

  const voiceStatus = useVoiceAgentStore((s) => s.status)
  useEffect(() => {
    if (visible) {
      setIsVisible(true)
    } else {
      const timeoutId = setTimeout(() => setIsVisible(false), 300) // Match the CSS transition duration
      return () => clearTimeout(timeoutId)
    }
  }, [visible])

  return (
    <div
      className={`space-x-2 transition-[transform, width] flex-nowrap flex justify-end duration-300 overflow-hidden  ${visible ? 'translate-x-0 w-[50vw]' : 'translate-x-full w-0'}`}
    >
      {(isVisible || visible) && (
        <div className="bg-black flex space-x-2">
          <button
            className="px-4 py-2 text-base rounded border border-gray-400 bg-black/40 border-solid cursor-pointer"
            title="Close"
            onClick={closeVoiceAgent}
          >
            ✕
          </button>
          <button
            className="px-4 py-2 text-nowrap text-base rounded border border-gray-400 bg-black/40 border-solid cursor-pointer"
            title={voiceStatus === 'listening' ? 'Stop Listening' : 'Start Listening'}
            onClick={toggleListenState}
          >
            {voiceStatus === 'listening' ? '⏹ Stop' : '🎤 Start'}
          </button>
          <button
            className="px-4 py-2 text-nowrap text-2xl rounded border border-gray-400 bg-black/40 border-solid cursor-pointer"
            title="Fetch Conversation"
            onClick={fetchConversation}
          >
            ⟳
          </button>
          <button
            className="px-4 py-2 text-nowrap text-base rounded border border-blue-400 bg-blue-900/40 border-solid cursor-pointer"
            title="Re-configure Audio"
            onClick={reconnect}
          >
            <IconReload /> 
          </button>
        </div>
      )}
    </div>
  )
}
