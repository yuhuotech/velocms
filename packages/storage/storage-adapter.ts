import fs from 'fs/promises'
import path from 'path'
import { put, del } from '@vercel/blob'

export interface StorageAdapter {
  upload(file: File, userId?: number): Promise<UploadedFile>
  delete(storagePath: string): Promise<void>
  getUrl(storagePath: string): string
}

export interface UploadedFile {
  filename: string
  originalName: string
  mimeType: string
  size: number
  storageType: 'local' | 'vercel_blob'
  storagePath: string
  url?: string
}

// 本地文件系统存储
export class LocalFileSystemStorage implements StorageAdapter {
  private uploadDir: string

  constructor(uploadDir: string = './data/uploads') {
    this.uploadDir = uploadDir
    this.ensureUploadDir()
  }

  private async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true })
    } catch (error) {
      console.error('Failed to create upload directory:', error)
    }
  }

  async upload(file: File, userId?: number): Promise<UploadedFile> {
    await this.ensureUploadDir()

    const filename = this.generateFilename(file.name)
    const filepath = path.join(this.uploadDir, filename)

    // 将 File 转换为 Buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filepath, buffer)

    return {
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      storageType: 'local',
      storagePath: filepath,
    }
  }

  async delete(storagePath: string): Promise<void> {
    try {
      await fs.unlink(storagePath)
    } catch (error) {
      console.error('Failed to delete file:', error)
    }
  }

  getUrl(storagePath: string): string {
    const filename = path.basename(storagePath)
    return `/api/files/download/${filename}`
  }

  private generateFilename(originalName: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const ext = path.extname(originalName)
    return `${timestamp}-${random}${ext}`
  }
}

// Vercel Blob 存储
export class VercelBlobStorage implements StorageAdapter {
  async upload(file: File, userId?: number): Promise<UploadedFile> {
    const filename = this.generateFilename(file.name)
    const blob = await put(filename, file, {
      access: 'public',
    })

    return {
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      storageType: 'vercel_blob',
      storagePath: blob.pathname,
      url: blob.url,
    }
  }

  async delete(storagePath: string): Promise<void> {
    try {
      await del(storagePath)
    } catch (error) {
      console.error('Failed to delete blob:', error)
    }
  }

  getUrl(storagePath: string): string {
    return storagePath // Vercel Blob URL
  }

  private generateFilename(originalName: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const ext = path.extname(originalName)
    const nameWithoutExt = path.basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
    return `${timestamp}-${random}-${nameWithoutExt}${ext}`
  }
}
