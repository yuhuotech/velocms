'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { MessageSquare, Reply, MoreVertical, Trash2, Check, X } from 'lucide-react'
import type { Dictionary } from '@/lib/i18n'

interface CommentItemProps {
  comment: {
    id: number
    authorName: string
    content: string
    createdAt: Date | string
    isAdmin: boolean
    status: string
    parentId?: number
    replies?: CommentItemProps['comment'][]
  }
  postId: number
  onReply: (replyTo: { id: number; authorName: string; content: string }) => void
  onRefresh: () => void
  depth?: number
  dict: Dictionary
}

export function CommentItem({ comment, postId, onReply, onRefresh, depth = 0, dict }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // This internal handleReply is slightly different from the parent's,
  // but for consistency we can just use the parent's onReply which scrolls to top,
  // OR we can keep the inline reply form but translate it.
  // The current implementation has an inline form. I'll translate it.

  const formatDate = (date: Date | string) => {
    try {
      // TODO: Pass locale dynamically if needed, defaulting to zhCN for now as per imports
      return formatDistanceToNow(new Date(date), { locale: zhCN, addSuffix: true })
    } catch {
      return ''
    }
  }

  const maxDepth = 3

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l-2 border-border pl-4' : ''}`}>
      <div className="py-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium flex-shrink-0">
            {comment.authorName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{comment.authorName}</span>
              {comment.isAdmin && (
                <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                  Admin
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </div>

            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => onReply({ id: comment.id, authorName: comment.authorName, content: comment.content })}
                disabled={depth >= maxDepth}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition disabled:opacity-50"
              >
                <Reply className="w-4 h-4" />
                {dict.comments.reply}
              </button>

              {comment.status === 'pending' && (
                <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                  {dict.admin.comments.stats.pending}
                </span>
              )}

              {comment.status === 'rejected' && (
                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded">
                  {dict.admin.comments.stats.rejected}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onReply={onReply}
              onRefresh={onRefresh}
              depth={depth + 1}
              dict={dict}
            />
          ))}
        </div>
      )}
    </div>
  )
}