import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { ThemeCSS } from "@/components/theme-css";
import { generateThemeCSS } from "@/lib/theme/server";
import { getSettings } from "@/lib/i18n";
import { generatePageMetadata } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return generatePageMetadata({
    title: settings.siteName,
    description: settings.siteDescription,
    keywords: settings.metaKeywords,
    template: "default",
  });
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Generate theme CSS on the server
  const themeCSS = await generateThemeCSS();

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
      </head>
      <body className={inter.className}>
        <Providers>
          <ThemeCSS />
          {children}
        </Providers>
      </body>
    </html>
  );
}
