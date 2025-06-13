import React from 'react'
import SettingComponent from './SettingComponent'
import { SettingsString } from '@deskthing/types'

interface SettingsStringProps {
  setting: SettingsString
  handleSettingChange: (value: string) => void
  className?: string
}

const commonClasses =
'px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'

/**
 * A React component that renders a string setting with a text input.
 *
 * @param setting - The settings string object, containing the value and other metadata.
 * @param handleSettingChange - A callback function to update the setting value.
 * @param className - An optional CSS class name to apply to the component.
 */
export const SettingsStringComponent: React.FC<SettingsStringProps> = ({
  className,
  setting,
  handleSettingChange
}) => {
  return (
    <SettingComponent setting={setting} className={className}>
      <div className="flex items-center w-full">
        <input
          disabled={setting.disabled}
          type="text"
          value={setting.value as string}
          maxLength={(setting as SettingsString).maxLength}
          onChange={(e) => handleSettingChange(e.target.value)}
          className={commonClasses + ' text-black w-96 max-w-s'}
        />
      </div>
    </SettingComponent>
  )
}
