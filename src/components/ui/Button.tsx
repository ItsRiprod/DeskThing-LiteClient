import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: (e) => void
  className?: string
  href?: string
  target?: string
  rel?: string
  disabled?: boolean
  onMouseEnter?: () => void
}

/**
 * A React component that renders a button or a link with consistent styling.
 *
 * @param children - The content to be displayed inside the button or link.
 * @param onClick - An optional click event handler for the button or link.
 * @param className - An optional additional CSS class name to apply to the button or link.
 * @param href - An optional URL to use for the link.
 * @param target - An optional target attribute for the link.
 * @param rel - An optional rel attribute for the link.
 * @param disabled - An optional flag to disable the button.
 * @param onMouseEnter - An optional mouse enter event handler for the button or link.
 */
const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = '',
  href,
  target,
  rel,
  disabled,
  onMouseEnter
}) => {
  const baseClasses = 'flex-row items-center flex p-3 hover:font-semibold rounded-md'
  const combinedClasses = `${baseClasses} ${className}`

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={combinedClasses}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      className={combinedClasses}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button
