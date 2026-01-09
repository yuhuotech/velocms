import TagsClient from './tags-client'
import { getSettings, getDictionary } from '@/lib/i18n'

export default async function TagsPage() {
  const settings = await getSettings()
  const dict = await getDictionary(settings.language)

  return <TagsClient dict={dict} />
}