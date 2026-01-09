import { getDictionary, getSettings } from '@/lib/i18n'
import AdminLayout from './admin-layout'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings()
  const dict = await getDictionary(settings.language || 'zh-CN')

  return (
    <AdminLayout dict={dict}>
      {children}
    </AdminLayout>
  )
}
