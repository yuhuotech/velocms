'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import { MessageSquare, Check, X, Trash2, Reply, MoreHorizontal, Search, Filter } from 'lucide-react'
import type { Dictionary } from '@/lib/i18n'

interface CommentsClientProps {
  dict: Dictionary
  lang: string
}

interface Comment {
  id: number
  postId: number
  authorName: string
  authorEmail?: string
  content: string
  status: string
  isAdmin: boolean
  createdAt: string
  post?: {
    title: string
    slug: string
  }
  parentId?: number
}

export default function CommentsClient({ dict, lang }: CommentsClientProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState<Set<number>>(new Set())
  const [selectedComments, setSelectedComments] = useState<Set<number>>(new Set())
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyComment, setReplyComment] = useState<Comment | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replySubmitting, setReplySubmitting] = useState(false)

  const dateLocale = lang === 'zh-CN' ? zhCN : enUS

  const fetchComments = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/comments?status=${status}&page=${page}&limit=20`)
      const data = await res.json()
      if (res.ok) {
        setComments(data.comments || [])
        setTotal(data.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [status, page])

  const handleStatusChange = async (id: number, newStatus: string) => {
    setActionLoading((prev) => new Set([...prev, id]))
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        )
      }
    } catch (error) {
      console.error('Failed to update comment:', error)
    } finally {
      setActionLoading((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm(dict.admin.comments.confirm.delete)) return

    setActionLoading((prev) => new Set([...prev, id]))
    try {
      const res = await fetch(`/api/admin/comments?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id))
        setTotal((prev) => prev - 1)
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
    } finally {
      setActionLoading((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedComments.size === 0) return

    const actionName = action === 'approve' ? dict.admin.comments.actions.approve : 
                       action === 'reject' ? dict.admin.comments.actions.reject : 
                       dict.admin.comments.actions.delete
    
    if (!confirm(dict.admin.comments.confirm.batch.replace('{action}', actionName).replace('{count}', selectedComments.size.toString()))) return

    setActionLoading((prev) => new Set([...prev, ...selectedComments]))

    try {
      const promises = Array.from(selectedComments).map((id) => {
        if (action === 'delete') {
          return fetch(`/api/admin/comments?id=${id}`, { method: 'DELETE' })
        } else {
          const newStatus = action === 'approve' ? 'approved' : 'rejected'
          return fetch('/api/admin/comments', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: newStatus }),
          })
        }
      })

      await Promise.all(promises)
      fetchComments()
      setSelectedComments(new Set())
    } catch (error) {
      console.error('Failed to perform bulk action:', error)
    } finally {
      setActionLoading(new Set())
    }
  }

  const handleReply = () => {
    setShowReplyModal(true)
  }

  const submitReply = async () => {
    if (!replyComment || !replyContent.trim()) return

    setReplySubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: replyComment.postId,
          parentId: replyComment.id,
          authorName: '管理员', // Can be dynamic if needed
          content: replyContent,
          captchaId: 0,
          captchaCode: 'ADMIN',
        }),
      })

      if (res.ok) {
        setShowReplyModal(false)
        setReplyContent('')
        setReplyComment(null)
        fetchComments()
      }
    } catch (error) {
      console.error('Failed to submit reply:', error)
    } finally {
      setReplySubmitting(false)
    }
  }

  const filteredComments = comments.filter((comment) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      comment.authorName.toLowerCase().includes(query) ||
      comment.content.toLowerCase().includes(query) ||
      comment.post?.title.toLowerCase().includes(query)
    )
  })

  const stats = {
    all: total,
    pending: comments.filter((c) => c.status === 'pending').length,
    approved: comments.filter((c) => c.status === 'approved').length,
    rejected: comments.filter((c) => c.status === 'rejected').length,
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold">{dict.admin.comments.title}</h1>
        <p className="text-xs text-muted-foreground mt-1">{dict.admin.comments.subtitle}</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xl font-bold">{stats.all}</div>
          <div className="text-xs text-muted-foreground">{dict.admin.comments.stats.all}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-xs text-muted-foreground">{dict.admin.comments.stats.pending}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-xs text-muted-foreground">{dict.admin.comments.stats.approved}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-xs text-muted-foreground">{dict.admin.comments.stats.rejected}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={dict.common.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-border rounded-lg bg-background text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="px-2 py-1.5 border border-border rounded-lg bg-background text-sm"
          >
            <option value="all">{dict.admin.comments.stats.all}</option>
            <option value="pending">{dict.admin.comments.stats.pending}</option>
            <option value="approved">{dict.admin.comments.stats.approved}</option>
            <option value="rejected">{dict.admin.comments.stats.rejected}</option>
          </select>
        </div>

        {selectedComments.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">
              {dict.common.itemsSelected.replace('{count}', selectedComments.size.toString())}
            </span>
            <button
              onClick={() => handleBulkAction('approve')}
              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:opacity-90 transition"
            >
              {dict.admin.comments.actions.batchApprove}
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              className="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:opacity-90 transition"
            >
              {dict.admin.comments.actions.batchReject}
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:opacity-90 transition"
            >
              {dict.admin.comments.actions.batchDelete}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-card border border-border rounded-lg p-3 space-y-2 hover:bg-accent/30 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedComments.has(comment.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedComments((prev) => new Set([...prev, comment.id]))
                      } else {
                        setSelectedComments((prev) => {
                          const next = new Set(prev)
                          next.delete(comment.id)
                          return next
                        })
                      }
                    }}
                    className="mt-1"
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{comment.authorName}</span>
                      {comment.isAdmin && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded">
                          Admin
                        </span>
                      )}
                      {comment.status === 'pending' && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-yellow-100 text-yellow-800 rounded dark:bg-yellow-900/30 dark:text-yellow-400">
                          {dict.admin.comments.stats.pending}
                        </span>
                      )}
                      {comment.status === 'rejected' && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-800 rounded dark:bg-red-900/30 dark:text-red-400">
                          {dict.admin.comments.stats.rejected}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          locale: dateLocale,
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    {comment.post && (
                      <Link
                        href={`/posts/${comment.post.slug}`}
                        className="text-xs text-muted-foreground hover:text-primary transition block mt-0.5"
                      >
                        {lang === 'zh-CN' ? '文章' : 'Post'}：{comment.post.title}
                      </Link>
                    )}

                    <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>

                    {comment.authorEmail && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {comment.authorEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {comment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(comment.id, 'approved')}
                        disabled={actionLoading.has(comment.id)}
                        className="p-1.5 rounded hover:bg-green-100 text-green-600 transition disabled:opacity-50"
                        title={dict.admin.comments.actions.approve}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(comment.id, 'rejected')}
                        disabled={actionLoading.has(comment.id)}
                        className="p-1.5 rounded hover:bg-yellow-100 text-yellow-600 transition disabled:opacity-50"
                        title={dict.admin.comments.actions.reject}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setReplyComment(comment)
                      setShowReplyModal(true)
                    }}
                    className="p-1.5 rounded hover:bg-blue-100 text-blue-600 transition"
                    title={dict.admin.comments.actions.reply}
                  >
                    <Reply className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={actionLoading.has(comment.id)}
                    className="p-1.5 rounded hover:bg-red-100 text-red-600 transition disabled:opacity-50"
                    title={dict.admin.comments.actions.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredComments.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {dict.admin.comments.empty}
            </div>
          )}
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition disabled:opacity-50"
          >
            {dict.home.pagination.prev}
          </button>
          <span className="px-4 py-2">
            {/* Simple pagination text, can be improved */}
            {page} / {Math.ceil(total / 20)}
          </span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page >= Math.ceil(total / 20)}
            className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition disabled:opacity-50"
          >
            {dict.home.pagination.next}
          </button>
        </div>
      )}

      {showReplyModal && replyComment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-bold mb-4">{dict.admin.comments.replyModal.title}</h2>
            <div className="bg-muted p-3 rounded-lg mb-4">
              <p className="text-sm">
                <strong>{replyComment.authorName}：</strong>
              </p>
              <p className="text-sm mt-1">{replyComment.content}</p>
            </div>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={dict.admin.comments.replyModal.placeholder}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-y min-h-[100px]"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowReplyModal(false)
                  setReplyContent('')
                  setReplyComment(null)
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition"
              >
                {dict.common.cancel}
              </button>
              <button
                onClick={submitReply}
                disabled={replySubmitting || !replyContent.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {replySubmitting ? dict.admin.comments.replyModal.submitting : dict.admin.comments.replyModal.submit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
