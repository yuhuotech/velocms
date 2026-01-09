import * as fs from 'fs/promises'
import * as path from 'path'
import { ThemeRegistry, validateTheme } from './registry'
import { themeConfigManager } from './config'
import type { Theme, ThemeColorScheme } from './types'

export interface ThemeInfo {
  name: string
  version: string
  description?: string
  author?: { name: string; email?: string; website?: string }
  screenshot?: string
  isActive: boolean
  supportsDarkMode: boolean
  settings: Array<{
    key: string
    type: string
    default?: any
    label: string
    description?: string
    category?: string
    options?: string[]
    min?: number
    max?: number
    step?: number
  }>
}

export interface ThemeDetails extends ThemeInfo {
  config: {
    colors?: Record<string, string>
    darkColors?: Record<string, string>
    fonts?: Record<string, any>
    layout?: Record<string, any>
    features?: Record<string, boolean>
  }
  assets: {
    css: string[]
    js: string[]
  }
}

export interface ThemeLoaderOptions {
  autoActivate?: boolean
  defaultTheme?: string
}

export class ThemeLoader {
  private registry: ThemeRegistry
  private initialized = false

  constructor(themesDir?: string) {
    this.registry = new ThemeRegistry(themesDir)
  }

  async initialize(options: ThemeLoaderOptions = {}): Promise<void> {
    if (this.initialized) return

    // Load all themes
    await this.registry.loadAllThemes()

    // Auto-activate default theme if specified and exists
    if (options.autoActivate && options.defaultTheme) {
      const theme = this.registry.getTheme(options.defaultTheme)
      if (theme) {
        await this.registry.activateTheme(options.defaultTheme)
        themeConfigManager.registerTheme(theme)
      }
    }

    this.initialized = true
  }

  async loadTheme(themePath: string): Promise<Theme> {
    const theme = await this.registry.registerTheme(themePath)
    themeConfigManager.registerTheme(theme)
    return theme
  }

  async loadThemesFromDir(dir: string): Promise<Theme[]> {
    const themes: Theme[] = []

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const themePath = path.join(dir, entry.name)
          try {
            const theme = await this.loadTheme(themePath)
            themes.push(theme)
          } catch (error) {
            console.warn(`Failed to load theme at ${themePath}:`, error)
          }
        }
      }
    } catch (error) {
      console.warn(`Themes directory not found: ${dir}`)
    }

    return themes
  }

  listThemes(): ThemeInfo[] {
    const activeTheme = this.registry.getActiveTheme()
    const activeName = activeTheme?.name

    return this.registry.listThemes().map(theme => ({
      name: theme.config.name,
      version: theme.config.version,
      description: theme.config.description,
      author: theme.config.author,
      screenshot: theme.config.screenshot,
      isActive: theme.config.name === activeName,
      supportsDarkMode: themeConfigManager.hasDarkModeSupport(theme.config.name),
      settings: theme.config.settings || [],
    }))
  }

  getTheme(name: string): ThemeDetails | null {
    const theme = this.registry.getTheme(name)
    if (!theme) return null

    const isActive = this.registry.isThemeActive(name)

    return {
      name: theme.config.name,
      version: theme.config.version,
      description: theme.config.description,
      author: theme.config.author,
      screenshot: theme.config.screenshot,
      isActive,
      supportsDarkMode: themeConfigManager.hasDarkModeSupport(name),
      settings: theme.config.settings || [],
      config: {
        colors: theme.config.config?.colors,
        darkColors: theme.config.config?.darkColors,
        fonts: theme.config.config?.fonts,
        layout: theme.config.config?.layout,
        features: theme.config.config?.features,
      },
      assets: {
        css: theme.assets.css,
        js: theme.assets.js,
      },
    }
  }

  async activateTheme(themeName: string): Promise<Theme> {
    const theme = await this.registry.activateTheme(themeName)
    themeConfigManager.registerTheme(theme)
    return theme
  }

  getActiveTheme(): Theme | null {
    return this.registry.getActiveTheme()
  }

  getActiveThemeName(): string | null {
    const theme = this.registry.getActiveTheme()
    return theme?.name || null
  }

  async validateTheme(themePath: string): Promise<{ valid: boolean; errors: Array<{ field: string; message: string }> }> {
    return validateTheme(themePath)
  }

  getThemeConfig(themeName: string, userSettings?: Record<string, any>) {
    return themeConfigManager.getThemeConfig(themeName, userSettings)
  }

  generateCSSVariables(themeName: string, userSettings?: Record<string, any>): string {
    return themeConfigManager.generateThemeCSSVariables(themeName, userSettings)
  }

  getThemeDefaultSettings(themeName: string): Record<string, any> {
    return themeConfigManager.getThemeDefaultSettings(themeName)
  }

  hasDarkModeSupport(themeName: string): boolean {
    return themeConfigManager.hasDarkModeSupport(themeName)
  }

  getThemeColorSchemes(themeName: string): { light: ThemeColorScheme; dark: ThemeColorScheme } | null {
    return themeConfigManager.getThemeColorSchemes(themeName)
  }
}

export function createThemeLoader(themesDir?: string, options?: ThemeLoaderOptions): ThemeLoader {
  const loader = new ThemeLoader(themesDir)
  return loader
}
