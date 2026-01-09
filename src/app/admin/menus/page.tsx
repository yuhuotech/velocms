import MenusClient from './menus-client'
import { getSettings, getDictionary } from '@/lib/i18n'
import { menuRepository } from '@/db/repositories'
import { db } from '@/db/client'

export default async function MenusPage() {
  await db.initialize()
  const settings = await getSettings()
  const dict = await getDictionary(settings.language)
  const menus = await menuRepository.findAll()

  return <MenusClient dict={dict} initialMenus={menus} />
}
