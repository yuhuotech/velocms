import { eq, desc } from 'drizzle-orm'
import { db } from '../client'
import { pages } from '../drizzle/schema'

export const pageRepository = {
  async findAll() {
    const adapter = db.getAdapter()
    return await adapter.select().from(pages).orderBy(desc(pages.createdAt))
  },

  async findBySlug(slug: string) {
    const adapter = db.getAdapter()
    const result = await adapter.select().from(pages).where(eq(pages.slug, slug))
    return result[0] || null
  },

  async findById(id: number) {
    const adapter = db.getAdapter()
    const result = await adapter.select().from(pages).where(eq(pages.id, id))
    return result[0] || null
  },

  async create(data: typeof pages.$inferInsert) {
    const adapter = db.getAdapter()
    const result = await adapter.insert(pages).values(data).returning()
    return result[0]
  },

  async update(id: number, data: Partial<typeof pages.$inferInsert>) {
    const adapter = db.getAdapter()
    const result = await adapter
      .update(pages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pages.id, id))
      .returning()
    return result[0]
  },

  async delete(id: number) {
    const adapter = db.getAdapter()
    const result = await adapter.delete(pages).where(eq(pages.id, id))
    return (result as any).changes > 0
  }
}
