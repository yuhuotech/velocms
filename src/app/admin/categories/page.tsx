import CategoriesClient from './categories-client'
import { getSettings, getDictionary } from '@/lib/i18n'

export default async function CategoriesPage() {
  const settings = await getSettings()
  const dict = await getDictionary(settings.language)

  return <CategoriesClient dict={dict} />
}