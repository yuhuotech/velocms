import CommentsClient from './comments-client'
import { getSettings, getDictionary } from '@/lib/i18n'

export default async function CommentsPage() {
  const settings = await getSettings()
  const dict = await getDictionary(settings.language)

  return <CommentsClient dict={dict} lang={settings.language || 'zh-CN'} />
}