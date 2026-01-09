'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Edit, Eye, Columns, EyeOff,
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote,
  Link, Image, Code, Maximize2, Minimize2,
  AlignLeft, AlignCenter, AlignRight,
  Palette, Type, File, Upload
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { cn } from '@/lib/utils'
import 'highlight.js/styles/github-dark.css'

type ViewMode = 'visual' | 'source' | 'preview'

export default function MarkdownEditor({
  content,
  onChange,
  editable = true,
  placeholder = '开始写作...',
  className,
}: {
  content: string
  onChange: (content: string) => void
  editable?: boolean
  placeholder?: string
  className?: string
}) {
  const [viewMode, setViewMode] = useState<ViewMode>('visual')
  const [showPreview, setShowPreview] = useState(true)
  const [sourceContent, setSourceContent] = useState(content)
  const [visualContent, setVisualContent] = useState(content)

  // 同步外部 content 变化
  useEffect(() => {
    setSourceContent(content)
    setVisualContent(content)
  }, [content])

  // 处理源码内容变化
  const handleSourceChange = (value: string) => {
    setSourceContent(value)
    onChange(value)
  }

  // 处理可视化编辑器内容变化
  const handleVisualChange = (value: string) => {
    setVisualContent(value)
    onChange(value)
  }

  // 切换视图模式时同步内容
  const handleViewModeChange = (mode: ViewMode) => {
    if (mode === 'source' && viewMode === 'visual') {
      // 从可视化切换到源码时，使用可视化内容
      setSourceContent(visualContent)
      onChange(visualContent)
    } else if (mode === 'visual' && viewMode === 'source') {
      // 从源码切换到可视化时，使用源码内容
      setVisualContent(sourceContent)
      onChange(sourceContent)
    }
    setViewMode(mode)
  }

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden flex flex-col', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-border bg-muted/50 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewModeChange('visual')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition',
              viewMode === 'visual' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            )}
            title="可视化编辑（所见即所得）"
          >
            <Eye className="w-4 h-4" />
            可视化
          </button>
          <button
            onClick={() => handleViewModeChange('source')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition',
              viewMode === 'source' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            )}
            title="源码编辑（Markdown）"
          >
            <Edit className="w-4 h-4" />
            源码
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition',
              viewMode === 'preview' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            )}
            title="预览（只读）"
          >
            <EyeOff className="w-4 h-4" />
            预览
          </button>
        </div>

        {/* 即时预览开关（仅在源码模式显示） */}
        {viewMode === 'source' && (
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition',
              showPreview ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            )}
            title="即时预览"
          >
            <Columns className="w-4 h-4" />
            即时预览: {showPreview ? '开' : '关'}
          </button>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1 min-h-[500px] flex">
        {/* 可视化编辑模式 */}
        {viewMode === 'visual' && (
          <div className="w-full h-full min-h-[500px] flex flex-col">
            {editable ? (
              <>
                {/* 格式工具栏 */}
                <VisualToolbar onContentChange={handleVisualChange} />
                <ContentEditable
                  content={visualContent}
                  onChange={handleVisualChange}
                  placeholder={placeholder}
                />
              </>
            ) : (
              <div className="h-full p-4 prose prose-sm sm:prose lg:prose max-w-none dark:prose-invert overflow-auto">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {visualContent || placeholder}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* 源码编辑模式 */}
        {viewMode === 'source' && (
          <>
            {/* 源码编辑区 */}
            <div className={cn('border-r border-border', showPreview ? 'w-1/2' : 'w-full')}>
              <textarea
                value={sourceContent}
                onChange={(e) => handleSourceChange(e.target.value)}
                placeholder={placeholder}
                disabled={!editable}
                className="w-full h-full min-h-[500px] p-4 font-mono text-sm focus:outline-none resize-none"
              />
            </div>

            {/* 即时预览区（可关闭） */}
            {showPreview && (
              <div className="w-1/2 overflow-auto">
                <div className="h-full p-4 prose prose-sm sm:prose lg:prose max-w-none dark:prose-invert">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {sourceContent || placeholder}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </>
        )}

        {/* 预览模式 */}
        {viewMode === 'preview' && (
          <div className="w-full h-full min-h-[500px] overflow-auto">
            <div className="h-full p-4 prose prose-sm sm:prose lg:prose max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {content || placeholder}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Markdown 帮助提示 */}
      <div className="border-t border-border p-2 bg-muted/30">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Markdown 语法：</span>
          标题（#）、粗体（**text**）、斜体（*text*）、代码（\`code\`）、链接（[text](url)）、列表（- 或 1.）
        </div>
      </div>
    </div>
  )
}

// 可视化编辑器组件（简化版，使用 contentEditable）
function ContentEditable({
  content,
  onChange,
  placeholder,
}: {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}) {
  const [html, setHtml] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)

  // Markdown 转 HTML（简化版）
  useEffect(() => {
    const htmlContent = markdownToHtml(content)
    setHtml(htmlContent)
  }, [content])

  // 处理内容变化
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = htmlToMarkdown(e.currentTarget.innerHTML)
    onChange(newContent)
  }

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      dangerouslySetInnerHTML={{ __html: html || `<p class="text-muted-foreground">${placeholder}</p>` }}
      className="w-full h-full min-h-[500px] p-4 prose prose-sm sm:prose lg:prose max-w-none dark:prose-invert focus:outline-none flex-1"
    />
  )
}

// 格式工具栏组件
function VisualToolbar({ onContentChange }: { onContentChange: (content: string) => void }) {
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [uploading, setUploading] = useState(false)

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    // 触发内容变化
    const editor = document.querySelector('[contenteditable="true"]') as HTMLDivElement
    if (editor) {
      const newContent = htmlToMarkdown(editor.innerHTML)
      onContentChange(newContent)
    }
  }

  const insertElement = (html: string) => {
    document.execCommand('insertHTML', false, html)
    const editor = document.querySelector('[contenteditable="true"]') as HTMLDivElement
    if (editor) {
      const newContent = htmlToMarkdown(editor.innerHTML)
      onContentChange(newContent)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        // 判断是否为图片
        const isImage = file.type.startsWith('image/')

        if (isImage) {
          // 图片：插入图片 Markdown
          insertElement(`<img src="/api/files/${data.id}/download" alt="${data.originalName}" class="rounded-lg" />`)
        } else {
          // 文档：插入文件下载链接
          const fileSize = (data.size / 1024).toFixed(1)
          insertElement(
            `<a href="/api/files/${data.id}/download" download="${encodeURIComponent(data.originalName)}" class="flex items-center gap-2 p-3 bg-muted rounded-lg hover:bg-accent transition">
              <span>${data.originalName}</span>
              <span class="text-sm text-muted-foreground">(${fileSize} KB)</span>
            </a>`
          )
        }

        setShowFileUpload(false)
      } else {
        alert(data.error || '上传失败')
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('上传失败')
    } finally {
      setUploading(false)
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  return (
    <div className="border-b border-border p-2 bg-muted/50 flex flex-wrap gap-1 items-center">
      {/* 标题 */}
      <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
        <ToolbarButton onClick={() => formatText('formatBlock', 'H1')} title="标题 1">
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatText('formatBlock', 'H2')} title="标题 2">
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatText('formatBlock', 'H3')} title="标题 3">
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* 文本格式 */}
      <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
        <ToolbarButton onClick={() => formatText('bold')} title="粗体 (Ctrl+B)">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatText('italic')} title="斜体 (Ctrl+I)">
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatText('underline')} title="下划线 (Ctrl+U)">
          <Underline className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatText('strikeThrough')} title="删除线">
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* 对齐方式 */}
      <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
        <ToolbarButton onClick={() => formatText('justifyLeft')} title="左对齐">
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatText('justifyCenter')} title="居中">
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatText('justifyRight')} title="右对齐">
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* 列表 */}
      <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
        <ToolbarButton onClick={() => formatText('insertUnorderedList')} title="无序列表">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatText('insertOrderedList')} title="有序列表">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* 其他元素 */}
      <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
        <ToolbarButton onClick={() => formatText('formatBlock', 'blockquote')} title="引用">
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => formatText('insertHorizontalRule')} title="分隔线">
          <Maximize2 className="w-4 h-4 transform rotate-90" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => insertElement('<code>code</code>')}
          title="代码"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* 链接和图片 */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => {
            const url = prompt('请输入链接 URL:')
            if (url) {
              const selection = window.getSelection()
              const text = selection?.toString() || '链接文本'
              insertElement(`<a href="${url}">${text}</a>`)
            }
          }}
          title="插入链接"
        >
          <Link className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const url = prompt('请输入图片 URL:')
            if (url) {
              const alt = prompt('请输入图片描述:') || ''
              insertElement(`<img src="${url}" alt="${alt}" class="rounded-lg" />`)
            }
          }}
          title="插入图片 URL"
        >
          <Image className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setShowFileUpload(!showFileUpload)}
          title="上传文件"
          active={showFileUpload}
        >
          <Upload className="w-4 h-4" />
        </ToolbarButton>

        {/* 文件上传输入 */}
        {showFileUpload && (
          <div className="relative ml-2">
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.zip,.rar,.7z,.tar,.gz,.bz2"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm">
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  上传中...
                </>
              ) : (
                <>
                  <File className="w-4 h-4" />
                  选择文件
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 工具栏按钮组件
function ToolbarButton({
  onClick,
  title,
  children,
  active = false,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded hover:bg-accent transition flex items-center justify-center',
        active && 'bg-accent text-primary'
      )}
    >
      {children}
    </button>
  )
}

// 简化的 Markdown 转 HTML
function markdownToHtml(markdown: string): string {
  if (!markdown) return ''

  return markdown
    // 标题
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    // 粗体和斜体
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 代码
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // 图片
    .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg" />')
    // 列表
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
    // 引用
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    // 分隔线
    .replace(/^---$/gim, '<hr />')
    // 段落
    .split('\n\n')
    .map(para => para.replace(/\n/g, '<br />'))
    .filter(para => para.trim())
    .map(para => {
      if (para.startsWith('<h') || para.startsWith('<li') || para.startsWith('<blockquote') || para.startsWith('<pre') || para.startsWith('<hr') || para.startsWith('<ul') || para.startsWith('<ol')) {
        return para
      }
      return `<p>${para}</p>`
    })
    .join('')
}

// 简化的 HTML 转 Markdown
function htmlToMarkdown(html: string): string {
  if (!html) return ''

  return html
    // 标题
    .replace(/<h1>(.*?)<\/h1>/gim, '# $1\n\n')
    .replace(/<h2>(.*?)<\/h2>/gim, '## $1\n\n')
    .replace(/<h3>(.*?)<\/h3>/gim, '### $1\n\n')
    .replace(/<h4>(.*?)<\/h4>/gim, '#### $1\n\n')
    // 粗体和斜体
    .replace(/<strong>(.*?)<\/strong>/gim, '**$1**')
    .replace(/<b>(.*?)<\/b>/gim, '**$1**')
    .replace(/<em>(.*?)<\/em>/gim, '*$1*')
    .replace(/<i>(.*?)<\/i>/gim, '*$1*')
    // 代码
    .replace(/<code>(.*?)<\/code>/gim, '`$1`')
    .replace(/<pre>(.*?)<\/pre>/gim, '```\n$1\n```')
    // 链接
    .replace(/<a href="(.*?)">(.*?)<\/a>/gim, '[$2]($1)')
    // 图片
    .replace(/<img src="(.*?)" alt="(.*?)" \/>/gim, '![$2]($1)')
    // 列表
    .replace(/<li>(.*?)<\/li>/gim, '- $1\n')
    // 引用
    .replace(/<blockquote>(.*?)<\/blockquote>/gim, '> $1\n\n')
    // 分隔线
    .replace(/<hr \/>/gim, '---\n\n')
    // 段落和换行
    .replace(/<p>(.*?)<\/p>/gim, '$1\n\n')
    .replace(/<br \/>/gim, '\n')
    .replace(/<br>/gim, '\n')
    // 清理空白
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
