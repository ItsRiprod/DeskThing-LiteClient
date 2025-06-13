import React, { useState, useEffect, memo } from 'react'
import SettingComponent from './SettingComponent'
import { SettingsColor } from '@deskthing/types'

interface SettingsColorProps {
  setting: SettingsColor
  handleSettingChange: (value: string) => void
  className?: string
}

/**
 * A React component that renders a color setting with a color picker input.
 *
 * @param setting - The color setting object, containing the current value and other properties.
 * @param handleSettingChange - A function to call when the color value changes, passing the new value as a parameter.
 * @param className - An optional CSS class name to apply to the component.
 */
export const SettingsColorComponent: React.FC<SettingsColorProps> = memo(
  ({ handleSettingChange, className, setting }) => {
    const [localValue, setLocalValue] = useState(setting.value)
    const [showPrompt, setShowPrompt] = useState(false)
    const [isChanging, setIsChanging] = useState(false)

    useEffect(() => {
      let timer: NodeJS.Timeout
      if (isChanging) {
        timer = setTimeout(() => {
          if (localValue !== setting.value) {
            handleSettingChange(localValue)
          }
          setIsChanging(false)
        }, 300)
      }
      return () => clearTimeout(timer)
    }, [localValue, isChanging, setting.value, handleSettingChange])

    useEffect(() => {
      let promptTimer: NodeJS.Timeout
      if (showPrompt) {
        promptTimer = setTimeout(() => {
          setShowPrompt(false)
        }, 10000)
      }
      return () => clearTimeout(promptTimer)
    }, [showPrompt])

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value)
      setIsChanging(true)
    }

    return (
      <SettingComponent setting={setting} className={className}>
        <div className="max-w-[100px] relative flex justify-end items-center">
          <span className="mr-2 text-white">{localValue}</span>
          <div className="relative">
            <input
              disabled={setting.disabled}
              type="color"
              value={localValue}
              onChange={handleColorChange}
              className="w-12 h-8 rounded cursor-pointer"
              onClick={() => setShowPrompt(true)}
            />
            {showPrompt && (
              <div
                onClick={() => setShowPrompt(false)}
                className="fixed top-4 left-4 z-50 flex items-center rounded-lg bg-green-500 px-4 py-2 text-sm text-white"
              >
                <div className="h-2 w-2 rounded-full bg-white" />
                <p className="ml-2">Click the Scroll Wheel or Enter to close</p>
              </div>
            )}
          </div>
        </div>
      </SettingComponent>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.className === nextProps.className &&
      prevProps.setting.value === nextProps.setting.value
    )
  }
)
