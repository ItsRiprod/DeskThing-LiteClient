import { IconArrowRight, IconRefresh } from '@src/assets/Icons'
import Button from '@src/components/ui/Button'
import { useSettingsStore } from '@src/stores'
import { FC, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

interface YouAreHereProps {
  setShow: (show: boolean) => void
}

/**
 * The `YouAreHere` component is a React functional component that displays a welcome message and provides some user actions when the user first visits the application.
 *
 * The component is responsible for the following:
 * - Displaying a welcome message and the application logo
 * - Showing the current URL path
 * - Providing a button to navigate to the dashboard
 * - Providing a button to clear the application cache
 *
 * The component is designed to be displayed as a full-screen overlay and will automatically close after 5 seconds if the user has completed the onboarding process.
 *
 * @param setShow - A function to set the visibility of the component
 */
export const YouAreHere: FC<YouAreHereProps> = ({ setShow }) => {
  const [isOpen, setIsOpen] = useState(true)
  const location = useLocation()
  const hasDoneOnboarding = useSettingsStore((state) => state.preferences.onboarding)
  const setCurrentView = useSettingsStore((state) => state.updateCurrentView)

  useEffect(() => {
    if (hasDoneOnboarding) {
      setIsOpen(true)
      setTimeout(() => {
        handleClose()
      }, 2000)
    } else {
      setShow(false)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      setShow(false)
    }, 2000)
  }

  const clearCache = () => {
    localStorage.clear()
    window.location.reload()
  }

  const handleDashboard = () => {
    setCurrentView({
      name: 'dashboard',
      enabled: false,
      running: false,
      timeStarted: 0,
      prefIndex: 0
    })
    handleClose()
  }

  return (
    <div
      className={`fixed justify-between border-gray-500 bg-black z-10 w-full px-4 h-fit ${isOpen ? 'md:max-h-36 border-t-2' : 'max-h-0'} transition-[max-height] overflow-hidden bottom-0 flex items-center justify-center`}
    >
      <p>Page: {location.pathname}</p>
      <div className="flex">
        <Button
          onClick={handleDashboard}
          className="border-amber-500 animate-drop bg-amber-500/25 justify-between border text-3xl"
        >
          Go to dashboard
          <IconArrowRight />
        </Button>
        <Button
          onClick={clearCache}
          className="border-blue-500 animate-dropDelay bg-blue-500/25 justify-between border text-3xl"
        >
          <p>Clear Cache</p>
          <IconRefresh className="stroke-2" />
        </Button>
      </div>
    </div>
  )
}
export default YouAreHere
