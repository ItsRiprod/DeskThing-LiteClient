import React, { useEffect, useState } from 'react'
import ActionComponent from '../components/ui/Action'
import { useMappingStore } from '@src/stores'
import { Action, EventMode } from '@deskthing/types'
import { useActionStore } from '@src/stores/actionStore'

const actionKeys = ['Wheel1', 'Wheel2', 'Wheel3', 'Wheel4']

/**
 * The `Wheel` component represents a selection wheel UI element that allows the user to choose an action.
 * It displays a circular wheel with four action buttons that can be selected by the user.
 * The wheel can be opened and closed, and the selected action is executed when the user presses the Enter key.
 * The component uses the `useMappingStore` and `useActionStore` hooks to manage the state and behavior of the wheel.
 */
const Wheel: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [buttons, setButtons] = useState<Action[]>([])
  const getButtonAction = useMappingStore((store) => store.getButtonAction)
  const executeAction = useMappingStore((store) => store.executeAction)
  const [opened, setIsOpened] = useState<boolean>(false)
  const setWheelState = useActionStore((store) => store.setWheelState)
  const wheelRotation = useActionStore((store) => store.wheelRotation)

  const handleClose = async () => {
    setIsOpened(false)
    setTimeout(() => {
      setWheelState(false)
    }, 200)
  }

  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      e.stopPropagation()
      e.preventDefault()
      e.stopImmediatePropagation()
      if (e.key === 'Enter') {
        setIsOpened(false)
        const action = getButtonAction(selectedAction as string, EventMode.KeyDown)
        if (action) {
          executeAction(action)
        }
        handleClose()
      }
    }

    window.addEventListener('keydown', handleEnter)

    setIsOpened(true)

    return () => {
      window.removeEventListener('keydown', handleEnter)
    }
  }, [selectedAction])

  useEffect(() => {
    const normalizedRotation = ((wheelRotation % 4) + 4) % 4
    const gridToWheelMapping = [2, 3, 1, 0] // Maps grid positions to wheel positions
    const selectedIndex = gridToWheelMapping[normalizedRotation]
    setSelectedAction(actionKeys[selectedIndex])
  }, [wheelRotation, buttons])

  useEffect(() => {
    const getActions = async () => {
      const actions = actionKeys.map((key) => getButtonAction(key, EventMode.KeyDown))
      setButtons(actions)
    }
    getActions()
  }, [getButtonAction])

  return (
    <div
      className={`rounded-full z-10 lg:rotate-90 overflow-hidden flex items-center bg-gradient-radial from-black via-black/10 to-transparent w-[350px] h-[350px] transition-[transform,opacity] origin-center translate-x-[65vw] lg:translate-x-0 lg:translate-y-0 -translate-y-[30vh] fixed ${opened ? 'scale-[2] lg:scale-100 opacity-100' : 'scale-0 opacity-0'}`}
    >
      <div
        style={{ transform: `rotate(${wheelRotation * 90 + 45}deg)` }}
        className="transition-all grid grid-cols-2 w-full h-full"
      >
        {buttons.length > 0 &&
          [buttons[0], buttons[1], buttons[2], buttons[3]].map((action, index) => (
            <div
              key={index}
              className={`w-full h-full duration-300 flex lg:-rotate-90 items-center justify-center transition-all`}
            >
              <div
                onClick={handleClose}
                style={{ transform: `rotate(${-wheelRotation * 90 - 45}deg)` }}
                className={`transition-all items-center justify-start w-1/4 h-1/4 flex`}
              >
                <ActionComponent
                  action={action}
                  className={`transition ${selectedAction == actionKeys[index] ? 'delay-300 lg:delay-100 scale-[2]' : 'opacity-75'}`}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default Wheel
