import { menuRepository } from "@/db/repositories";
import { db } from "@/db/client";
import NavbarClient from "./navbar-client";
import type { Dictionary } from "@/lib/i18n";
import { getSettings } from "@/lib/i18n";

interface NavbarProps {
  dict: Dictionary;
}

export default async function Navbar({ dict }: NavbarProps) {
  await db.initialize();
  const [menus, settings] = await Promise.all([
    menuRepository.findActive(),
    getSettings(),
  ]);

  return (
    <NavbarClient
      dict={dict}
      menus={menus}
      siteName={settings.siteName}
      logoUrl={settings.logoUrl}
    />
  );
}
