import { IconRefresh } from '@src/assets/Icons'
import { useState } from 'react'
import Button from './Button'
import { useSettingsStore, useWebSocketStore } from '@src/stores'
import { DEVICE_DESKTHING } from '@deskthing/types'

interface SyncProps {
  expanded?: boolean
  className?: string
}

/**
 * A button component that triggers a sync operation with a server.
 *
 * The `SyncButton` component displays a button with an icon and an optional label. When clicked, it initiates a sync operation with a server, which involves updating some user preferences. The sync operation is asynchronous and takes 1 second to complete, during which the icon is animated to indicate the ongoing sync process.
 *
 * @param {SyncProps} props - The props for the `SyncButton` component.
 * @param {boolean} [props.expanded] - Whether the button should display the "Sync With Server" label.
 * @returns {React.ReactElement} - The `SyncButton` component.
 */
const SyncButton: React.FC<SyncProps> = ({ expanded, className }) => {
  const [syncing, setIsSyncing] = useState(false)
  const setPreferences = useSettingsStore((state) => state.updatePreferences)
  const send = useWebSocketStore((state) => state.send)

  const handleSync = async (): Promise<void> => {
    setIsSyncing(true)
    await send({
      type: DEVICE_DESKTHING.CONFIG,
      request: 'get',
      app: 'server'
    })

    setPreferences({
      onboarding: false
    })

    setTimeout(() => {
      setPreferences({
        onboarding: true,
        currentView: {
          name: 'dashboard',
          enabled: true,
          running: true,
          timeStarted: 0,
          prefIndex: 0
        }
      })
      setIsSyncing(false)
    }, 1000)
  }

  return (
    <Button
      className={`${className} w-fit border-2 mt-5 md:mt-0 border-cyan-500 items-center`}
      onClick={handleSync}
    >
      <IconRefresh className={`${syncing && 'animate-spin'}`} />
      <p
        className={`${expanded ? 'w-fit' : 'w-0'} text-nowrap text-2xl font-semibold mx-2 overflow-hidden transition-[width]`}
      >
        Sync With Server
      </p>
    </Button>
  )
}

export default SyncButton
