import PageEditor from '@/components/admin/page-editor'
import { getSettings, getDictionary } from '@/lib/i18n'
import { db } from '@/db/client'
import { pageRepository } from '@/db/repositories'

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const settings = await getSettings()
  const dict = await getDictionary(settings.language)
  const { id } = await params
  
  await db.initialize()
  const page = await pageRepository.findById(parseInt(id))

  if (!page) {
    return <div>Page not found</div>
  }

  return <PageEditor page={page} dict={dict} />
}
