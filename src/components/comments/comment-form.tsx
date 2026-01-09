'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Captcha } from './captcha'
import { MessageSquare, Reply } from 'lucide-react'
import type { Dictionary } from '@/lib/i18n'

interface ReplyTo {
  id: number
  authorName: string
  content: string
}

interface CommentFormProps {
  postId: number
  parentId?: number
  replyTo?: ReplyTo
  onSuccess?: () => void
  onCancelReply?: () => void
  dict: Dictionary
}

export function CommentForm({
  postId,
  parentId,
  replyTo,
  onSuccess,
  onCancelReply,
  dict,
}: CommentFormProps) {
  const router = useRouter()
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [content, setContent] = useState('')
  const [captchaId, setCaptchaId] = useState<number>(0)
  const [captchaCode, setCaptchaCode] = useState('')
  const [captchaDisplayCode, setCaptchaDisplayCode] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [captchaError, setCaptchaError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleCaptchaRefresh = useCallback(() => {
    fetch('/api/comments/captcha', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        setCaptchaId(data.id)
        setCaptchaCode('')
        setCaptchaDisplayCode(data.code)
        setCaptchaError('')
      })
  }, [])

  useEffect(() => {
    if (captchaId === 0) {
      handleCaptchaRefresh()
    }
  }, [captchaId, handleCaptchaRefresh])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCaptchaError('')

    if (!authorName.trim()) {
      setError(dict.comments.errors.nickname)
      return
    }

    if (!content.trim()) {
      setError(dict.comments.errors.content)
      return
    }

    if (!captchaCode || captchaCode.length !== 6) {
      setCaptchaError(dict.comments.errors.captcha)
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          parentId,
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim() || undefined,
          content: content.trim(),
          captchaId,
          captchaCode,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error?.includes('验证码')) { // This check might need to be more robust or rely on error code
          setCaptchaError(data.error)
          setCaptchaCode('')
          setCaptchaId(0)
        } else {
          setError(data.error || dict.comments.errors.network)
        }
        return
      }

      setSuccess(true)
      setAuthorName('')
      setAuthorEmail('')
      setContent('')
      setCaptchaCode('')
      setCaptchaId(0)

      if (onSuccess) {
        onSuccess()
      }

      router.refresh()
    } catch (err) {
      setError(dict.comments.errors.network)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-muted rounded-lg p-6 text-center">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <h3 className="font-medium mb-2">{dict.comments.success.title}</h3>
        <p className="text-sm text-muted-foreground">
          {dict.comments.success.message}
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
        >
          {dict.comments.success.continue}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {replyTo && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          <Reply className="w-4 h-4" />
          <span>{dict.comments.replyTo.replace('{name}', replyTo.authorName)}</span>
          <span className="truncate flex-1">{replyTo.content}</span>
          {onCancelReply && (
            <button
              type="button"
              onClick={onCancelReply}
              className="text-destructive hover:underline"
            >
              {dict.comments.cancel}
            </button>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">{dict.comments.fields.nickname}</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            placeholder={dict.comments.placeholders.nickname}
            maxLength={50}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{dict.comments.fields.email}</label>
          <input
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
            placeholder={dict.comments.placeholders.email}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{dict.comments.fields.content}</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-y min-h-[100px]"
          placeholder={dict.comments.placeholders.content}
          maxLength={5000}
        />
      </div>

      <Captcha
        code={captchaDisplayCode}
        onRefresh={handleCaptchaRefresh}
        value={captchaCode}
        onChange={(value) => {
          setCaptchaCode(value)
          setCaptchaError('')
        }}
        error={captchaError}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-3">
        {onCancelReply && (
          <button
            type="button"
            onClick={onCancelReply}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition"
          >
            {dict.comments.cancel}
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? dict.comments.submitting : dict.comments.submit}
        </button>
      </div>
    </form>
  )
}