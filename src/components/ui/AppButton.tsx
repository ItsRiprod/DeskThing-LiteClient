import ActionIcon from '@src/components/ui/ActionIcon'
import { useAppStore } from '@src/stores'
import { App } from '@deskthing/types'
import { useMemo } from 'react'

interface AppIconProps {
  app: App
}

/**
 * Renders an app icon in the app tray.
 *
 * @param app - The app object to display in the icon.
 * @returns A React component that renders an app button in the app tray.
 */
const AppIcon: React.FC<AppIconProps> = ({ app }) => {
  const getAppIcon = useAppStore((store) => store.getAppIcon)
  const appIcon = useMemo(() => getAppIcon(app), [app, getAppIcon])

  return <ActionIcon url={appIcon} />
}

export default AppIcon
