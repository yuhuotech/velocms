import { NextResponse } from 'next/server'
import path from 'path'
import { createThemeLoader } from '@/lib/theme-system'

const themesDir = path.join(process.cwd(), 'themes')

export async function POST(request: Request) {
  try {
    const { themeName } = await request.json()

    if (!themeName) {
      return NextResponse.json(
        { error: 'themeName is required' },
        { status: 400 }
      )
    }

    const loader = createThemeLoader(themesDir, { autoActivate: true, defaultTheme: 'default' })
    await loader.initialize()

    const theme = await loader.activateTheme(themeName)

    return NextResponse.json({
      success: true,
      theme: {
        name: theme.config.name,
        version: theme.config.version,
        isActive: true,
      },
    })
  } catch (error) {
    console.error('Failed to activate theme:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to activate theme' },
      { status: 500 }
    )
  }
}
