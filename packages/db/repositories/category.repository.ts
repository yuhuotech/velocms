import { eq, desc, sql, count } from "drizzle-orm";
import { db } from "../client";
import { categories, posts } from "../drizzle/schema";

export const categoryRepository = {
  async findAll() {
    const adapter = db.getAdapter();
    const results = await adapter
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        count: sql<number>`count(${posts.id})`,
        createdAt: categories.createdAt,
      })
      .from(categories)
      .leftJoin(posts, eq(categories.id, posts.categoryId))
      .groupBy(categories.id)
      .orderBy(desc(categories.createdAt));

    return results;
  },

  async findBySlug(slug: string) {
    const adapter = db.getAdapter();
    const result = await adapter
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        count: sql<number>`count(${posts.id})`,
      })
      .from(categories)
      .leftJoin(posts, eq(categories.id, posts.categoryId))
      .where(eq(categories.slug, slug))
      .groupBy(categories.id);

    return result[0] || null;
  },

  async findById(id: number) {
    const adapter = db.getAdapter();
    const results = await adapter
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    return results[0] || null;
  },

  async create(data: { name: string; slug: string; description?: string }) {
    const adapter = db.getAdapter();
    const results = await adapter.insert(categories).values(data).returning();

    return results[0];
  },

  async update(
    id: number,
    data: { name?: string; slug?: string; description?: string },
  ) {
    const adapter = db.getAdapter();
    const results = await adapter
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();

    return results[0];
  },

  async delete(id: number) {
    const adapter = db.getAdapter();
    await adapter.delete(categories).where(eq(categories.id, id));
  },

  async checkSlugExists(slug: string, excludeId?: number) {
    const adapter = db.getAdapter();
    const query = adapter
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, slug));

    if (excludeId) {
      query.where(
        sql`${categories.slug} = ${slug} AND ${categories.id} != ${excludeId}`,
      );
    }

    const result = await query;
    return result.length > 0;
  },
};
