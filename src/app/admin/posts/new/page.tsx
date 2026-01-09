import PostEditor from '@/components/admin/post-editor'
import { getSettings, getDictionary } from '@/lib/i18n'

export default async function NewPostPage() {
  const settings = await getSettings()
  const dict = await getDictionary(settings.language)

  return <PostEditor dict={dict} />
}