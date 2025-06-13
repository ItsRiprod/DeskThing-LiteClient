import React, { useState } from 'react'
import SettingComponent from './SettingComponent'
import { SettingsSelect } from '@deskthing/types'
import { IconArrowDown } from '@src/assets/Icons'

interface SettingsSelectProps {
  setting: SettingsSelect
  handleSettingChange: (value: string) => void
  className?: string
}

/**
 * A React component that renders a settings select dropdown.
 *
 * @param setting - The settings select object, containing the options and the current value.
 * @param handleSettingChange - A function to be called when the user selects a new option.
 * @param className - An optional CSS class name to apply to the component.
 */
export const SettingsSelectComponent: React.FC<SettingsSelectProps> = ({
  handleSettingChange,
  className,
  setting
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const currentOption = setting.options.find((opt) => opt.value === setting.value)

  return (
    <SettingComponent setting={setting} className={className}>
      {setting.type == 'select' && (
        <div className="w-full max-w-s relative">
          <button
            disabled={setting.disabled}
            onClick={() => setIsOpen(!isOpen)}
            className={`${setting.disabled ? 'bg-zinc-800' : 'bg-gray-700'} text-white border border-gray-600 rounded-md p-2 w-full focus:outline-none flex justify-between items-center`}
          >
            <span>{currentOption?.label || 'Select option'}</span>
            <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
              <IconArrowDown />
            </span>
          </button>
          {isOpen && (
            <div className="absolute w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10">
              {setting.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    handleSettingChange(option.value)
                    setIsOpen(false)
                  }}
                  className="block w-full text-left text-white hover:bg-gray-600 px-2 py-1"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </SettingComponent>
  )
}
