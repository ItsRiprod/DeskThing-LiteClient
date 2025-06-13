import { Icon } from '.'

function IconArrowUp(props): JSX.Element {
  return (
    <Icon {...props} fill={props.fill || 'none'}>
      <svg viewBox="0 0 24 24">
        <path d="m18 15-6-6-6 6" />
      </svg>
    </Icon>
  )
}

export default IconArrowUp
