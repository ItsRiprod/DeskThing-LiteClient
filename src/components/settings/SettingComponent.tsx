import { SettingsType } from '@deskthing/types'

interface SettingComponentProps {
  setting: SettingsType
  children?: React.ReactNode
  className?: string
}

/**
 * The `SettingComponent` is a React component that renders a setting UI element. It takes in a `SettingsType` object, which contains information about the setting, and optional `children` and `className` props.
 * The component renders a div with various child elements that display the setting's type, label, description, and value (if applicable). The component also applies various CSS classes to style the setting element.
 */
const SettingComponent = ({ setting, children, className }: SettingComponentProps): JSX.Element => {
  return (
    <div
      className={`py-3 shrink-0 flex items-center hover:bg-zinc-950/50 justify-between w-full border-t relative border-gray-900 ${className}`}
    >
      <div className="w-full flex-1">
        <div className="text-gray-500 font-geistMono absolute -top-2 inset flex justify-between w-full">
          <p>{setting.type?.toUpperCase() || 'Legacy Setting'}</p>
          {setting.type === 'number' && (
            <p>
              MIN: {setting.min} | MAX: {setting.max}
            </p>
          )}
        </div>
        <div className="group relative flex flex-wrap w-full">
          <p className="py-5 cursor-help text-3xl break-words max-w-xs">{setting.label}</p>
          {setting.description && (
            <div className="absolute left-0 -bottom-1 translate-y-full invisible group-hover:visible bg-zinc-800 text-sm text-gray-300 px-2 py-1 rounded-md whitespace-normal max-w-xs z-10">
              {setting.description}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center">
        {setting.type === 'range' && <div>{setting.value}</div>}
        {children}
      </div>
    </div>
  )
}

export default SettingComponent
