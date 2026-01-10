import { eq, asc, desc } from "drizzle-orm";
import { db } from "../client";
import { menus } from "../drizzle/schema";

export const menuRepository = {
  async findAll() {
    const adapter = db.getAdapter();
    return await adapter.select().from(menus).orderBy(asc(menus.sortOrder));
  },

  async findActive() {
    const adapter = db.getAdapter();
    return await adapter
      .select()
      .from(menus)
      .where(eq(menus.isActive, true))
      .orderBy(asc(menus.sortOrder));
  },

  async findById(id: number) {
    const adapter = db.getAdapter();
    const result = await adapter.select().from(menus).where(eq(menus.id, id));
    return result[0] || null;
  },

  async create(data: typeof menus.$inferInsert) {
    const adapter = db.getAdapter();
    const result = await adapter.insert(menus).values(data).returning();
    return result[0];
  },

  async update(id: number, data: Partial<typeof menus.$inferInsert>) {
    const adapter = db.getAdapter();
    const result = await adapter
      .update(menus)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(menus.id, id))
      .returning();
    return result[0];
  },

  async delete(id: number) {
    const adapter = db.getAdapter();
    const result = await adapter.delete(menus).where(eq(menus.id, id));
    return (result as any).changes > 0 || (result as any).rowCount > 0;
  },

  async saveAll(items: any[]) {
    const adapter = db.getAdapter();
    for (const item of items) {
      if (item.id) {
        await this.update(item.id, item);
      } else {
        await this.create(item);
      }
    }
  },
};
