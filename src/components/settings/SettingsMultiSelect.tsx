import React, { useState } from 'react'
import SettingComponent from './SettingComponent'
import { SettingsMultiSelect } from '@deskthing/types'
import { IconArrowDown } from '@src/assets/Icons'

interface SettingsMultiSelectProps {
  setting: SettingsMultiSelect
  handleSettingChange: (value: string[]) => void
  className?: string
}

/**
 * A React component that renders a multi-select setting UI.
 *
 * @param setting - The settings object that contains the options and the current selected values.
 * @param handleSettingChange - A callback function that is called when the selected items change.
 * @param className - An optional CSS class name to apply to the component.
 */
export const SettingsMultiSelectComponent: React.FC<SettingsMultiSelectProps> = ({
  handleSettingChange,
  className,
  setting
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>(setting.value || [])

  const toggleItem = (item: string) => {
    const newItems = selectedItems.includes(item)
      ? selectedItems.filter((i) => i !== item)
      : [...selectedItems, item]
    setSelectedItems(newItems)
    handleSettingChange(newItems)
  }

  return (
    <SettingComponent setting={setting} className={className}>
      <div className="w-96 max-w-s relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={setting.disabled}
          className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 w-full focus:outline-none flex justify-between items-center"
        >
          <span>{selectedItems.length ? selectedItems.join(', ') : 'Select items'}</span>
          <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            <IconArrowDown />
          </span>
        </button>
        {isOpen && (
          <div className="absolute w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10">
            {setting.options.map((option) => (
              <button
                key={option.value}
                onClick={() => toggleItem(option.value)}
                className="w-full text-left text-white hover:bg-gray-600 px-2 py-1 flex items-center"
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(option.value)}
                  onChange={() => {}}
                  className="mr-2"
                />
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </SettingComponent>
  )
}
