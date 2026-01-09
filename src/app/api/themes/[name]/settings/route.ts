import { NextResponse } from 'next/server'
import path from 'path'
import { createThemeLoader } from '@/lib/theme-system'

const themesDir = path.join(process.cwd(), 'themes')

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params
    const settings = await request.json()

    const loader = createThemeLoader(themesDir, { autoActivate: true, defaultTheme: 'default' })
    await loader.initialize()

    // Validate settings
    const defaultSettings = loader.getThemeDefaultSettings(name)

    // For now, just return success (actual storage would be in database)
    return NextResponse.json({
      success: true,
      settings,
      defaults: defaultSettings,
    })
  } catch (error) {
    console.error('Failed to update theme settings:', error)
    return NextResponse.json(
      { error: 'Failed to update theme settings' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params
    const loader = createThemeLoader(themesDir, { autoActivate: true, defaultTheme: 'default' })
    await loader.initialize()

    const defaultSettings = loader.getThemeDefaultSettings(name)

    return NextResponse.json({
      settings: defaultSettings,
    })
  } catch (error) {
    console.error('Failed to get theme settings:', error)
    return NextResponse.json(
      { error: 'Failed to get theme settings' },
      { status: 500 }
    )
  }
}
