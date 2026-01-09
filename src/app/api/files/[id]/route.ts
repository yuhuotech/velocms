import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { fileRepository } from '@/db/repositories'
import fs from 'fs/promises'
import { auth } from '@/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await db.initialize()
  const { id } = await params

  try {
    const file = await fileRepository.findById(parseInt(id))

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Vercel Blob - 重定向到存储 URL
    if (file.storageType === 'vercel_blob' && file.url) {
      return NextResponse.redirect(file.url)
    }

    // 本地存储 - 读取文件并返回
    const filepath = file.storagePath
    const fileBuffer = await fs.readFile(filepath)

    // 设置响应头
    const headers = new Headers()
    headers.set('Content-Type', file.mimeType)
    headers.set('Content-Length', fileBuffer.length.toString())
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`)

    return new NextResponse(fileBuffer, { headers })
  } catch (error) {
    console.error('Failed to download file:', error)
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await db.initialize()
  const { id } = await params

  const session = await auth()

  // 检查权限（可选：只允许上传者或管理员删除）
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const success = await fileRepository.delete(parseInt(id))

    if (!success) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete file:', error)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}
