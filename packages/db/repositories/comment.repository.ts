import { eq, desc, and, gte, sql } from 'drizzle-orm'
import { db } from '../client'
import { comments, commentRateLimits } from '../drizzle/schema'

type CommentBase = {
  id: number
  postId: number
  userId: number | null
  parentId: number | null
  authorName: string
  authorEmail: string | null
  content: string
  status: string
  isAdmin: boolean
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  updatedAt: Date
}

interface CommentWithReplies extends CommentBase {
  replies?: CommentWithReplies[]
}

export const commentRepository = {
  async create(data: typeof comments.$inferInsert): Promise<typeof comments.$inferSelect> {
    const adapter = db.getAdapter()
    const result = await adapter.insert(comments).values(data).returning()
    return result[0]
  },

  async findById(id: number): Promise<typeof comments.$inferSelect | null> {
    const adapter = db.getAdapter()
    const result = await adapter.select().from(comments).where(eq(comments.id, id))
    return result[0] || null
  },

  async findByPostId(postId: number, status?: string): Promise<typeof comments.$inferSelect[]> {
    const adapter = db.getAdapter()
    const conditions = [eq(comments.postId, postId)]
    if (status) {
      conditions.push(eq(comments.status, status))
    }
    const result = await adapter
      .select()
      .from(comments)
      .where(and(...conditions))
      .orderBy(desc(comments.createdAt))
    return result
  },

  async findByPostIdTree(postId: number, status?: string): Promise<CommentWithReplies[]> {
    const adapter = db.getAdapter()
    const conditions = [eq(comments.postId, postId)]
    if (status) {
      conditions.push(eq(comments.status, status))
    }
    const allComments = await adapter
      .select()
      .from(comments)
      .where(and(...conditions))
      .orderBy(desc(comments.createdAt))

    const commentMap = new Map<number, CommentWithReplies>()
    const rootComments: CommentWithReplies[] = []

    allComments.forEach((comment: any) => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    allComments.forEach((comment: any) => {
      const commentWithReplies = commentMap.get(comment.id) || { ...comment, replies: [] }
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId)
        if (parent) {
          parent.replies!.push(commentWithReplies)
        }
      } else {
        rootComments.push(commentWithReplies)
      }
    })

    return rootComments
  },

  async update(id: number, data: Partial<typeof comments.$inferInsert>): Promise<typeof comments.$inferSelect | null> {
    const adapter = db.getAdapter()
    const result = await adapter
      .update(comments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning()
    return result[0] || null
  },

  async delete(id: number): Promise<boolean> {
    const adapter = db.getAdapter()
    const result = await adapter.delete(comments).where(eq(comments.id, id))
    return (result as any).changes > 0
  },

  async findAll(status?: string, limit = 50, offset = 0): Promise<typeof comments.$inferSelect[]> {
    const adapter = db.getAdapter()
    const conditions = status ? [eq(comments.status, status)] : []
    const result = await adapter
      .select()
      .from(comments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset)
    return result
  },

  async count(status?: string): Promise<number> {
    const adapter = db.getAdapter()
    const conditions = status ? [eq(comments.status, status)] : []
    const result = await adapter
      .select({ count: sql<number>`count(*)` })
      .from(comments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
    return result[0]?.count || 0
  },

  async checkRateLimit(ipAddress: string, postId: number, maxComments = 5, windowMinutes = 15): Promise<boolean> {
    const adapter = db.getAdapter()
    const now = new Date()
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000)

    const existing = await adapter
      .select()
      .from(commentRateLimits)
      .where(and(eq(commentRateLimits.ipAddress, ipAddress), eq(commentRateLimits.postId, postId)))

    if (existing.length > 0) {
      const record = existing[0]
      if (new Date(record.resetAt) < now) {
        await adapter
          .update(commentRateLimits)
          .set({ count: 1, resetAt: new Date(now.getTime() + windowMinutes * 60 * 1000) })
          .where(eq(commentRateLimits.id, record.id))
        return true
      }
      if (record.count >= maxComments) {
        return false
      }
      await adapter
        .update(commentRateLimits)
        .set({ count: record.count + 1 })
        .where(eq(commentRateLimits.id, record.id))
      return true
    }

    await adapter.insert(commentRateLimits).values({
      ipAddress,
      postId,
      count: 1,
      resetAt: new Date(now.getTime() + windowMinutes * 60 * 1000),
    })
    return true
  },

  async deleteOldRateLimits(): Promise<void> {
    const adapter = db.getAdapter()
    await adapter
      .delete(commentRateLimits)
      .where(gte(commentRateLimits.resetAt, new Date()))
  },
}

export type { CommentWithReplies }
