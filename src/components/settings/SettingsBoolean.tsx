import React from 'react'
import SettingComponent from './SettingComponent'
import { SettingsBoolean } from '@deskthing/types'
import Button from '../ui/Button'
import { IconToggle } from '@src/assets/Icons'

interface SettingsBooleanProps {
  setting: SettingsBoolean
  handleSettingChange: (value: boolean) => void
  className?: string
}

/**
 * A React component that renders a boolean setting with a toggle button.
 *
 * @param {SettingsBooleanProps} props - The props for the component.
 * @param {SettingsBoolean} props.setting - The boolean setting to be rendered.
 * @param {(value: boolean) => void} props.handleSettingChange - A function to handle changes to the setting value.
 * @param {string} [props.className] - An optional CSS class name to apply to the component.
 * @returns {React.ReactElement} - The rendered SettingsBooleanComponent.
 */
export const SettingsBooleanComponent: React.FC<SettingsBooleanProps> = ({
  className,
  setting,
  handleSettingChange
}) => {
  return (
    <SettingComponent setting={setting} className={className}>
      <Button
        disabled={setting.disabled}
        onClick={() => handleSettingChange(!setting.value as boolean)}
      >
        <IconToggle
          iconSize={64}
          checked={setting.value as boolean}
          className={`${setting.value ? 'text-green-500' : 'text-gray-500'} w-full h-full`}
        />
      </Button>
    </SettingComponent>
  )
}
