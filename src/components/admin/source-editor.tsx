'use client'

import { useState, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { Columns, PanelLeft } from 'lucide-react'

interface SourceEditorProps {
  content: string
  onChange: (content: string) => void
  className?: string
}

export function SourceEditor({
  content,
  onChange,
  className,
}: SourceEditorProps) {
  const [showPreview, setShowPreview] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // 处理同步滚动
  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    if (!showPreview || !textareaRef.current || !previewRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight)
    
    const previewElement = previewRef.current
    const targetScrollTop = scrollPercentage * (previewElement.scrollHeight - previewElement.clientHeight)
    
    previewElement.scrollTo({
      top: targetScrollTop,
      behavior: 'auto' // 使用 auto 保证实时性，不会有延迟感
    })
  }, [showPreview])

  return (
    <div className={cn("flex flex-col border border-border rounded-lg overflow-hidden bg-background h-[600px]", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="text-sm font-medium text-muted-foreground">
          Markdown 源码模式
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title={showPreview ? "关闭预览" : "开启预览"}
        >
          {showPreview ? (
            <>
              <PanelLeft className="w-4 h-4" />
              <span>关闭预览</span>
            </>
          ) : (
            <>
              <Columns className="w-4 h-4" />
              <span>分栏预览</span>
            </>
          )}
        </button>
      </div>

      {/* Editor & Preview Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Textarea */}
        <div className={cn(
          "h-full overflow-hidden transition-all duration-300",
          showPreview ? "w-1/2 border-r border-border" : "w-full"
        )}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            className="w-full h-full p-4 resize-none focus:outline-none bg-background font-mono text-sm leading-6"
            placeholder="在此输入 Markdown 源码..."
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div 
            ref={previewRef}
            className="w-1/2 h-full overflow-y-auto bg-muted/10 p-6 prose prose-neutral dark:prose-invert max-w-none scroll-smooth"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
