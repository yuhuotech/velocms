import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import Sidebar from '@/components/sidebar'
import Link from 'next/link'
import { Tag as TagIcon } from 'lucide-react'
import { getSettings, getDictionary } from '@/lib/i18n'
import { tagRepository } from '@/db/repositories'
import { db } from '@/db/client'

export default async function TagsPage() {
  await db.initialize()
  const settings = await getSettings()
  const dict = await getDictionary(settings.language)
  const tags = await tagRepository.findAll()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar dict={dict} />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-4">{dict.tags.title}</h1>
            <p className="text-lg text-muted-foreground">
              {dict.tags.count.replace('{count}', (tags?.length || 0).toString())}
            </p>
          </div>
        </section>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {(!tags || tags.length === 0) ? (
                <div className="text-center py-12 border border-border rounded-lg">
                  <p className="text-muted-foreground">{dict.tags.empty}</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {tags.map((tag: any) => (
                    <Link
                      key={tag.slug}
                      href={`/tags/${tag.slug}`}
                      className="group border border-border rounded-lg p-6 hover:border-primary transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition">
                            <TagIcon className="inline-block w-5 h-5 mr-2" />
                            {tag.name}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {dict.tags.postCount.replace('{count}', (tag.count || 0).toString())}
                          </p>
                        </div>
                        <div className="px-3 py-1 bg-muted rounded-full text-sm">
                          {tag.count || 0}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="border border-border rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-semibold">{dict.sidebar.popularTags}</h3>
                <div className="flex flex-wrap gap-2">
                  {tags?.slice(0, 10).map((tag: any) => (
                    <Link
                      key={tag.slug}
                      href={`/tags/${tag.slug}`}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-muted hover:bg-primary hover:text-primary-foreground rounded transition"
                    >
                      <TagIcon className="w-3 h-3" />
                      {tag.name}
                    </Link>
                  ))}
                  {(!tags || tags.length === 0) && (
                    <p className="text-xs text-muted-foreground">暂无标签</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer dict={dict} authorName={settings.authorName || 'Admin'} />
    </div>
  )
}