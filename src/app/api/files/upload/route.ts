import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { fileRepository } from '@/db/repositories'
import { fileManager } from '@/storage/file-manager'
import { auth } from '@/auth'

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export async function POST(request: NextRequest) {
  await db.initialize()

  try {
    const session = await auth()
    const userId = session?.user?.id ? parseInt(session.user.id) : undefined

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // 验证文件类型
    const allowedTypes = [
      // 图片
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      // 办公文档
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/markdown',
      // 压缩文件
      'application/zip',
      'application/x-zip-compressed',
      'application/vnd.rar',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/x-gzip',
      'application/x-bzip2',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} is not allowed` },
        { status: 400 }
      )
    }

    // 上传文件（自动选择存储方式）
    const uploadedFile = await fileManager.upload(file, userId)

    // 保存到数据库
    const fileRecord = await fileRepository.create(uploadedFile, userId)

    return NextResponse.json({
      id: fileRecord.id,
      filename: fileRecord.filename,
      originalName: fileRecord.originalName,
      mimeType: fileRecord.mimeType,
      size: fileRecord.size,
      storageType: fileRecord.storageType,
      url: fileRecord.url,
      downloadUrl: `/api/files/${fileRecord.id}/download`,
    })
  } catch (error) {
    console.error('Failed to upload file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  await db.initialize()

  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const uploaderId = searchParams.get('uploaderId')

    let files
    if (uploaderId) {
      files = await fileRepository.findByUploader(parseInt(uploaderId), limit, (page - 1) * limit)
    } else {
      files = await fileRepository.findAll(limit, (page - 1) * limit)
    }

    return NextResponse.json({ files })
  } catch (error) {
    console.error('Failed to fetch files:', error)
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
  }
}
