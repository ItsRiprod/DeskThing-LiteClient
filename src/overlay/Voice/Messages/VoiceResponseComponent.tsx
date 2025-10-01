import { FC, useEffect, useRef } from 'react'
import { useVoiceAgentStore } from '@src/stores/voiceAgentStore'
import {
  AgentErrorMessageComponent,
  AgentMessageComponent,
  AgentStatusMessageComponent
} from './VoiceResponseMessage'
// import {
//   voiceResponseSample1,
//   voiceResponseSample2,
//   voiceResponseSample3,
//   voiceResponseSample4
// } from './VoiceResponseSamples'

// AgentMessage animates in when first rendered

export const VoiceResponseComponent: FC = () => {
  const voiceAgentMessages = useVoiceAgentStore((s) => s.responseMessages)
  const voiceSelectedMessageId = useVoiceAgentStore((s) => s.selectedMessageId)
  const voiceAgentStatusMessage = useVoiceAgentStore((s) => s.statusMessages)
  const voiceAgentErrorMessage = useVoiceAgentStore((s) => s.errorMessages)

  // Only show last 10 messages
  const messages = voiceAgentMessages.slice(-5)

  const containerRef = useRef<HTMLDivElement>(null)

  const recentMessageLength = voiceAgentMessages[voiceAgentMessages.length - 1]?.message.length || 0

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [messages.length, recentMessageLength])

  return (
    <div className="absolute h-screen w-full max-h-full top-0 left-0 flex flex-col justify-end bg-black/95 transition-opacity">
      <div ref={containerRef} className="w-3/4 px-5 mb-2 overflow-y-auto">
        {messages.map((msg, index, arr) => {
          const prevMsg = arr[index - 1]
          const continuous = prevMsg && prevMsg.role === msg.role && !msg.break_before
          return (
            <div key={`message-${msg.messageId}`}>
              <AgentMessageComponent
                message={msg}
                continuous={continuous}
                highlighted={msg.messageId == voiceSelectedMessageId}
              />
            </div>
          )
        })}
      </div>
      {(voiceAgentErrorMessage || voiceAgentStatusMessage) && (
        <div className="mt-2">
          {voiceAgentStatusMessage && (
            <AgentStatusMessageComponent
              key={`status-${voiceAgentStatusMessage.messageId}`}
              message={voiceAgentStatusMessage}
            />
          )}
          {voiceAgentErrorMessage && (
            <AgentErrorMessageComponent
              key={`error-${voiceAgentErrorMessage.messageId}`}
              message={voiceAgentErrorMessage}
            />
          )}
        </div>
      )}
    </div>
  )
}
