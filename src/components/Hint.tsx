import { useSettingsStore } from '@src/stores'
import { FC } from 'react'

type HintPropt = {
  flag: string
  message: string
  title?: string
  position?: 'top-left' | 'bottom-right' | 'top-right' | 'bottom-left' | 'center'
  onResolve?: () => void
}

export const Hint: FC<HintPropt> = ({ flag, message, position = 'top-right', title, onResolve }) => {
  const flags = useSettingsStore((state) => state.flags)
  const setFlag = useSettingsStore((state) => state.setFlag)

  const handleAcknowledgeNotice = () => {
    setFlag(flag, true)
    onResolve?.()
  }

  if (flags[flag]) return null

  const positionStyles = {
    'top-left': { top: '1.25rem', left: '1.25rem' },
    'bottom-right': { bottom: '1.25rem', right: '1.25rem' },
    'top-right': { top: '1.25rem', right: '1.25rem' },
    'bottom-left': { bottom: '1.25rem', left: '1.25rem' },
    center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  }

  const arrowPositionStyles = {
    'top-left': { top: '-0.5rem', left: '-0.5rem' },
    'bottom-right': { bottom: '-0.5rem', right: '-0.5rem' },
    'top-right': { top: '-0.5rem', right: '-0.5rem' },
    'bottom-left': { bottom: '-0.5rem', left: '-0.5rem' },
    center: { top: '-0.5rem', left: '-0.5rem' }
  }

  return (
    <div
      style={{ ...positionStyles[position] }}
      className={`bg-gray-800 absolute p-5 ${position === 'center' ? 'items-center' : ''} rounded-xl flex flex-col shadow-2xl border border-gray-700 max-w-xs bg-opacity-100`}
    >
      <div
        style={{ ...arrowPositionStyles[position] }}
        className="w-4 h-4 absolute transform rotate-45 bg-gray-800 border-t border-r border-gray-700"
      />
      {title && <h1 className="text-xl font-semibold">{title}</h1>}
      <p className={`text-gray-200 mb-4 font-medium ${position === 'center' ? 'text-center' : ''}`}>{message}</p>
      <button
        onClick={handleAcknowledgeNotice}
        className="bg-emerald-600 text-white px-6 w-fit py-2 rounded-lg hover:bg-emerald-400 text-sm transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
      >
        Got it
      </button>
    </div>
  )
}
