import Button from './Button'
import { ActionReference } from '@deskthing/types'
import { useMappingStore } from '@src/stores'
import ActionIcon from './ActionIcon'

const FullscreenAction: ActionReference = {
  id: 'fullscreen',
  source: 'server',
  enabled: true
}

interface FullscreenButtonProps {
  expanded?: boolean
}

/**
 * A button component that toggles the fullscreen mode of the application.
 *
 * @param {FullscreenButtonProps} props - The props for the FullscreenButton component.
 * @param {boolean} [props.expanded] - Whether the button should be in an expanded state.
 * @returns {JSX.Element} - The FullscreenButton component.
 */
const FullscreenButton: React.FC<FullscreenButtonProps> = ({ expanded }) => {
  const executeAction = useMappingStore((state) => state.executeAction)
  const getActionUrl = useMappingStore((state) => state.getActionUrl)

  const onClick = () => {
    executeAction(FullscreenAction)
  }

  return (
    <Button className="w-fit border-2 border-cyan-500 items-center" onClick={onClick}>
      <p
        className={`${expanded ? 'w-fit' : 'w-0'} text-nowrap text-2xl font-semibold mx-2 overflow-hidden transition-[width]`}
      >
        Toggle Fullscreen
      </p>
      <div className={`flex items-center justify-center cursor-pointer`}>
        <ActionIcon url={getActionUrl(FullscreenAction)} />
      </div>
    </Button>
  )
}

export default FullscreenButton
