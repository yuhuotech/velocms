import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/app/providers'
import { ThemeCSS } from '@/components/theme-css'
import { generateThemeCSS } from '@/lib/theme/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME || 'VeloCMS',
  description: 'A flexible, multi-theme blog/CMS system',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Generate theme CSS on the server
  const themeCSS = await generateThemeCSS()

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
  )
}
