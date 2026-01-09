import PagesClient from './pages-client'
import { getSettings, getDictionary } from '@/lib/i18n'

export default async function PagesPage() {
  const settings = await getSettings()
  const dict = await getDictionary(settings.language)

  return <PagesClient dict={dict} />
}
