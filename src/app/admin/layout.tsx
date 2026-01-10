import { getDictionary, getSettings } from "@/lib/i18n";
import AdminLayout from "./admin-layout";
import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return generatePageMetadata({
    title: "管理后台",
    description: `${settings.siteName || "VeloCMS"} 管理后台`,
    template: "admin",
  });
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const dict = await getDictionary(settings.language || "zh-CN");

  return (
    <AdminLayout dict={dict} siteName={settings.siteName}>
      {children}
    </AdminLayout>
  );
}
