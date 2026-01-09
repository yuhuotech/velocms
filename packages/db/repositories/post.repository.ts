import { eq, desc, sql } from 'drizzle-orm'
import { db } from '../client'
import { posts, postTags, tags, users } from '../drizzle/schema'

export const postRepository = {
  async findAll(options: { status?: string; limit?: number; offset?: number } = {}) {
    const adapter = db.getAdapter()
    let query = adapter
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        status: posts.status,
        createdAt: posts.createdAt,
        publishedAt: posts.publishedAt,
        viewCount: posts.viewCount,
        excerpt: posts.excerpt,
        coverImage: posts.coverImage,
        readingTime: posts.readingTime,
        author: users.name,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt))

    if (options.status) {
      // @ts-ignore
      query = query.where(eq(posts.status, options.status))
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.offset(options.offset)
    }

    const results = await query

    // For each post, fetch its tags
    // This is not the most efficient way but works for now. 
    // In a real app, we might want to use a join or a more optimized query.
    const postsWithTags = await Promise.all(
      results.map(async (post) => {
        const postTagsResult = await adapter
          .select({
            id: tags.id,
            name: tags.name,
            slug: tags.slug,
          })
          .from(postTags)
          .innerJoin(tags, eq(postTags.tagId, tags.id))
          .where(eq(postTags.postId, post.id))

        return {
          ...post,
          tags: postTagsResult,
        }
      })
    )

    return postsWithTags
  },

  async findBySlug(slug: string) {
    const adapter = db.getAdapter()
    const result = await adapter.select().from(posts).where(eq(posts.slug, slug))
    const post = result[0] || null

    if (post) {
      const postTagsResult = await adapter
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
        })
        .from(postTags)
        .innerJoin(tags, eq(postTags.tagId, tags.id))
        .where(eq(postTags.postId, post.id))

      return {
        ...post,
        tags: postTagsResult,
      }
    }

    return null
  },

  async findById(id: number) {
    const adapter = db.getAdapter()
    const result = await adapter.select().from(posts).where(eq(posts.id, id))
    return result[0] || null
  },

  async create(data: typeof posts.$inferInsert) {
    const adapter = db.getAdapter()
    const result = await adapter.insert(posts).values(data).returning()
    return result[0]
  },

  async update(id: number, data: Partial<typeof posts.$inferInsert>) {
    const adapter = db.getAdapter()
    const result = await adapter
      .update(posts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning()
    return result[0]
  },

  async delete(id: number) {
    const adapter = db.getAdapter()
    const result = await adapter.delete(posts).where(eq(posts.id, id))
    return (result as any).changes > 0 || (result as any).rowCount > 0
  },

  async findByTag(tagSlug: string, options: { limit?: number; offset?: number } = {}) {
    const adapter = db.getAdapter()
    
    // First find the tag ID
    const tagResult = await adapter.select({ id: tags.id }).from(tags).where(eq(tags.slug, tagSlug))
    if (tagResult.length === 0) return []
    
    const tagId = tagResult[0].id
    
    let query = adapter
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        status: posts.status,
        createdAt: posts.createdAt,
        publishedAt: posts.publishedAt,
        viewCount: posts.viewCount,
        excerpt: posts.excerpt,
        coverImage: posts.coverImage,
        readingTime: posts.readingTime,
        author: users.name,
      })
      .from(posts)
      .innerJoin(postTags, eq(posts.id, postTags.postId))
      .leftJoin(users, eq(posts.userId, users.id))
      .where(sql`${posts.status} = 'published' AND ${postTags.tagId} = ${tagId}`)
      .orderBy(desc(posts.createdAt))

    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.offset(options.offset)
    }

    const results = await query

    const postsWithTags = await Promise.all(
      results.map(async (post) => {
        const postTagsResult = await adapter
          .select({
            id: tags.id,
            name: tags.name,
            slug: tags.slug,
          })
          .from(postTags)
          .innerJoin(tags, eq(postTags.tagId, tags.id))
          .where(eq(postTags.postId, post.id))

        return {
          ...post,
          tags: postTagsResult,
        }
      })
    )

    return postsWithTags
  },

  async getRecent(limit: number = 5) {
    return this.findAll({ status: 'published', limit })
  },

  async count(options: { status?: string } = {}) {
    const adapter = db.getAdapter()
    let query = adapter.select({ count: sql<number>`count(*)` }).from(posts)

    if (options.status) {
      // @ts-ignore
      query = query.where(eq(posts.status, options.status))
    }

    const result = await query
    return result[0].count
  }
}
