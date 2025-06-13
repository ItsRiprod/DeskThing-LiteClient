import { useMappingStore } from '@src/stores'
import { Action, ActionReference } from '@deskthing/types'
import ActionIcon from './ActionIcon'
import { useEffect, useState } from 'react'

interface ActionProps {
  action: Action | ActionReference
  className?: string
}

/**
 * Renders an action component that can be clicked to execute an action.
 *
 * @param action - The action or action reference to be executed when the component is clicked.
 * @param className - An optional CSS class name to apply to the component.
 * @returns A React component that renders the action icon and handles the click event.
 */
const ActionComponent: React.FC<ActionProps> = ({ action, className }) => {
  const executeAction = useMappingStore((store) => store.executeAction)
  const getActionUrl = useMappingStore((store) => store.getActionUrl)
  const profile = useMappingStore((store) => store.profile)
  const [url, setUrl] = useState(null)

  const onClick = () => {
    executeAction(action)
  }

  useEffect(() => {
    setUrl(getActionUrl(action))
  }, [action.id, action.value, profile.actions, getActionUrl])

  return (
    <button
      className={`flex items-center justify-center cursor-pointer w-full h-full`}
      onClick={onClick}
    >
      {url && <ActionIcon url={url} className={className} />}
    </button>
  )
}

export default ActionComponent
