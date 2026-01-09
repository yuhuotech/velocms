'use client'

import { useTheme } from '@/lib/theme'
import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export function ThemeSelector() {
  const { themes, activeTheme, switchTheme, loading } = useTheme()
  const [open, setOpen] = useState(false)

  const handleThemeSwitch = async (themeName: string) => {
    if (themeName !== activeTheme) {
      await switchTheme(themeName)
    }
    setOpen(false)
  }

  if (loading) {
    return (
      <div className="w-32 h-8 bg-muted animate-pulse rounded" />
    )
  }

  const currentTheme = themes.find(t => t.name === activeTheme)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-accent transition-colors"
      >
        <span>{currentTheme?.name || 'default'}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-40 bg-background border border-border rounded-md shadow-lg z-50 py-1">
            {themes.map(theme => (
              <button
                key={theme.name}
                onClick={() => handleThemeSwitch(theme.name)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center justify-between"
              >
                <span>{theme.name}</span>
                {theme.name === activeTheme && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ThemeSelector
