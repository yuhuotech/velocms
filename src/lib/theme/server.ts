import path from 'path'

let themeLoader: any = null

export function getThemeLoader() {
  const appDir = process.cwd()
  const themesDir = path.join(appDir, 'themes')

  if (!themeLoader) {
    const { createThemeLoader } = require('@/lib/theme-system')
    themeLoader = createThemeLoader(themesDir, { autoActivate: true, defaultTheme: 'default' })
  }
  return themeLoader
}

export async function initializeThemes() {
  const loader = getThemeLoader()
  await loader.initialize()
  return loader
}

export async function getActiveTheme() {
  const loader = getThemeLoader()
  if (!loader['initialized']) {
    await loader.initialize()
  }
  return loader.getActiveTheme()
}

export async function getThemeConfig(themeName?: string, userSettings?: Record<string, any>) {
  const loader = getThemeLoader()
  if (!loader['initialized']) {
    await loader.initialize()
  }
  const name = themeName || loader.getActiveThemeName()
  if (!name) return null
  return loader.getThemeConfig(name, userSettings)
}

export async function generateThemeCSS(themeName?: string, userSettings?: Record<string, any>) {
  const loader = getThemeLoader()
  if (!loader['initialized']) {
    await loader.initialize()
  }
  const name = themeName || loader.getActiveThemeName()
  if (!name) return ':root {}'
  return loader.generateCSSVariables(name, userSettings)
}

export async function listThemes() {
  const loader = getThemeLoader()
  if (!loader['initialized']) {
    await loader.initialize()
  }
  return loader.listThemes()
}

export async function switchTheme(themeName: string) {
  const loader = getThemeLoader()
  if (!loader['initialized']) {
    await loader.initialize()
  }
  return loader.activateTheme(themeName)
}

export async function hasDarkModeSupport(themeName?: string): Promise<boolean> {
  const loader = getThemeLoader()
  if (!loader['initialized']) {
    await loader.initialize()
  }
  const name = themeName || loader.getActiveThemeName()
  if (!name) return false
  return loader.hasDarkModeSupport(name)
}

export async function getThemeColorSchemes(themeName?: string) {
  const loader = getThemeLoader()
  if (!loader['initialized']) {
    await loader.initialize()
  }
  const name = themeName || loader.getActiveThemeName()
  if (!name) return null
  return loader.getThemeColorSchemes(name)
}
