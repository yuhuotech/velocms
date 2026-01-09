import { LocalFileSystemStorage, VercelBlobStorage, type StorageAdapter, type UploadedFile } from './storage-adapter'

export type { UploadedFile }

export class FileManager {
  private storage: StorageAdapter
  private env: 'local' | 'vercel'

  constructor() {
    this.env = this.detectEnvironment()
    this.storage = this.createStorageAdapter()
  }

  private detectEnvironment(): 'local' | 'vercel' {
    const dbType = process.env.DATABASE_TYPE || 'sqlite'
    return dbType === 'vercel' ? 'vercel' : 'local'
  }

  private createStorageAdapter(): StorageAdapter {
    if (this.env === 'vercel') {
      console.log('[FileManager] Using Vercel Blob storage')
      return new VercelBlobStorage()
    } else {
      console.log('[FileManager] Using local file system storage')
      return new LocalFileSystemStorage()
    }
  }

  async upload(file: File, userId?: number): Promise<UploadedFile> {
    console.log(`[FileManager] Uploading file: ${file.name} (${file.size} bytes)`)
    return await this.storage.upload(file, userId)
  }

  async delete(storagePath: string): Promise<void> {
    console.log(`[FileManager] Deleting file: ${storagePath}`)
    await this.storage.delete(storagePath)
  }

  getUrl(storagePath: string): string {
    return this.storage.getUrl(storagePath)
  }

  getEnvironment(): 'local' | 'vercel' {
    return this.env
  }
}

// 单例实例
export const fileManager = new FileManager()
