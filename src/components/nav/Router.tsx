import { useSettingsStore } from '@src/stores'
import AppPage from '../../pages/app'
import React, { useEffect } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import ClockPage from '@src/pages/clock'
import { DashboardPage } from '@src/pages/dashboard'
import SettingsPage from '@src/pages/settings'
import { useUIStore } from '@src/stores/uiStore'
import { DeveloperPage } from '@src/pages/dev'

/**
 * A list of system application names that are considered "core" or "system" apps in the application.
 * These apps are typically accessible from the main navigation or landing page, and may have special
 * handling or behavior compared to other "user" applications.
 */
export const SystemApps = [
  'dashboard',
  'settings',
  'landing',
  'developer'
]

/**
 * The main navigation router component for the application. This component sets up the routing
 * structure and maps routes to the appropriate page components.
 * 
 * The router handles the following functionality:
 * - Redirects the user to the appropriate page based on their preferences and onboarding status
 * - Defines the routes for the core system applications (e.g. "nowplaying", "dashboard", "settings")
 * - Handles routing to user-specific application pages (e.g. "/app/:app")
 * - Provides a fallback route to the landing page for any unmatched routes
 */
const NavRouter: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const preferences = useSettingsStore((store) => store.preferences)
  const setCurrentView = useUIStore((store) => store.setPage)

  // Update route when preferences change
  useEffect(() => {
    const currentView = preferences?.currentView?.name || 'dashboard'
    const path = SystemApps.includes(currentView)
      ? '/' + currentView
      : '/app/' + currentView

    if (location.pathname !== path) {
      navigate(path, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences])

  // Update preferences when user changes URL manually
  useEffect(() => {
    const path = location.pathname
    let viewName = 'dashboard'
    
    if (path.startsWith('/app/')) {
    
      viewName = path.split('/')[2] || 'dashboard'
    
    } else if (SystemApps.some(app => path === '/' + app)) {
    
      viewName = path.replace('/', '')
    
    }
    
    if (preferences?.currentView?.name !== viewName) {
      setCurrentView(viewName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <Routes>
      <Route path={'/clock'} element={<ClockPage />} />
      <Route path={'/app/:app'} element={<AppPage />} />
      <Route path={'/app'} element={<AppPage />} />
      <Route path={'/dashboard'} element={<DashboardPage />} />
      <Route path={'/settings'} element={<SettingsPage />} />
      <Route path={'/landing'} element={<DashboardPage />} />
      <Route path={'/developer'} element={<DeveloperPage />} />
    </Routes>
  )
}

export default NavRouter
