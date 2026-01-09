import { db } from '@/db/client'
import { settings } from '@/db/drizzle/schema'
import 'server-only'

// Load dictionaries statically (or dynamically if too large)
import zhCN from '@/locales/zh-CN.json'
import enUS from '@/locales/en-US.json'

const dictionaries = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

export type Dictionary = typeof zhCN
export type Language = keyof typeof dictionaries

export const defaultLanguage: Language = 'zh-CN'

export async function getSettings() {
  try {
    await db.initialize()
    const adapter = db.getAdapter()
    const result = await adapter.select().from(settings).limit(1)
    if (result.length === 0) {
      // Default initial state
      return { 
        language: defaultLanguage,
        siteName: 'VeloCMS',
        emailNotifications: true,
        commentNotifications: true 
      }
    }
    return result[0]
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return { language: defaultLanguage }
  }
}

export async function getDictionary(lang?: string): Promise<Dictionary> {
  let locale = lang
  if (!locale) {
    const s = await getSettings()
    locale = s.language || defaultLanguage
  }
  
  return dictionaries[locale as keyof typeof dictionaries] || dictionaries[defaultLanguage]
}
