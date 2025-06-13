import ActionIcon from '@src/components/ui/ActionIcon'
import Button from '@src/components/ui/Button'
import { useAppStore, useSettingsStore } from '@src/stores'
import { App } from '@deskthing/types'
import { useMemo } from 'react'

interface AppTrayButtonProps {
  app: App
}

/**
 * Renders an app button in the app tray.
 *
 * @param app - The app object to display in the button.
 * @returns A React component that renders an app button in the app tray.
 */
const AppTrayButton: React.FC<AppTrayButtonProps> = ({ app }) => {
  const getAppIcon = useAppStore((store) => store.getAppIcon)
  const setCurrentView = useSettingsStore((store) => store.updateCurrentView)
  const appIcon = useMemo(() => getAppIcon(app), [app, getAppIcon])

  const handleAppClick = () => {
    setCurrentView(app)
  }

  return (
    <Button onClick={handleAppClick} className="w-28 h-28 flex-shrink-0">
      <ActionIcon url={appIcon} />
    </Button>
  )
}

export default AppTrayButton
