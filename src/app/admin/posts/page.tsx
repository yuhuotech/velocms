import PostsClient from './posts-client'
import { getSettings, getDictionary } from '@/lib/i18n'

export default async function PostsPage() {
  const settings = await getSettings()
  const dict = await getDictionary(settings.language)

  return <PostsClient dict={dict} />
}