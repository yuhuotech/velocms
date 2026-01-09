import { NextResponse } from 'next/server'
import path from 'path'
import * as fs from 'fs/promises'
import { createThemeLoader } from '@/lib/theme-system'

const themesDir = path.join(process.cwd(), 'themes')

export async function GET() {
  try {
    const loader = createThemeLoader(themesDir, { autoActivate: true, defaultTheme: 'default' })
    await loader.initialize()

    const themes = loader.listThemes()

    return NextResponse.json({
      themes,
      activeTheme: loader.getActiveThemeName(),
    })
  } catch (error) {
    console.error('Failed to list themes:', error)
    return NextResponse.json(
      { error: 'Failed to list themes' },
      { status: 500 }
    )
  }
}
