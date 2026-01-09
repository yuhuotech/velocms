import { eq, desc } from 'drizzle-orm'
import { db } from '../client'
import { files } from '../drizzle/schema'
import { fileManager, type UploadedFile } from '@velocms/storage/file-manager'

export const fileRepository = {
  async create(file: UploadedFile, uploadedBy?: number): Promise<typeof files.$inferSelect> {
    const adapter = db.getAdapter()
    const url = fileManager.getUrl(file.storagePath)

    const result = await adapter.insert(files).values({
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      storageType: file.storageType,
      storagePath: file.storagePath,
      url,
      uploadedBy: uploadedBy || null,
    }).returning()

    return result[0]
  },

  async findById(id: number): Promise<typeof files.$inferSelect | null> {
    const adapter = db.getAdapter()
    const result = await adapter.select().from(files).where(eq(files.id, id))
    return result[0] || null
  },

  async findByUploader(
    uploaderId: number,
    limit = 20,
    offset = 0
  ): Promise<typeof files.$inferSelect[]> {
    const adapter = db.getAdapter()
    const result = await adapter
      .select()
      .from(files)
      .where(eq(files.uploadedBy, uploaderId))
      .orderBy(desc(files.createdAt))
      .limit(limit)
      .offset(offset)
    return result
  },

  async findAll(limit = 50, offset = 0): Promise<typeof files.$inferSelect[]> {
    const adapter = db.getAdapter()
    const result = await adapter
      .select()
      .from(files)
      .orderBy(desc(files.createdAt))
      .limit(limit)
      .offset(offset)
    return result
  },

  async delete(id: number): Promise<boolean> {
    const adapter = db.getAdapter()

    const file = await this.findById(id)
    if (!file) {
      return false
    }

    // 删除物理文件
    await fileManager.delete(file.storagePath)

    // 删除数据库记录
    const result = await adapter.delete(files).where(eq(files.id, id))
    return (result as any).changes > 0
  },

  async getDownloadUrl(id: number): Promise<string | null> {
    const file = await this.findById(id)
    if (!file) {
      return null
    }

    // 如果是 Vercel Blob，直接返回 URL
    if (file.storageType === 'vercel_blob' && file.url) {
      return file.url
    }

    // 本地存储，通过 API 下载
    return `/api/files/${id}/download`
  },
}
