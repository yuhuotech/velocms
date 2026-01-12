import NewCategoryClient from "./new-category-client";
import { getSettings, getDictionary } from "@/lib/i18n";

export default async function NewCategoryPage() {
  const settings = await getSettings();
  const dict = await getDictionary(settings.language);

  return <NewCategoryClient dict={dict} />;
}
