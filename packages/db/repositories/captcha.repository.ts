import { eq, and, sql } from 'drizzle-orm'
import { db } from '../client'
import { captchas } from '../drizzle/schema'
import { customAlphabet } from 'nanoid'

// 去除易混淆的字符：0, O, o, 1, l, I
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const nanoid = customAlphabet(alphabet, 6)

export const captchaRepository = {
  async create(data: Omit<typeof captchas.$inferInsert, 'code'> & { code?: string }): Promise<typeof captchas.$inferSelect & { code: string }> {
    const code = data.code || nanoid().toUpperCase()
    const adapter = db.getAdapter()
    const result = await adapter.insert(captchas).values({
      code,
      expiresAt: data.expiresAt,
    }).returning()
    return { ...result[0], code }
  },

  async verify(code: string): Promise<boolean> {
    const adapter = db.getAdapter()
    const now = new Date()
    const result = await adapter
      .select()
      .from(captchas)
      .where(and(eq(captchas.code, code.toUpperCase()), sql`${captchas.expiresAt} > ${now}`))

    if (result.length === 0) {
      return false
    }

    const captcha = result[0]
    if (captcha.usedAt) {
      return false
    }

    // ✅ 验证成功后立即删除验证码
    await adapter
      .delete(captchas)
      .where(eq(captchas.id, captcha.id))

    return true
  },

  async delete(id: number): Promise<void> {
    const adapter = db.getAdapter()
    await adapter.delete(captchas).where(eq(captchas.id, id))
  },

  async deleteExpired(): Promise<void> {
    const adapter = db.getAdapter()
    const now = new Date()
    await adapter.delete(captchas).where(sql`${captchas.expiresAt} < ${now}`)
  },

  async findById(id: number): Promise<typeof captchas.$inferSelect | null> {
    const adapter = db.getAdapter()
    const result = await adapter.select().from(captchas).where(eq(captchas.id, id))
    return result[0] || null
  },

  // 🧹 清理过期的验证码
  async cleanupExpired(): Promise<number> {
    const adapter = db.getAdapter()
    const now = new Date()
    const result = await adapter
      .delete(captchas)
      .where(sql`${captchas.expiresAt} < ${now}`)
    return (result as any).changes || 0
  },
}
