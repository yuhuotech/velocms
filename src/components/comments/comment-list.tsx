'use client'

import { useState, useEffect } from 'react'
import { CommentItem } from './comment-item'
import { CommentForm } from './comment-form'
import { MessageSquare, Loader2 } from 'lucide-react'
import type { Dictionary } from '@/lib/i18n'

interface ReplyTo {
  id: number
  authorName: string
  content: string
}

interface CommentListProps {
  postId: number
  dict: Dictionary
}

interface Comment {
  id: number
  authorName: string
  content: string
  createdAt: string
  isAdmin: boolean
  status: string
  parentId?: number
  replies?: Comment[]
}

export function CommentList({ postId, dict }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null)
  const [error, setError] = useState('')

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}&status=approved`)
      const data = await res.json()
      if (res.ok) {
        setComments(data.comments || [])
      } else {
        setError(data.error || dict.comments.errors.load)
      }
    } catch (err) {
      setError(dict.comments.errors.network)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [postId])

  const handleReply = (replyToData: ReplyTo) => {
    setReplyTo(replyToData)
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCancelReply = () => {
    setReplyTo(null)
  }

  const handleFormSuccess = () => {
    setReplyTo(null)
    fetchComments()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <section id="comments" className="mt-16 pt-8 border-t border-border">
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare className="w-6 h-6" />
        <h2 className="text-2xl font-bold">{dict.comments.title}</h2>
        <span className="text-muted-foreground">
          ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
        </span>
      </div>

      <div id="comment-form" className="mb-12">
        <h3 className="text-lg font-medium mb-4">{dict.comments.postComment}</h3>
        <CommentForm
          postId={postId}
          parentId={replyTo?.id}
          replyTo={replyTo || undefined}
          onSuccess={handleFormSuccess}
          onCancelReply={handleCancelReply}
          dict={dict}
        />
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {dict.comments.empty}
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onReply={handleReply}
              onRefresh={fetchComments}
              dict={dict} // Pass dict down to CommentItem as well
            />
          ))
        )}
      </div>
    </section>
  )
}