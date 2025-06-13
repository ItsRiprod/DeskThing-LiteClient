import { Icon, IconProps } from '.'

function IconLoading(props: IconProps): JSX.Element {
  return (
    <Icon {...props} fill={props.fill || 'none'}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </Icon>
  )
}

export default IconLoading
