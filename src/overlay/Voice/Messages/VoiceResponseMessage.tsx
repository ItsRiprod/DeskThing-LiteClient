import { AgentMessage } from '@deskthing/types'
import { useVoiceAgentStore } from '@src/stores/voiceAgentStore'
import { FC, useState, useEffect, useRef } from 'react'

export const AgentMessageComponent: FC<{
  message: AgentMessage
  continuous?: boolean
  highlighted: boolean
}> = ({ message, continuous, highlighted }) => {
  const setSelectedMessageId = useVoiceAgentStore((s) => s.setSelectedMessageId)

  const handleClick = () => {
    setSelectedMessageId(message.messageId)
  }

  const [drawIn, setDrawIn] = useState(false)
  useEffect(() => {
    let timeoutId = setTimeout(() => setDrawIn(true), 50)
    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <div
      className={`relative px-6 rounded-lg text-white overflow-hidden shadow-lg transition-all duration-700
        ${drawIn ? 'opacity-100 translate-y-0' : 'translate-y-0 opacity-0'}
        ${continuous ? 'mt-0' : 'mt-4'}
        `}
      onClick={handleClick}
    >
      <div className="flex flex-col">
        {message.role && !continuous && (
          <div>
            <div className="text-xs text-gray-400 mb-1">{message.role}</div>
            <div className="text-xs text-gray-500 italic mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}
        <span className="whitespace-pre-line">{message.message}</span>
      </div>
    </div>
  )
}

export const AgentStatusMessageComponent: FC<{ message: AgentMessage }> = ({ message }) => {
  if (message.type !== 'status') return null
  return (
    <li className="px-6 italic rounded-lg bg-black/70 text-emerald-500 text-xs">
      <div className="flex flex-col">
        <span>
          {message.message}
          {message.progress ? ` (${message.progress})` : ''}
        </span>
      </div>
    </li>
  )
}

export const AgentErrorMessageComponent: FC<{ message: AgentMessage }> = ({ message }) => {
  if (message.type !== 'error') return null
  return (
    <li className="px-6 italic rounded-lg bg-black/70 text-red-500 opacity-80 text-xs">
      <div className="flex flex-col">
        <span>
          {message.message}
          {message.code ? ` (${message.code})` : ''}
          {message.error ? ` (${message.error})` : ''}
        </span>
      </div>
    </li>
  )
}
