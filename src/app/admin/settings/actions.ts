'use server'

import { db } from '@/db/client'
import { settings } from '@/db/drizzle/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function saveSettings(data: any) {
  try {
    await db.initialize()
    const adapter = db.getAdapter()
    const existing = await adapter.select().from(settings).limit(1)

    // Ensure boolean fields are actually booleans (if coming from FormData they might be strings or undefined)
    // But we will likely pass a clean object from the client component.
    const payload = {
      ...data,
      updatedAt: new Date(),
    }

    if (existing.length === 0) {
      await adapter.insert(settings).values(payload)
    } else {
      await adapter.update(settings)
        .set(payload)
        .where(eq(settings.id, existing[0].id))
    }

    revalidatePath('/admin')
    revalidatePath('/', 'layout') // Refresh global layout for language changes
    return { success: true }
  } catch (error) {
    console.error('Failed to save settings:', error)
    return { success: false, error: 'Failed to save settings' }
  }
}
