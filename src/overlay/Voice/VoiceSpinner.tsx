import { useVoiceAgentStore } from '@src/stores/voiceAgentStore'
import { FC } from 'react'
import IconLogoGearLoading from '@src/assets/Icons/Icons/IconLogoGearLoading'
import { IconLogoGearAgent } from '@src/assets/Icons'
import { useUIStore } from '@src/stores/uiStore'
import { Hint } from '@src/components/Hint'

const statusColors: Record<string, string> = {
  idle: 'border-zinc-700',
  connecting: 'border-yellow-500',
  connected: 'border-emerald-400',
  listening: 'border-emerald-500',
  error: 'border-red-500'
}

const modeLabels: Record<string, string> = {
  websocket: 'Car Thing Mic',
  'mic-local': 'Local Mic',
  unset: 'Unavailable'
}

export const VoiceSpinner: FC = () => {
  const status = useVoiceAgentStore((s) => s.status)
  const voiceState = useVoiceAgentStore((s) => s.status)
  const mode = useVoiceAgentStore((s) => s.provider)
  const currentAudioLevel = useVoiceAgentStore((s) => s.currentAudioLevel)
  const initialized = useVoiceAgentStore((s) => s.initialized)
  const toggleVoiceAgent = useVoiceAgentStore((s) => s.toggleVoiceAgent)
  const voiceAgentVisible = useUIStore((s) => s.agentVisible)

  const active = voiceState === 'listening'

  const normalizedAudioLevel = Math.max(0, Math.min(1, currentAudioLevel))
  const pulse = status === 'listening' ? normalizedAudioLevel : 0

  const handleClick = async () => {
    toggleVoiceAgent()
  }

  // Choose gear icon based on status
  let GearIcon
  if (!initialized || status === 'connecting') {
    GearIcon = IconLogoGearLoading
  } else {
    GearIcon = IconLogoGearAgent
  }

  return (
      <div
        className={`absolute right-0 top-1/3  flex translate-x-24 items-center justify-center ${
          !initialized ? 'opacity-60 pointer-events-none' : 'cursor-pointer'
        }`}
        onClick={!initialized || mode === 'unset' ? undefined : handleClick}
        title={!initialized ? 'Initializing...' : modeLabels[mode]}
      >
        <div
          className={`absolute flex items-center justify-center rounded-full border-4 shadow-2xl transition-all duration-300 bg-zinc-900/15 ${statusColors[status]} ${
            !initialized ? 'opacity-60 pointer-events-none' : 'cursor-pointer'
          }`}
          style={{
            width: 256,
            height: 256,
            scale: active ? 5 : 1,
            transform: 'scale(' + (active ? 1 + pulse * 0.5 : 1) + ')',
            boxShadow: active
              ? '0 0 32px 8px rgba(16, 185, 129, 0.45)'
              : '0 2px 16px rgba(16, 185, 129, 0.15)'
          }}
        />
        <div
          style={{
            transform: voiceAgentVisible ? active ? 'scale(1)' : 'scale(0.9)' : 'scale(0)',
          }}
          className="absolute transition-transform duration-300"
        >
          <GearIcon
            style={{
              filter:
                active || status === 'listening' ? 'drop-shadow(0 0 12px #10b981)' : undefined,
              transition: 'filter 0.2s',
              width: '75vw',
              height: '75vw'
            }}
            className={`${active ? `animate-spin-slow` : ''} transition-all`}
          />
        </div>
      </div>
  )
}
