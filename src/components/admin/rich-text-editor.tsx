'use client'

import { useState } from 'react'
import { TiptapEditor } from './tiptap-editor'
import { SourceEditor } from './source-editor'
import { PenTool, Code, MonitorPlay } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

type EditorMode = 'visual' | 'source'

export function RichTextEditor({
  content,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const [mode, setMode] = useState<EditorMode>('visual')

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setMode('visual')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              mode === 'visual'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <PenTool className="w-4 h-4" />
            可视化编辑
          </button>
          <button
            onClick={() => setMode('source')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              mode === 'source'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Code className="w-4 h-4" />
            源码模式
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative min-h-[600px]">
        {mode === 'visual' ? (
          <TiptapEditor
            content={content}
            onChange={onChange}
            placeholder={placeholder}
            className="h-[600px]"
          />
        ) : (
          <SourceEditor
            content={content}
            onChange={onChange}
            className="h-[600px]"
          />
        )}
      </div>
    </div>
  )
}
