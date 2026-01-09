import { menuRepository } from '@/db/repositories'
import { db } from '@/db/client'
import NavbarClient from './navbar-client'
import type { Dictionary } from '@/lib/i18n'

interface NavbarProps {
  dict: Dictionary
}

export default async function Navbar({ dict }: NavbarProps) {
  await db.initialize()
  const menus = await menuRepository.findActive()

  return <NavbarClient dict={dict} menus={menus} />
}
