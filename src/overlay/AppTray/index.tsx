import { IconArrowDown, IconEllipsis, IconGear, IconHome } from '@src/assets/Icons'
import Button from '@src/components/ui/Button'
import { useSettingsStore } from '@src/stores'
import { ViewMode } from '@deskthing/types'
import React, { useEffect, useState } from 'react'
import TrayContent from './TrayContent'

/**
 * The `AppTray` component is a React functional component that renders the application tray UI. It manages the state of the tray, including its visibility and height, and provides functionality for interacting with the tray, such as toggling its state and navigating to different views.
 *
 * The component uses the `useSettingsStore` hook to access and update the application's settings, including the current view and the state of the app tray. It also uses various React hooks, such as `useState` and `useEffect`, to manage the component's state and lifecycle.
 *
 * The `AppTray` component renders the tray content, which is provided by the `TrayContent` component, as well as a set of buttons and controls for interacting with the tray. The tray can be in one of three states: hidden, peeked, or full. The component adjusts the height and appearance of the tray based on the current state.
 *
 * The component also includes functionality for automatically hiding the tray after a certain amount of time when it is in the peeked state, and for showing and hiding a pull tab that allows the user to interact with the tray.
 */
const AppTray: React.FC = () => {
  const appTrayState = useSettingsStore((store) => store.preferences.appTrayState)
  const currentView = useSettingsStore((store) => store.preferences.currentView)
  const usePullTabs = useSettingsStore((store) => store.preferences.showPullTabs)
  const setPreferences = useSettingsStore((store) => store.updatePreferences)
  const [tabVisible, setTabVisible] = useState(true)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (appTrayState === ViewMode.PEEK) {
      timer = setTimeout(() => {
        setPreferences({ appTrayState: ViewMode.HIDDEN })
      }, 3000)
    }
    return () => clearTimeout(timer)
  }, [appTrayState, setPreferences])

  useEffect(() => {
    console.log('Changing the state')
    setTabVisible(true)
    const timer = setTimeout(() => {
      setTabVisible(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [appTrayState])

  const onClick = () => {
    setTabVisible(true)
    if (appTrayState === ViewMode.HIDDEN) {
      setPreferences({ appTrayState: ViewMode.PEEK })
    } else if (appTrayState === ViewMode.PEEK) {
      setPreferences({ appTrayState: ViewMode.FULL })
    } else {
      setPreferences({ appTrayState: ViewMode.HIDDEN })
    }
  }

  const gotoSettings = () => {
    setPreferences({
      currentView: {
        name: 'settings',
        enabled: true,
        running: true,
        timeStarted: 0,
        prefIndex: 0
      }
    })
    setPreferences({ appTrayState: ViewMode.PEEK })
  }

  const gotoDashboard = () => {
    setPreferences({
      currentView: {
        name: 'dashboard',
        enabled: true,
        running: true,
        timeStarted: 0,
        prefIndex: 0
      }
    })
    setPreferences({ appTrayState: ViewMode.PEEK })
  }

  useEffect(() => {
    setTimeout(() => {
      setPreferences({ appTrayState: ViewMode.PEEK })
    }, 200)
  }, [currentView])

  return (
    <div
      className={`${
        appTrayState === ViewMode.PEEK
          ? 'h-36'
          : appTrayState === ViewMode.HIDDEN
            ? 'h-0'
            : 'h-full'
      } w-screen flex flex-col absolute top-0 ${appTrayState == ViewMode.FULL ? 'bg-zinc-950' : 'bg-zinc-950'} transition-[colors,height] z-10`}
    >
      {usePullTabs && (
        <div
          className={`absolute rounded-b-lg flex justify-center top-0 items-center h-12 w-24 bg-zinc-900/90 backdrop-blur-md shadow-lg transition-all duration-300 ${tabVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'}`}
          onMouseEnter={() => setTabVisible(true)}
          onTouchStart={() => setTabVisible(true)}
        >
          <Button
            className="hover:bg-zinc-800 rounded-full p-2 transition-colors duration-200"
            onClick={onClick}
          >
            <IconArrowDown
              className={`w-6 h-6 ${appTrayState == ViewMode.FULL ? 'rotate-180' : ''} transition-transform duration-200 ease-in-out`}
            />
          </Button>
        </div>
      )}{' '}
      <TrayContent />
      <div
        className={`${appTrayState == ViewMode.FULL ? 'h-14' : 'h-0'} transition-[height] mb-5 flex justify-between overflow-hidden w-screen bg-black absolute bottom-0`}
      >
        <div className="flex items-center px-2 ">
          <p className="text-zinc-500">Active App:</p>
          <p className="ml-2">{currentView?.manifest?.label || currentView?.name}</p>
        </div>
        <div className="flex items-center px-2">
          <Button className="items-center" onClick={gotoSettings}>
            <p className="font-semibold mr-2">Global Settings</p>
            <IconGear strokeWidth={0} />
          </Button>
          <Button className="items-center" onClick={gotoDashboard}>
            <IconHome strokeWidth={2} fill={'none'} />
          </Button>
        </div>
      </div>
        <button
        className={`${appTrayState === ViewMode.HIDDEN ? 'opacity-0' : ' bottom-0 '} w-screen absolute bg-zinc-900 h-5 flex items-center justify-center`}
        onClick={onClick}
      >
        <IconEllipsis />
      </button>
    </div>
  )
}

export default AppTray
