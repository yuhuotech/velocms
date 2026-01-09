'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface ThemeInfo {
  name: string
  version: string
  description?: string
  author?: { name: string; email?: string; website?: string }
  screenshot?: string
  isActive: boolean
}

export interface ThemeContextValue {
  themes: ThemeInfo[]
  activeTheme: string | null
  settings: Record<string, any>
  loading: boolean
  switchTheme: (name: string) => Promise<void>
  updateSettings: (settings: Record<string, any>) => Promise<void>
  getThemeConfig: () => Promise<any>
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
  initialTheme?: string
}

export function ThemeProvider({ children, initialTheme = 'default' }: ThemeProviderProps) {
  const [themes, setThemes] = useState<ThemeInfo[]>([])
  const [activeTheme, setActiveTheme] = useState<string | null>(initialTheme)
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadThemes()
  }, [])

  const loadThemes = async () => {
    try {
      const response = await fetch('/api/themes')
      const data = await response.json()
      setThemes(data.themes || [])
      setActiveTheme(data.activeTheme || initialTheme)
    } catch (error) {
      console.error('Failed to load themes:', error)
    } finally {
      setLoading(false)
    }
  }

  const switchTheme = async (name: string) => {
    try {
      const response = await fetch('/api/themes/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeName: name }),
      })

      if (response.ok) {
        setActiveTheme(name)
        // Trigger a page reload to apply the new theme
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to switch theme:', error)
    }
  }

  const updateSettings = async (newSettings: Record<string, any>) => {
    if (!activeTheme) return

    try {
      const response = await fetch(`/api/themes/${activeTheme}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      })

      if (response.ok) {
        setSettings(newSettings)
      }
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  }

  const getThemeConfig = async () => {
    if (!activeTheme) return null

    try {
      const response = await fetch(`/api/themes/${activeTheme}`)
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to get theme config:', error)
    }
    return null
  }

  return (
    <ThemeContext.Provider
      value={{
        themes,
        activeTheme,
        settings,
        loading,
        switchTheme,
        updateSettings,
        getThemeConfig,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
