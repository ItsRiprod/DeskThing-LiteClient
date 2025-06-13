import { useSettingsStore, useAppStore } from '@src/stores'
import { ViewMode } from '@deskthing/types'
import AppTrayButton from './AppButton'
import Key from '@src/components/ui/Key'

const actionKeys = ['Tray1', 'Tray2', 'Tray3', 'Tray4', 'Tray5', 'Tray6']

/**
 * Renders the content of the application tray, which can display either a grid of action keys or a grid of installed applications.
 * The display mode is determined by the `appTrayState` setting in the settings store.
 * When in "Peek" mode, the tray displays a grid of action keys.
 * When in "Full" mode, the tray displays a grid of installed applications, with the currently selected application highlighted.
 */
const TrayContent = () => {
  const appTrayState = useSettingsStore((store) => store.preferences.appTrayState)
  const currentView = useSettingsStore((store) => store.preferences.currentView)
  const primary = useSettingsStore((store) => store.preferences.theme.primary)
  const apps = useAppStore((store) => store.apps)

  return (
    <div
      className={`${appTrayState != ViewMode.FULL ? 'overflow-hidden' : 'pb-28 overflow-y-auto'} space-y-2 grid justify-items-center grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 p-2 w-full overflow-hidden max-h-full h-fit`}
    >
      {appTrayState == ViewMode.PEEK
        ? actionKeys.map((aKey) => (
            <div key={aKey} className="mb-12 h-24 w-24">
              <Key keyId={aKey} />
            </div>
          ))
        : appTrayState == ViewMode.FULL &&
          apps &&
          apps.map((app) => (
            <div
              style={{ borderColor: `${primary || '#22c55e'}` }}
              className={`w-36 h-36 flex items-center flex-col justify-center bg-neutral-800 p-4 rounded-3xl ${app.name == currentView.name && 'border-green-500 border-2'}`}
              key={app.name}
            >
              <AppTrayButton app={app} key={app.name} />
              <p className="text-ellipsis whitespace-nowrap w-full text-center text-sm">
                {app.manifest?.label}
              </p>
            </div>
          ))}
    </div>
  )
}

export default TrayContent
