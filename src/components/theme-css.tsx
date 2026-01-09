'use client'

import { useTheme } from '@/lib/theme'
import { useEffect, useState } from 'react'

export function ThemeCSS() {
  const { getThemeConfig } = useTheme()
  const [css, setCss] = useState('')

  useEffect(() => {
    const loadCSS = async () => {
      const config = await getThemeConfig()
      if (config?.config?.colors) {
        const style = Object.entries(config.config.colors)
          .map(([key, value]) => `--color-${key}: ${value};`)
          .join('\n')
        setCss(`:root {\n${style}\n}`)
      }
    }
    loadCSS()
  }, [getThemeConfig])

  if (!css) return null

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}

export default ThemeCSS
