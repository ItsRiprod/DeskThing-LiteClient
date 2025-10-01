import { useEffect, useState, useRef } from 'react'
import { ClientConfigurations, DEVICE_DESKTHING, ScreensaverSettings } from '@deskthing/types'
import FullscreenButton from '@src/components/ui/FullscreenButton'
import {
  useWebSocketStore,
  useSettingsStore,
  useClientStore,
  useAppStore,
  useMappingStore
} from '@src/stores'
import { useUIStore } from '@src/stores/uiStore'
import { IconLogoGear } from '@src/assets/Icons'

const SettingsPage = () => {
  const updatePreferences = useSettingsStore((state) => state.updatePreferences)
  const setPage = useUIStore((state) => state.setPage)
  const send = useWebSocketStore((state) => state.send)
  const preferences = useSettingsStore((state) => state.preferences)
  const manifest = useSettingsStore((state) => state.manifest)
  const client = useClientStore((state) => state.client)
  const isConnected = useWebSocketStore((state) => state.isConnected)
  const [localPreferences, setLocalPreferences] = useState<ClientConfigurations | undefined>(
    preferences
  )
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const apps = useAppStore((state) => state.apps)
  const profile = useMappingStore((state) => state.profile)

  useEffect(() => {
    setLocalPreferences(preferences)
  }, [preferences])

  const setScreensaverMode = (mode: ScreensaverSettings['type']) => {
    updatePreferences({
      ScreensaverType: {
        version: '0',
        type: mode
      }
    })
  }

  const setIconColor = (color: string) => {
    updatePreferences({
      theme: {
        ...preferences?.theme,
        icons: color
      }
    })
  }

  const resyncData = async () => {
    await send({
      type: DEVICE_DESKTHING.CONFIG,
      request: 'get',
      app: 'server'
    })
  }

  const saveConfigToServer = async () => {
    await send({
      type: DEVICE_DESKTHING.CONFIG,
      request: 'set',
      payload: preferences,
      app: 'server'
    })
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b overflow-y-auto from-zinc-900 to-zinc-950 overflow-hidden flex flex-col select-none">
      <div
        className="z-40 flex fixed w-full top-0 items-center justify-between px-4 py-2"
        style={{ backgroundColor: 'rgba(10, 10, 10, 0.5)' }}
      >
        <div className="flex items-center">
          <IconLogoGear className="w-6 h-6 mr-2" />
          <h1 className="text-xl font-light xs:block hidden">Settings</h1>
        </div>
        <div className="flex items-center" style={{ marginLeft: '8px' }}>
          <button
            onClick={() => setPage('dashboard')}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors duration-200"
            style={{ marginRight: '8px' }}
          >
            <span className="hidden xs:block">Back to Dashboard</span>{' '}
            <span className="xs:hidden">Back</span>
          </button>
          <FullscreenButton expanded={true} />
        </div>
      </div>

      <div className="flex flex-col p-8 mt-16">
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-neutral-950/50 border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6 text-white/90">System Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white/80">
              <div>
                <p className="text-white/60">Client ID:</p>
                <p>{client?.clientId || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-white/60">Type:</p>
                <p>{manifest?.name || manifest?.id || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-white/60">Profile ID:</p>
                <p>{preferences?.profileId || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-white/60">Version:</p>
                <p>{manifest?.version || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-white/60">Apps Loaded:</p>
                <p>{apps.length || '0'}</p>
              </div>
              <div>
                <p className="text-white/60">Connection Status:</p>
                <p>{isConnected ? 'Connected' : 'Disconnected'}</p>
              </div>
              <div>
                <p className="text-white/60">Mapping Profile:</p>
                <p>{preferences?.profileId || 'default'}</p>
              </div>
              <div>
                <p className="text-white/60">Available Actions:</p>
                <p>{profile?.actions?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-950/50 border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6 text-white/90">Display Settings</h2>

            <div style={{ marginTop: '24px' }}>
              <div className="flex flex-col"></div>
              <label className="text-sm text-white/60 mb-2">Screensaver Type</label>
              <div className="relative"></div>
              <button
                onClick={() => setOpenDropdown(openDropdown ? null : 'screensaver')}
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white/80 hover:bg-white/5 transition-colors duration-200 text-left"
              >
                {localPreferences?.ScreensaverType?.type || 'Select Screensaver'}
              </button>

              {openDropdown === 'screensaver' && (
                <div className="absolute top-full left-0 mt-2 w-full bg-zinc-900 border border-white/10 rounded-lg shadow-lg overflow-hidden z-50">
                  {['clock', 'black', 'logo', 'none'].map((mode) => (
                    <button
                      key={mode}
                      className="block w-full px-4 py-3 text-left text-white/80 hover:bg-white/5 transition-colors duration-200"
                      onClick={() => {
                        setScreensaverMode(mode as ScreensaverSettings['type'])
                        setOpenDropdown(null)
                      }}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col" style={{ marginTop: '24px' }}>
              <label className="text-sm text-white/60 mb-2">Icon Color</label>
              <input
                type="color"
                value={localPreferences?.theme?.icons || '#ffffff'}
                onChange={(e) => setIconColor(e.target.value)}
                className="w-full h-12 rounded-lg cursor-pointer bg-black/20 border border-white/10"
              />
            </div>
          </div>

          <div className="bg-neutral-950/50 border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6 text-white/90">System</h2>
            <button
              onClick={resyncData}
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white/80 hover:bg-white/5 transition-colors duration-200"
            >
              Resync Data
            </button>
            <button
              onClick={saveConfigToServer}
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white/80 hover:bg-white/5 transition-colors duration-200"
            >
              Save Data
            </button>
            <button
              onClick={() => setPage('developer')}
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white/80 hover:bg-white/5 transition-colors duration-200"
            >
              <span className="hidden xs:block">Go to Developer Settings</span>{' '}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
