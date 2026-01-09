import { eq, desc, sql, count } from 'drizzle-orm'
import { db } from '../client'
import { tags, postTags } from '../drizzle/schema'

export const tagRepository = {
  async findAll() {
    const adapter = db.getAdapter()
    const results = await adapter
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        description: tags.description,
        count: sql<number>`count(${postTags.postId})`,
      })
      .from(tags)
      .leftJoin(postTags, eq(tags.id, postTags.tagId))
      .groupBy(tags.id)
      .orderBy(desc(sql`count(${postTags.postId})`))
    
    return results
  },

  async findBySlug(slug: string) {
    const adapter = db.getAdapter()
    const result = await adapter
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        description: tags.description,
        count: sql<number>`count(${postTags.postId})`,
      })
      .from(tags)
      .leftJoin(postTags, eq(tags.id, postTags.tagId))
      .where(eq(tags.slug, slug))
      .groupBy(tags.id)
    
    return result[0] || null
  },

  async getPopular(limit: number = 10) {
    const adapter = db.getAdapter()
    return await adapter
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        count: sql<number>`count(${postTags.postId})`,
      })
      .from(tags)
      .leftJoin(postTags, eq(tags.id, postTags.tagId))
      .groupBy(tags.id)
      .orderBy(desc(sql`count(${postTags.postId})`))
      .limit(limit)
  }
}
