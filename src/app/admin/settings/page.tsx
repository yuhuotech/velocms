import { getSettings, getDictionary } from '@/lib/i18n'
import SettingsForm from './settings-form'

export default async function SettingsPage() {
  const settings = await getSettings()
  const dict = await getDictionary(settings.language)

  return <SettingsForm initialSettings={settings} dict={dict} />
}