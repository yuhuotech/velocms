# 文件存储功能文档

## 🎯 功能概述

VeloCMS 提供了跨环境的文件存储功能，自动根据部署环境选择最优存储方案：

| 部署环境 | 存储方案 | 数据库 | 特点 |
|---------|---------|--------|------|
| **本地开发** | 本地文件系统 | 只存元数据 | 开箱即用，无需配置 |
| **Vercel** | Vercel Blob | 只存元数据 | 高性能，自动扩缩容 |

---

## 🗄️ 数据库结构

### `files` 表

```sql
CREATE TABLE files (
  id INTEGER PRIMARY KEY,
  filename TEXT NOT NULL,           -- 存储文件名
  original_name TEXT NOT NULL,     -- 原始文件名
  mime_type TEXT NOT NULL,         -- MIME 类型
  size INTEGER NOT NULL,            -- 文件大小（字节）
  storage_type TEXT DEFAULT 'local', -- 'local' | 'vercel_blob'
  storage_path TEXT NOT NULL,      -- 存储路径/URL
  url TEXT,                        -- 外部存储 URL
  uploaded_by INTEGER,             -- 上传者 ID
  created_at INTEGER NOT NULL       -- 创建时间
);
```

**注意：** 数据库只存储文件元数据，不存储文件内容（BLOB）。

---

## 🚀 API 接口

### 1. 上传文件

```typescript
POST /api/files/upload

Content-Type: multipart/form-data

Request Body:
- file: File (必填)

Response:
{
  "id": 123,
  "filename": "1704782400000-abc123.png",
  "originalName": "screenshot.png",
  "mimeType": "image/png",
  "size": 1024000,
  "storageType": "local",  // 或 "vercel_blob"
  "url": "https://...",     // Vercel Blob URL
  "downloadUrl": "/api/files/123/download"
}
```

**文件类型限制：**
- 图片：`image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`
- 文档：`application/pdf`, `text/plain`, `text/markdown`
- 压缩：`application/zip`, `application/vnd.rar`

**文件大小限制：** 100MB

---

### 2. 下载文件

```typescript
GET /api/files/{id}/download

Response:
- Headers: Content-Type, Content-Disposition
- Body: 文件二进制数据（本地）或重定向（Vercel Blob）
```

---

### 3. 删除文件

```typescript
DELETE /api/files/{id}

Response:
{
  "success": true
}
```

**权限要求：** 需要管理员权限

---

### 4. 获取文件列表

```typescript
GET /api/files/upload?page=1&limit=20&uploaderId=123

Response:
{
  "files": [
    {
      "id": 123,
      "filename": "...",
      "originalName": "...",
      "mimeType": "...",
      "size": 1024000,
      "storageType": "local",
      "url": "...",
      "uploadedBy": 123,
      "createdAt": "2024-01-08T12:00:00.000Z"
    }
  ]
}
```

---

## 🎨 前端组件

### `FileUpload` 组件

```tsx
import { FileUpload } from '@/components/files/file-upload'

export function MyComponent() {
  const handleFileUploaded = (file: UploadedFile) => {
    console.log('文件上传成功:', file)
  }

  return (
    <FileUpload
      onFileUploaded={handleFileUploaded}
      accept="image/*,.pdf,.doc,.docx"
      maxSize={10}
      maxSizeDisplay="10MB"
    />
  )
}
```

**Props:**
- `onFileUploaded`: 上传成功回调
- `accept`: 接受的文件类型（默认：`image/*,.pdf,.doc,.docx,.txt,.md,.zip`）
- `maxSize`: 最大文件大小（MB，默认：100）
- `maxSizeDisplay`: 显示的最大文件大小（默认：`100MB`）

---

## 🌍 环境配置

### 本地开发

```bash
# .env
DATABASE_TYPE=sqlite

# 文件会自动存储到：./data/uploads/
```

**特点：**
- ✅ 开箱即用，无需配置
- ✅ 开发和测试方便
- ⚠️ 不适合生产环境（多实例问题）

---

### Vercel 部署

```bash
# .env (Vercel 自动注入)
DATABASE_TYPE=vercel

# 需要安装 Vercel Blob
npm install @vercel/blob
```

**配置步骤：**
1. 在 Vercel 项目设置中添加 "Blob Storage"
2. 安装依赖：`npm install @vercel/blob`
3. 部署时自动切换到 Vercel Blob

**特点：**
- ✅ 高性能，CDN 加速
- ✅ 自动扩缩容
- ✅ 持久化存储
- ✅ 免费额度充足（100GB/月）

---

## 🔄 存储适配器

### 本地文件系统存储 (`LocalFileSystemStorage`)

```typescript
class LocalFileSystemStorage implements StorageAdapter {
  async upload(file: File, userId?: number): Promise<UploadedFile> {
    // 文件保存到 ./data/uploads/
    // 生成唯一文件名：timestamp-random.ext
  }

  async delete(storagePath: string): Promise<void> {
    // 删除文件系统中的文件
  }

  getUrl(storagePath: string): string {
    // 返回下载 URL：/api/files/download/{filename}
  }
}
```

---

### Vercel Blob 存储 (`VercelBlobStorage`)

```typescript
class VercelBlobStorage implements StorageAdapter {
  async upload(file: File, userId?: number): Promise<UploadedFile> {
    // 上传到 Vercel Blob
    const blob = await put(filename, file, { access: 'public' })
    return {
      url: blob.url,
      storagePath: blob.pathname
    }
  }

  async delete(storagePath: string): Promise<void> {
    // 从 Vercel Blob 删除
    await del(storagePath)
  }

  getUrl(storagePath: string): string {
    // 直接返回 Vercel Blob URL
    return storagePath
  }
}
```

---

## 🎯 自动切换逻辑

```typescript
// packages/storage/file-manager.ts

class FileManager {
  constructor() {
    const env = process.env.DATABASE_TYPE || 'sqlite'

    if (env === 'vercel') {
      this.storage = new VercelBlobStorage()
      console.log('[FileManager] Using Vercel Blob storage')
    } else {
      this.storage = new LocalFileSystemStorage()
      console.log('[FileManager] Using local file system storage')
    }
  }
}
```

---

## 📝 使用示例

### 示例1：上传图片到文章

```tsx
import { FileUpload } from '@/components/files/file-upload'
import { useState } from 'react'

export function PostEditor() {
  const [featuredImage, setFeaturedImage] = useState<UploadedFile | null>(null)

  return (
    <div>
      <h2>上传封面图</h2>
      <FileUpload
        onFileUploaded={setFeaturedImage}
        accept="image/*"
        maxSize={5}
        maxSizeDisplay="5MB"
      />

      {featuredImage && (
        <div>
          <img src={featuredImage.downloadUrl} alt="封面图" />
          <p>文件名：{featuredImage.originalName}</p>
        </div>
      )}
    </div>
  )
}
```

---

### 示例2：Markdown 编辑器插入图片

```tsx
import { FileUpload } from '@/components/files/file-upload'

export function MarkdownEditor() {
  const handleImageUploaded = (file: UploadedFile) => {
    const markdown = `
![${file.originalName}](${file.downloadUrl})
    `
    // 插入到 Markdown 编辑器
    insertMarkdown(markdown)
  }

  return (
    <div>
      <button onClick={() => document.getElementById('image-upload')?.click()}>
        插入图片
      </button>
      <FileUpload
        id="image-upload"
        onFileUploaded={handleImageUploaded}
        accept="image/*"
        maxSize={10}
        maxSizeDisplay="10MB"
      />
    </div>
  )
}
```

---

### 示例3：文件下载列表

```tsx
import { useState, useEffect } from 'react'

export function FileList() {
  const [files, setFiles] = useState<UploadedFile[]>([])

  useEffect(() => {
    async function fetchFiles() {
      const response = await fetch('/api/files/upload')
      const data = await response.json()
      setFiles(data.files)
    }
    fetchFiles()
  }, [])

  return (
    <ul>
      {files.map((file) => (
        <li key={file.id}>
          <a href={file.downloadUrl} download={file.originalName}>
            {file.originalName}
          </a>
          <span> ({(file.size / 1024).toFixed(1)} KB)</span>
        </li>
      ))}
    </ul>
  )
}
```

---

## 🔧 故障排查

### 问题1：上传失败

**本地环境：**
```bash
# 检查上传目录
ls -la ./data/uploads/

# 创建目录
mkdir -p ./data/uploads/
```

**Vercel 环境：**
- 检查是否安装了 `@vercel/blob`
- 检查 Vercel 项目中是否启用了 Blob Storage

---

### 问题2：下载失败

**本地环境：**
- 检查文件路径是否正确
- 检查文件权限

**Vercel 环境：**
- 检查 Blob URL 是否有效
- 检查 Blob 是否存在

---

### 问题3：文件类型不支持

修改 `/api/files/upload` 中的 `allowedTypes`：

```typescript
const allowedTypes = [
  // 添加更多类型
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
```

---

## 📚 相关资源

- [Vercel Blob 文档](https://vercel.com/docs/storage/vercel-blob)
- [文件存储示例页面](http://localhost:3002/files)
- [文件管理组件](/src/components/files/file-upload.tsx)

---

## ✅ 总结

| 功能 | 状态 |
|------|------|
| **本地文件系统存储** | ✅ 完成 |
| **Vercel Blob 存储** | ✅ 完成 |
| **自动环境切换** | ✅ 完成 |
| **上传 API** | ✅ 完成 |
| **下载 API** | ✅ 完成 |
| **删除 API** | ✅ 完成 |
| **前端组件** | ✅ 完成 |
| **数据库 Schema** | ✅ 完成 |

**VeloCMS 文件存储功能已完美支持本地和 Vercel 部署！**
