'use client'

import { useState, useRef } from 'react'
import { Upload, X, File, Image, Loader2, Check } from 'lucide-react'

interface FileUploadProps {
  onFileUploaded: (file: UploadedFile) => void
  accept?: string
  maxSize?: number // MB
  maxSizeDisplay?: string
}

export interface UploadedFile {
  id: number
  filename: string
  originalName: string
  mimeType: string
  size: number
  storageType: 'local' | 'vercel_blob'
  url?: string
  downloadUrl: string
}

export function FileUpload({
  onFileUploaded,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.zip,.rar,.7z,.tar,.gz,.bz2',
  maxSize = 100,
  maxSizeDisplay = '100MB',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setSuccess(false)

    // 验证文件大小
    if (file.size > maxSize * 1024 * 1024) {
      setError(`文件大小超过限制 (${maxSizeDisplay})`)
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // 模拟进度
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '上传失败')
      }

      setProgress(100)
      setSuccess(true)
      onFileUploaded(data)

      // 重置表单
      setTimeout(() => {
        setSuccess(false)
        setProgress(0)
        if (inputRef.current) {
          inputRef.current.value = ''
        }
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
      setProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const isImage = (mimeType: string): boolean => {
    return mimeType.startsWith('image/')
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer
            transition-colors
            ${uploading
              ? 'bg-muted cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:opacity-90'
            }
          `}
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              上传中 {progress}%
            </>
          ) : success ? (
            <>
              <Check className="w-4 h-4" />
              上传成功
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              选择文件
            </>
          )}
        </label>

        {error && (
          <button
            type="button"
            onClick={() => setError('')}
            className="p-1 text-destructive hover:bg-destructive/10 rounded"
            title="清除错误"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {accept.includes('image') && <Image className="w-4 h-4" />}
        <File className="w-4 h-4" />
        <span>支持格式：{accept}</span>
        <span>•</span>
        <span>最大 {maxSizeDisplay}</span>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          <X className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  )
}
