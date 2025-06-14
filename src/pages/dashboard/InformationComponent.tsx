  import { FC } from 'react'
  import { useSettingsStore, useTimeStore } from '@src/stores'

  export const InformationComponent: FC = () => {
    const time = useTimeStore((state) => state.currentTimeFormatted)
    const deviceVersion = useSettingsStore((state) => state?.manifest?.version || '0.0.0')
    const deviceId = useSettingsStore((state) => state?.manifest?.name || 'Thin Client')

    return (
      <div className="w-full flex items-center justify-center">
        <div>
          <p className="font-light text-8xl">{time}</p>
          <div className="mt-4 text-center">
            <p className="text-xl font-semibold text-gray-300">{deviceId}</p>
            <p className="text-sm text-gray-400">Version {deviceVersion}</p>
          </div>
        </div>
      </div>
    )
  }
