'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { CodeBlock, InlineCode } from '@/components/code-block'
import { File, Download } from 'lucide-react'
import 'highlight.js/styles/github-dark.css'

interface MarkdownContentProps {
  content: string
}

// Extract text from react-markdown children
function getTextContent(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children
  }
  if (typeof children === 'number') {
    return String(children)
  }
  if (Array.isArray(children)) {
    return children.map(getTextContent).join('')
  }
  if (children && typeof children === 'object' && 'props' in children) {
    const element = children as React.ReactElement
    if (element.props && typeof element.props.children !== 'undefined') {
      return getTextContent(element.props.children)
    }
  }
  return ''
}

// 文件链接组件
function FileLink({ href, children }: { href: string; children: React.ReactNode }) {
  const childText = getTextContent(children)
  const filename = childText.split(' (')[0] // 移除文件大小部分

  // 判断是否为图片
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
  const isImage = imageExtensions.some(ext => href.toLowerCase().includes(ext))

  if (isImage) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        <img
          src={href}
          alt={typeof filename === 'string' ? filename : '图片'}
          className="rounded-lg max-w-full h-auto"
        />
      </a>
    )
  }

  // 文档/压缩文件：显示下载卡片
  return (
    <a
      href={href}
      download={typeof filename === 'string' ? filename : undefined}
      className="flex items-center gap-3 p-4 bg-muted rounded-lg hover:bg-accent transition-colors group no-underline"
    >
      <div className="flex-shrink-0">
        <File className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{filename}</p>
        {typeof childText === 'string' && childText.includes('(') && (
          <p className="text-sm text-muted-foreground">
            {childText.split('(').pop()?.replace(')', '')}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">
        <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </a>
  )
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose max-w-none dark:prose-invert prose-code:text-pink-500 dark:prose-code:text-pink-400 prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 prose-pre:rounded-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a({ node, inline, className, children, href, ...props }: any) {
            // 判断是否为文件链接
            const childText = getTextContent(children)
            const fileExtensions = [
              '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
              '.txt', '.md', '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2',
              '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'
            ]

            const isFileLink = fileExtensions.some(ext =>
              href?.toLowerCase().includes(ext)
            )

            if (isFileLink) {
              return <FileLink href={href}>{children}</FileLink>
            }

            // 普通链接
            return (
              <a
                href={href}
                className="text-primary hover:underline"
                {...props}
              >
                {children}
              </a>
            )
          },
          img({ node, src, alt, ...props }: any) {
            return (
              <img
                src={src}
                alt={alt}
                className="rounded-lg max-w-full h-auto"
                {...props}
              />
            )
          },
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            const codeText = getTextContent(children)

            if (!inline && codeText) {
              return (
                <CodeBlock
                  code={codeText}
                  language={language}
                />
              )
            }

            if (inline) {
              return <InlineCode>{children}</InlineCode>
            }

            return <InlineCode>{children}</InlineCode>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownContent
