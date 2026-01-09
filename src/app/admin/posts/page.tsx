import PostsClient from './posts-client'
import { getSettings, getDictionary } from '@/lib/i18n'
import { postRepository } from '@/db/repositories'
import { db } from '@/db/client'

export default async function PostsPage() {
  await db.initialize()
  const settings = await getSettings()
  const dict = await getDictionary(settings.language)
  const posts = await postRepository.findAll()

  return <PostsClient dict={dict} initialPosts={posts} />
}