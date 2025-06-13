import React from 'react'
import SettingComponent from './SettingComponent'
import { SettingsRange } from '@deskthing/types'

interface SettingsRangeProps {
  setting: SettingsRange
  handleSettingChange: (value: string) => void
  className?: string
}

/**
 * A React component that renders a settings range input.
 *
 * @param className - An optional CSS class name to apply to the component.
 * @param setting - The settings range object, which contains properties like `value`, `min`, `max`, and `step`.
 * @param handleSettingChange - A function that is called when the range input value changes, with the new value as a parameter.
 */
export const SettingsRangeComponent: React.FC<SettingsRangeProps> = ({
  className,
  setting,
  handleSettingChange
}) => {
  return (
    <SettingComponent setting={setting} className={className}>
      {setting.type == 'range' && (
        <input
          disabled={setting.disabled}
          type="range"
          value={setting.value}
          min={setting.min}
          max={setting.max}
          step={setting.step || 1}
          onChange={(e) => handleSettingChange(e.target.value)}
          className="w-96 max-w-s"
        />
      )}
    </SettingComponent>
  )
}
