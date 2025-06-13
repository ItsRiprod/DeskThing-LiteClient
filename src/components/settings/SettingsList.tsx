import React, { useState } from 'react'
import SettingComponent from './SettingComponent'
import { SettingsList } from '@deskthing/types'
import { IconArrowDown } from '@src/assets/Icons'

interface SettingsListProps {
  setting: SettingsList
  handleSettingChange: (value: string[]) => void
  className?: string
}

/**
 * A React component that renders a settings list with a dropdown to select multiple options.
 *
 * @param {SettingsListProps} props - The props for the SettingsListComponent.
 * @param {SettingsList} props.setting - The settings list object containing the options and current value.
 * @param {(value: string[]) => void} props.handleSettingChange - A callback function to handle changes to the selected items.
 * @param {string} [props.className] - An optional CSS class name to apply to the component.
 * @returns {React.ReactElement} - The rendered SettingsListComponent.
*/
export const SettingsListComponent: React.FC<SettingsListProps> = ({
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
          disabled={setting.disabled}
          onClick={() => setIsOpen(!isOpen)}
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
