import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { fileRepository } from '@/db/repositories'
import fs from 'fs/promises'

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

    // 图片使用 inline 显示，文档使用 attachment 下载
    const isImage = file.mimeType.startsWith('image/')
    const disposition = isImage ? 'inline' : 'attachment'
    headers.set('Content-Disposition', `${disposition}; filename="${encodeURIComponent(file.originalName)}"`)

    return new NextResponse(fileBuffer, { headers })
  } catch (error) {
    console.error('Failed to download file:', error)
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
  }
}
