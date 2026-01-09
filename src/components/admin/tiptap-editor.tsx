'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import { useEffect, useState, useCallback } from 'react'
import { 
  Bold, Italic, Strikethrough, Code, 
  List, ListOrdered, Quote, 
  Heading1, Heading2, Heading3, 
  Link as LinkIcon, Image as ImageIcon, 
  Undo, Redo, X, Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  editable?: boolean
  placeholder?: string
  className?: string
}

export function TiptapEditor({
  content,
  onChange,
  editable = true,
  placeholder = '开始写作...',
  className,
}: TiptapEditorProps) {
  const [isUploading, setIsUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Markdown.configure({
        html: false, // 强制输出 Markdown
        transformPastedText: true,
        transformCopiedText: true,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
      Typography,
    ],
    content: content,
    editable: editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // 获取 Markdown 内容
      const markdown = (editor.storage as any).markdown.getMarkdown()
      onChange(markdown)
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-6',
          'prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight',
          'prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl',
          'prose-p:leading-7 prose-p:my-4',
          'prose-li:my-1',
          'prose-img:rounded-lg prose-img:shadow-md'
        ),
      },
    },
  })

  // 监听 content 变化（用于重置或外部更新）
  useEffect(() => {
    if (editor && content !== (editor.storage as any).markdown.getMarkdown()) {
      // 只有当内容确实不同的时候才更新，避免光标跳动
      // 注意：这里的比较可能不够精确，因为 markdown 生成可能会有微小差异
      // 更好的做法是只有在 isMounted 或特定重置信号时才强制 setContent
      // 这里为了简单，暂且信任 tiptap-markdown 的稳定性，或者我们可以只在初始化时设置
    }
  }, [content, editor])

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) return

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // update
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('图片 URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        editor.chain().focus().setImage({ 
          src: `/api/files/${data.id}/download`,
          alt: data.originalName
        }).run()
      } else {
        alert(data.error || '上传失败')
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('上传失败')
    } finally {
      setIsUploading(false)
      // 清空 input 以便下次选择同一文件
      e.target.value = ''
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden bg-background flex flex-col", className)}>
      {/* 工具栏 */}
      {editable && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="H1"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="H2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="H3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
          
          <div className="w-px h-5 bg-border mx-1" />
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strike"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Code"
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-5 bg-border mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-5 bg-border mx-1" />

          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            title="Link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <ToolbarButton
              onClick={() => {}}
              isActive={false}
              title="Image"
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
            </ToolbarButton>
          </div>

          <div className="flex-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </div>
      )}

      {/* 编辑区域 */}
      <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
    </div>
  )
}

function ToolbarButton({ 
  children, 
  onClick, 
  isActive = false, 
  disabled = false,
  title,
  className 
}: { 
  children: React.ReactNode
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title?: string
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-2 rounded-md transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20",
        isActive ? "bg-muted text-primary font-medium" : "text-muted-foreground",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  )
}
