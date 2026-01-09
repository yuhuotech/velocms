import PageEditor from '@/components/admin/page-editor'
import { getSettings, getDictionary } from '@/lib/i18n'

export default async function NewPagePage() {
  const settings = await getSettings()
  const dict = await getDictionary(settings.language)

  return <PageEditor dict={dict} />
}
