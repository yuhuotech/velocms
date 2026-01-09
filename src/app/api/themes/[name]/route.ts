import { NextResponse } from 'next/server'
import path from 'path'
import { createThemeLoader } from '@/lib/theme-system'

const themesDir = path.join(process.cwd(), 'themes')

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params
    const loader = createThemeLoader(themesDir, { autoActivate: true, defaultTheme: 'default' })
    await loader.initialize()

    const theme = loader.getTheme(name)

    if (!theme) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(theme)
  } catch (error) {
    console.error('Failed to get theme:', error)
    return NextResponse.json(
      { error: 'Failed to get theme' },
      { status: 500 }
    )
  }
}
