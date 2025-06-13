import { useMappingStore } from '@src/stores'
import { EventMode } from '@deskthing/types'
import ActionComponent from './Action'
import { useEffect, useState } from 'react'

interface KeyProps {
  keyId: string
  className?: string
}

/**
 * A React component that renders a key with an associated action.
 *
 * @param {KeyProps} props - The props for the Key component.
 * @param {string} props.keyId - The unique identifier for the key.
 * @param {string} [props.className] - An optional CSS class name to apply to the key.
 * @returns {React.ReactElement | null} - The rendered key component, or null if the action is hidden.
 */
const Key: React.FC<KeyProps> = ({ keyId, className }) => {
  const getButtonAction = useMappingStore((store) => store.getButtonAction)
  const profile = useMappingStore((store) => store.profile)
  const [action, setAction] = useState(getButtonAction(keyId, EventMode.KeyDown))

  useEffect(() => {
    const action = getButtonAction(keyId, EventMode.KeyDown)
    setAction(action)
  }, [getButtonAction, profile, keyId])

  if (!action || action.id == 'hidden') return null

  return <ActionComponent action={action} className={className} />
}

export default Key
