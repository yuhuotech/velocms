import type { Theme, ThemeConfig, ThemeColorScheme, UserThemeSettings } from './types'

// Deep merge utility
function deepMerge<T>(base: T, override: T): T {
  const result = { ...base } as Record<string, any>

  for (const key in override) {
    if (override[key] && typeof override[key] === 'object' && !Array.isArray(override[key])) {
      result[key] = deepMerge(result[key] || {}, override[key])
    } else {
      result[key] = override[key]
    }
  }

  return result as T
}

// Deep clone utility
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// Generate CSS for a color scheme
function generateColorSchemeCSS(colors: ThemeColorScheme, prefix: string = ''): string {
  let css = ''
  for (const [key, value] of Object.entries(colors)) {
    if (value) {
      css += `  --color-${key}: ${value};\n`
    }
  }
  return css
}

export class ThemeConfigManager {
  private registry: Map<string, Theme>
  private userSettingsCache: Map<string, { settings: UserThemeSettings; timestamp: number }> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.registry = new Map()
  }

  registerTheme(theme: Theme): void {
    this.registry.set(theme.name, theme)
  }

  async getThemeConfig(themeName: string, userSettings?: Record<string, any>): Promise<any> {
    const theme = this.registry.get(themeName)
    if (!theme) {
      throw new Error(`Theme "${themeName}" not found`)
    }

    // Clone base config
    const config: any = deepClone(theme.config)

    // Merge user settings
    if (userSettings) {
      config.userSettings = { ...config.userSettings, ...userSettings }
    }

    // Apply settings to config
    this.applySettings(config)

    return config
  }

  private applySettings(config: any): void {
    const settings = config.userSettings || {}

    // Apply color settings
    if (settings.primaryColor && config.config?.colors) {
      config.config.colors.primary = settings.primaryColor
    }

    if (settings.secondaryColor && config.config?.colors) {
      config.config.colors.secondary = settings.secondaryColor
    }

    // Apply layout settings
    if (settings.showSidebar !== undefined && config.config?.layout) {
      config.config.layout.sidebar = settings.showSidebar
    }

    if (settings.sidebarPosition && config.config?.layout) {
      config.config.layout.sidebarPosition = settings.sidebarPosition
    }

    // Apply font scale
    if (settings.fontScale && config.config?.fonts) {
      const scale = settings.fontScale
      if (config.config.fonts.body) {
        config.config.fonts.body.scale = scale
      }
      if (config.config.fonts.heading) {
        config.config.fonts.heading.scale = scale
      }
    }

    // Apply posts per page
    if (settings.postsPerPage) {
      config.config = config.config || {}
      config.config.content = config.config.content || {}
      config.config.content.postsPerPage = settings.postsPerPage
    }
  }

  async updateUserThemeSettings(userId: string, themeName: string, settings: Record<string, any>): Promise<void> {
    this.userSettingsCache.set(userId, {
      settings: { themeName, settings },
      timestamp: Date.now(),
    })
  }

  async getUserThemeSettings(userId: string): Promise<UserThemeSettings | null> {
    const cached = this.userSettingsCache.get(userId)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.settings
    }
    return null
  }

  clearUserSettingsCache(userId?: string): void {
    if (userId) {
      this.userSettingsCache.delete(userId)
    } else {
      this.userSettingsCache.clear()
    }
  }

  getThemeDefaultSettings(themeName: string): Record<string, any> {
    const theme = this.registry.get(themeName)
    if (!theme) return {}

    const defaults: Record<string, any> = {}

    for (const setting of theme.config.settings || []) {
      defaults[setting.key] = setting.default ?? null
    }

    return defaults
  }

  validateUserSettings(themeName: string, settings: Record<string, any>): { valid: boolean; errors: string[] } {
    const theme = this.registry.get(themeName)
    if (!theme) {
      return { valid: false, errors: [`Theme "${themeName}" not found`] }
    }

    const errors: string[] = []

    for (const [key, value] of Object.entries(settings)) {
      const settingDef = theme.config.settings?.find(s => s.key === key)
      if (!settingDef) {
        errors.push(`Unknown setting: ${key}`)
        continue
      }

      // Type validation
      switch (settingDef.type) {
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`${key} must be a boolean`)
          }
          break
        case 'number':
        case 'range':
          if (typeof value !== 'number') {
            errors.push(`${key} must be a number`)
          } else {
            if (settingDef.min !== undefined && value < settingDef.min) {
              errors.push(`${key} must be >= ${settingDef.min}`)
            }
            if (settingDef.max !== undefined && value > settingDef.max) {
              errors.push(`${key} must be <= ${settingDef.max}`)
            }
          }
          break
        case 'color':
          if (typeof value !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(value)) {
            errors.push(`${key} must be a valid hex color`)
          }
          break
        case 'select':
          if (settingDef.options && !settingDef.options.includes(value)) {
            errors.push(`${key} must be one of: ${settingDef.options.join(', ')}`)
          }
          break
      }
    }

    return { valid: errors.length === 0, errors }
  }

  generateThemeCSSVariables(themeName: string, userSettings?: Record<string, any>): string {
    const theme = this.registry.get(themeName)
    if (!theme) return ''

    const config = theme.config
    const lightColors = config.config?.colors || {}
    const darkColors = config.config?.darkColors || {}
    const fonts = config.config?.fonts || {}
    const layout = config.config?.layout || {}

    const settings = { ...(config as any).userSettings, ...userSettings }

    // Apply user color overrides for light mode
    const finalLightColors = { ...lightColors }
    if (settings.primaryColor) finalLightColors.primary = settings.primaryColor
    if (settings.secondaryColor) finalLightColors.secondary = settings.secondaryColor

    // Apply user color overrides for dark mode
    const finalDarkColors = { ...darkColors }
    if (settings.darkPrimaryColor) finalDarkColors.primary = settings.darkPrimaryColor
    if (settings.darkSecondaryColor) finalDarkColors.secondary = settings.darkSecondaryColor

    const fontScale = settings.fontScale || 1

    let css = '/* Light mode colors */\n'
    css += ':root {\n'
    css += generateColorSchemeCSS(finalLightColors)
    
    // Fonts
    if (fonts.heading) {
      css += `  --font-heading: ${fonts.heading.family};\n`
      if (fonts.heading.weight) {
        css += `  --font-heading-weights: ${fonts.heading.weight.join(' ')};\n`
      }
    }

    if (fonts.body) {
      css += `  --font-body: ${fonts.body.family};\n`
      if (fonts.body.weight) {
        css += `  --font-body-weights: ${fonts.body.weight.join(' ')};\n`
      }
    }

    if (fonts.code) {
      css += `  --font-code: ${fonts.code.family};\n`
    }

    // Font scale
    css += `  --font-scale: ${fontScale};\n`

    // Layout
    if (layout.maxWidth) {
      css += `  --container-max-width: ${layout.maxWidth};\n`
    }

    css += '}\n\n'

    // Dark mode colors
    css += '/* Dark mode colors */\n'
    css += '.dark, .dark-mode {\n'
    css += generateColorSchemeCSS(finalDarkColors)
    css += '}\n'

    // System preference
    css += '\n/* System preference dark mode */\n'
    css += '@media (prefers-color-scheme: dark) {\n'
    css += '  :root:not(.light):not(.light-mode) {\n'
    css += generateColorSchemeCSS(finalDarkColors)
    css += '  }\n'
    css += '}\n'

    return css
  }

  hasDarkModeSupport(themeName: string): boolean {
    const theme = this.registry.get(themeName)
    if (!theme) return false
    return !!theme.config.config?.darkColors
  }

  getThemeColorSchemes(themeName: string): { light: ThemeColorScheme; dark: ThemeColorScheme } | null {
    const theme = this.registry.get(themeName)
    if (!theme) return null

    return {
      light: theme.config.config?.colors || {},
      dark: theme.config.config?.darkColors || {},
    }
  }
}

export const themeConfigManager = new ThemeConfigManager()
