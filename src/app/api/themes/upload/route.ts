import { NextResponse } from 'next/server'
import path from 'path'
import * as fs from 'fs/promises'
import { createThemeLoader, validateTheme } from '@/lib/theme-system'

const themesDir = path.join(process.cwd(), 'themes')

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('theme') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No theme file provided' },
        { status: 400 }
      )
    }

    // Check if it's a zip file
    if (!file.name.endsWith('.zip')) {
      return NextResponse.json(
        { error: 'Theme must be a zip file' },
        { status: 400 }
      )
    }

    // Create temp directory
    const tempDir = path.join(themesDir, '_temp')
    await fs.mkdir(tempDir, { recursive: true })

    // Save and extract zip (simplified - in production use proper zip extraction)
    const tempFile = path.join(tempDir, file.name)
    const arrayBuffer = await file.arrayBuffer()
    await fs.writeFile(tempFile, Buffer.from(arrayBuffer))

    // For now, just validate the extraction (actual zip extraction would use adm-zip or similar)
    const validation = await validateTheme(tempDir)

    // Clean up temp file
    await fs.unlink(tempFile)

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid theme', validation },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Theme uploaded successfully',
    })
  } catch (error) {
    console.error('Failed to upload theme:', error)
    return NextResponse.json(
      { error: 'Failed to upload theme' },
      { status: 500 }
    )
  }
}
