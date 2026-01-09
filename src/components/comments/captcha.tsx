'use client'

import { useEffect, useRef } from 'react'
import { RefreshCw } from 'lucide-react'

interface CaptchaProps {
  code?: string
  onRefresh: () => void
  value: string
  onChange: (value: string) => void
  error?: string
}

export function Captcha({ code, onRefresh, value, onChange, error }: CaptchaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateCaptchaImage = (captchaCode: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 120
    canvas.height = 40

    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.font = '20px monospace'
    ctx.fillStyle = '#374151'

    for (let i = 0; i < captchaCode.length; i++) {
      const char = captchaCode[i]
      const x = 15 + i * 18
      const y = 28 + (Math.random() - 0.5) * 10
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((Math.random() - 0.5) * 0.3)
      ctx.fillText(char, 0, 0)
      ctx.restore()
    }

    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.3})`
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.stroke()
    }
  }

  useEffect(() => {
    if (code) {
      generateCaptchaImage(code)
    }
  }, [code])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="验证码"
          className={`w-32 px-3 py-2 border rounded-lg bg-background ${
            error ? 'border-red-500' : 'border-border'
          }`}
          maxLength={6}
        />
        <canvas
          ref={canvasRef}
          className="border border-border rounded bg-muted"
        />
        <button
          type="button"
          onClick={onRefresh}
          className="p-2 rounded-md hover:bg-accent transition"
          title="刷新验证码"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
