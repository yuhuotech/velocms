'use client'

import { useState } from 'react'
import { FileUpload, type UploadedFile } from '@/components/files/file-upload'
import { File, Download, Trash2 } from 'lucide-react'

export default function FilesPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])

  const handleFileUploaded = (file: UploadedFile) => {
    setFiles((prev) => [...prev, file])
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/files/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== id))
      } else {
        alert('删除失败')
      }
    } catch (error) {
      console.error('Failed to delete file:', error)
      alert('删除失败')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">文件管理</h1>

      <div className="bg-card rounded-lg border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">上传文件</h2>
        <FileUpload onFileUploaded={handleFileUploaded} />
      </div>

      {files.length > 0 && (
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">已上传文件</h2>
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <File className="w-8 h-8 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.originalName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)} • {file.storageType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={file.downloadUrl}
                    download={file.originalName}
                    className="p-2 rounded hover:bg-accent transition"
                    title="下载"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-2 rounded hover:bg-destructive/10 text-destructive transition"
                    title="删除"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
