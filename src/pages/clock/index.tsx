import { SETTING_TYPES } from '@deskthing/types'
import { IconX } from '@src/assets/Icons'
import { SettingsBooleanComponent } from '@src/components/settings/SettingsBoolean'
import { SettingsColorComponent } from '@src/components/settings/SettingsColor'
import { TimeUpdater } from '@src/components/TimeUpdater'
import Button from '@src/components/ui/Button'
import { useMusicStore, useSettingsStore } from '@src/stores'
import { useTimeStore } from '@src/stores/timeStore'
import { FC, useEffect, useState, useRef, useCallback } from 'react'

/**
 * The main component for the Clock page, which displays the current time and provides settings to customize the appearance.
 *
 * The component renders the current time, with an optional blurred background image from the currently playing song. It also provides a configuration panel that allows the user to toggle the display of the album art, switch between 12-hour and 24-hour time formats, and customize the text color.
 *
 * The configuration panel is positioned absolutely and can be opened and closed by clicking on the main content area.
 */
const ClockPage: FC = () => {
  const musicData = useMusicStore((state) => state.song)
  const time = useTimeStore((state) => state.currentTimeFormatted)
  const syncTime = useTimeStore((state) => state.updateCurrentTime)
  const [showAlbumArt, setShowAlbumArt] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const updatePreferences = useSettingsStore((state) => state.updatePreferences)
  const use24hour = useSettingsStore((state) => state.preferences.use24hour)
  const textDark = useSettingsStore((state) => state.preferences.theme.textDark)
  const textLight = useSettingsStore((state) => state.preferences.theme.textLight)
  const updateTheme = useSettingsStore((state) => state.updateTheme)
  const configRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (configRef.current && !configRef.current.contains(event.target as Node)) {
        setShowConfig(false)
      } else if (mainRef.current && mainRef.current.contains(event.target as Node)) {
        setShowConfig(true)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showConfig])

  useEffect(() => {
    syncTime()
  }, [use24hour])

  const handle24HourChange = useCallback((value: boolean) => {
    updatePreferences({ use24hour: value })
  }, [updatePreferences])

  const handleTextLightChange = useCallback((value: string) => {
    updateTheme({ textLight: value })
  }, [updateTheme])

  const handleTextDarkChange = useCallback((value: string) => {
    updateTheme({ textDark: value })
  }, [updateTheme])

  const settingsTextLight = {
    value: textLight,
    type: SETTING_TYPES.COLOR,
    label: 'Text Light'
  } as const

  const settingsTextDark = {
    value: textDark,
    type: SETTING_TYPES.COLOR,
    label: 'Text Dark'
  } as const
  return (
    <div ref={mainRef} className="relative w-full flex items-center justify-center h-full">
      <TimeUpdater />
      {showAlbumArt && musicData && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${musicData.thumbnail})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(25px)'
          }}
        />
      )}
      <div className="absolute w-full h-full inset-0 flex items-center justify-center">
        <p
          style={{
            color:
              (showAlbumArt && musicData && musicData.color && musicData.color.isLight)
                ? textDark || textLight
                : textLight
          }}
          className="text-9xl"
        >
          {time}
        </p>
      </div>
      {showConfig && (
        <div
          ref={configRef}
          className="absolute overflow-hidden overflow-y-auto p-5 w-5/6 h-5/6 bg-zinc-900/50 animate-drop rounded-xl"
        >
          <SettingsBooleanComponent
            handleSettingChange={(value) => setShowAlbumArt(value)}
            setting={{
              value: showAlbumArt,
              type: SETTING_TYPES.BOOLEAN,
              label: 'Show Album Art'
            }}
          />
          <SettingsBooleanComponent
            handleSettingChange={handle24HourChange}
            setting={{
              value: use24hour,
              type: SETTING_TYPES.BOOLEAN,
              label: '24 hour time'
            }}
          />
          <SettingsColorComponent
            handleSettingChange={handleTextLightChange}
            setting={settingsTextLight}
          />
          <SettingsColorComponent
            handleSettingChange={handleTextDarkChange}
            setting={settingsTextDark}
          />
          <Button
            className="bg-red-500"
            onClick={(e) => {
              e.stopPropagation()
              setShowConfig(false)
            }}
          >
            <IconX />
            <p>Close</p>
          </Button>
        </div>
      )}
    </div>
  )
}

export default ClockPage