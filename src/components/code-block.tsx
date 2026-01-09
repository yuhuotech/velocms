'use client'

import { useState, useEffect, useRef } from 'react'
import { Copy, Check, FileCode } from 'lucide-react'
import hljs from 'highlight.js'

interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
}

export function CodeBlock({ code, language, showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [highlightedCode, setHighlightedCode] = useState('')
  const codeRef = useRef<HTMLElement>(null)
  const preRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    if (code) {
      try {
        const lang = language && hljs.getLanguage(language) ? language : 'plaintext'
        const result = hljs.highlight(code, { language: lang })
        setHighlightedCode(result.value)
      } catch (e) {
        setHighlightedCode(code.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
      }
    }
  }, [code, language])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const lines = code.split('\n')
  const languageLabel = language || 'text'

  return (
    <div className="relative group my-6 rounded-lg overflow-hidden bg-[#0d1117] shadow-lg border border-[#30363d] dark:border-[#484f58]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1c2128] border-b border-[#30363d]">
        <div className="flex items-center gap-2.5">
          <FileCode className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-300 font-mono">
            {languageLabel}
          </span>
        </div>

        <button
          onClick={copyToClipboard}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-all duration-200 ${
            copied
              ? 'bg-green-500/15 text-green-400 border border-green-500/30'
              : 'bg-[#2d333b] text-gray-400 hover:text-white hover:bg-[#3d444d] border border-[#444c56]'
          }`}
          title="复制代码"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span className="font-medium">已复制</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-medium">复制</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="relative">
        <pre className="p-5 overflow-x-auto text-sm leading-relaxed" style={{ padding: '1.25rem' }}>
          {showLineNumbers ? (
            <div className="flex">
              <div className="flex flex-col text-gray-600 select-none pr-4 text-right mr-4">
                {lines.map((_, i) => (
                  <span key={i} className="leading-6 font-mono text-xs">
                    {i + 1}
                  </span>
                ))}
              </div>
              <div className="flex-1">
                <code
                  ref={codeRef}
                  className="font-mono leading-6 whitespace-pre hljs"
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                />
              </div>
            </div>
          ) : (
            <code
              ref={codeRef}
              className="font-mono whitespace-pre hljs"
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          )}
        </pre>
      </div>
    </div>
  )
}

// Inline code component
export function InlineCode({ children }: { children: React.ReactNode }) {
  const text = typeof children === 'string' ? children : String(children)
  return (
    <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono text-pink-500 dark:text-pink-400">
      {text}
    </code>
  )
}

export default CodeBlock
