import { Icon } from '@src/assets/Icons/Icons'
import { useMappingStore, useSettingsStore } from '@src/stores'
import { IconLogoGear } from '@src/assets/Icons'
import { useEffect, useState } from 'react'

interface ActionProps {
  url: string
  className?: string
}

/**
 * A React component that renders an action icon with an SVG image fetched from a provided URL.
 *
 * @param {ActionProps} props - The component props.
 * @param {string} props.url - The URL of the SVG image to be displayed.
 * @param {string} [props.className] - An optional CSS class name to be applied to the component.
 * @returns {JSX.Element} - The rendered action icon component.
 */
const ActionIcon: React.FC<ActionProps> = ({ url, className }) => {
  const getActionUrl = useMappingStore((store) => store.getActionUrl)
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const iconColor = useSettingsStore((store) => store.preferences.theme.icons)

  useEffect(() => {
    const abortController = new AbortController()

    const fetchIcon = async () => {
      try {
        const rawSvg = await fetch(url, {
          signal: abortController.signal,
          headers: {
            Accept: 'image/svg+xml'
          }
        })
        if (rawSvg.ok) {
          const contentType = rawSvg.headers.get('content-type')
          if (contentType && contentType.includes('svg')) {
            const text = await rawSvg.text()
            setSvgContent(text)
          } else {
            setSvgContent(null)
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          // Silently fail for 404s and other errors
        }
      }
    }

    fetchIcon()
    return () => abortController.abort()
  }, [getActionUrl, url])

  return (
    <Icon color={iconColor} className={`${className || 'w-full h-full'}  animate-pop-in`}>
      {svgContent ? <svg dangerouslySetInnerHTML={{ __html: svgContent }} /> : <IconLogoGear />}
    </Icon>
  )
}

export default ActionIcon
