import { notFound } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { MarkdownContent } from '@/components/markdown-content'
import { getSettings, getDictionary } from '@/lib/i18n'
import { db } from '@/db/client'
import { pageRepository } from '@/db/repositories'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await db.initialize()
  const page = await pageRepository.findBySlug(slug)
  
  if (!page) return {}

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription,
  }
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await db.initialize()
  const page = await pageRepository.findBySlug(slug)

  if (!page || page.status !== 'published') {
    notFound()
  }

  const settings = await getSettings()
  const dict = await getDictionary(settings.language)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar dict={dict} />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
          </div>
        </section>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <MarkdownContent content={page.content} />
          </div>
        </div>
      </main>

      <Footer dict={dict} authorName={settings.authorName || 'Admin'} />
    </div>
  )
}
