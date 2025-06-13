import { Icon } from '.'

function IconArrowLeft(props): JSX.Element {
  return (
    <Icon {...props} fill={props.fill || 'none'}>
      <svg viewBox="0 0 24 24">
        <path d="m15 18-6-6 6-6" />
      </svg>
    </Icon>
  )
}

export default IconArrowLeft
