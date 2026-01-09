import { getThemeLoader } from '@/lib/theme/server'
import type { ThemeInfo } from '@/lib/theme'
import { ThemeCard } from './theme-card'
import { getSettings, getDictionary } from '@/lib/i18n'

export default async function ThemesPage() {
  const settings = await getSettings()
  const dict = await getDictionary(settings.language)
  
  const loader = getThemeLoader()
  await loader.initialize()

  const themes = loader.listThemes() as ThemeInfo[]
  const activeTheme = loader.getActiveThemeName()

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-xl font-bold">{dict.admin.themes.title}</h1>
        <p className="text-xs text-muted-foreground mt-1">{dict.admin.themes.subtitle}</p>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">{dict.admin.themes.installed}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme: ThemeInfo) => (
            <ThemeCard
              key={theme.name}
              theme={theme}
              isActive={theme.name === activeTheme}
            />
          ))}
        </div>
      </div>

      {themes.length === 0 && (
        <div className="text-center py-8 border border-dashed border-border rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">{dict.admin.themes.empty}</p>
          <p className="text-xs text-muted-foreground">
            {dict.admin.themes.emptyHint}
          </p>
        </div>
      )}
    </div>
  )
}