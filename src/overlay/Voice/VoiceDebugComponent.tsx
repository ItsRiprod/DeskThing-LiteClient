import { useVoiceAgentStore } from '@src/stores/voiceAgentStore'
import { FC } from 'react'

const modeLabels: Record<string, string> = {
  websocket: 'Car Thing Mic',
  'mic': 'Local Mic',
  unset: 'Unavailable'
}

export const VoiceDebugComponent: FC = () => {
  const status = useVoiceAgentStore((s) => s.status)
  const mode = useVoiceAgentStore((s) => s.provider)
  const errorMsg = useVoiceAgentStore((s) => s.errorMsg)
  const initialized = useVoiceAgentStore((s) => s.initialized)

  return (
    <div className="absolute bottom-0 right-0 flex flex-col items-center justify-end">
      <span className="text-sm font-medium text-zinc-200">
        {!initialized ? (
          'Setting up voice assistant...'
        ) : mode === 'unset' ? (
          'Voice unavailable'
        ) : (
          <div className="flex flex-col justify-end items-end">
            <span>
              <span className="text-emerald-400">{modeLabels[mode]}</span>
              <span className="mx-1 text-zinc-400">•</span>
              <span className="capitalize">{status}</span>
            </span>
          </div>
        )}
      </span>
      {status === 'error' && errorMsg && (
        <span className="mt-1 text-xs text-red-400">{errorMsg}</span>
      )}
    </div>
  )
}
