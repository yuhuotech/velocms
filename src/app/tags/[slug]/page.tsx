import { notFound } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import Sidebar from '@/components/sidebar'
import PostCard from '@/components/post-card'
import { Tag as TagIcon } from 'lucide-react'
import Link from 'next/link'
import { getSettings, getDictionary } from '@/lib/i18n'

// Mock tags
const tags: Record<string, { name: string; count: number }> = {
  nextjs: { name: 'Next.js', count: 15 },
  react: { name: 'React', count: 12 },
  typescript: { name: 'TypeScript', count: 8 },
  tailwindcss: { name: 'Tailwind CSS', count: 6 },
  css: { name: 'CSS', count: 5 },
  frontend: { name: '前端开发', count: 20 },
}

// Mock posts
const samplePosts = [
  {
    id: 1,
    title: 'Next.js 15 App Router 完全指南',
    slug: 'nextjs-15-app-router-guide',
    excerpt: 'Next.js 15 带来了很多新特性，本文将详细介绍 App Router 的使用方法和最佳实践。',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    publishedAt: new Date('2024-01-15'),
    readingTime: 15,
    tags: [
      { name: 'Next.js', slug: 'nextjs' },
      { name: 'React', slug: 'react' },
    ],
  },
  {
    id: 2,
    title: 'React Server Components 深度解析',
    slug: 'react-server-components',
    excerpt: 'React Server Components 是 React 18 的重要特性，本文将深入解析其原理和使用方法。',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    publishedAt: new Date('2023-12-28'),
    readingTime: 18,
    tags: [
      { name: 'React', slug: 'react' },
      { name: 'Server Components', slug: 'server-components' },
    ],
  },
]

export async function generateStaticParams() {
  return Object.keys(tags).map((slug) => ({
    slug,
  }))
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tag = tags[slug]
  
  const settings = await getSettings()
  const dict = await getDictionary(settings.language)

  if (!tag) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar dict={dict} />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <Link
              href="/tags"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 transition"
            >
              ← {dict.tags.back}
            </Link>
            <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
              <TagIcon className="w-10 h-10 text-primary" />
              {tag.name}
            </h1>
            <p className="text-lg text-muted-foreground">
              {dict.tags.postCount.replace('{count}', tag.count.toString())}
            </p>
          </div>
        </section>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Posts Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {samplePosts.map((post) => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    slug={post.slug}
                    excerpt={post.excerpt}
                    coverImage={post.coverImage}
                    publishedAt={new Date(post.publishedAt)}
                    readingTime={post.readingTime}
                    tags={post.tags}
                  />
                ))}
              </div>

              {/* Empty State */}
              {samplePosts.length === 0 && (
                <div className="text-center py-12 border border-border rounded-lg">
                  <TagIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{dict.tags.empty}</p>
                </div>
              )}

              {/* Pagination */}
              <div className="flex justify-center gap-2 pt-8">
                <button
                  disabled
                  className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {dict.posts.pagination.prev}
                </button>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">
                  1
                </button>
                <button className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition">
                  {dict.posts.pagination.next}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="border border-border rounded-lg p-4 space-y-4 sticky top-4">
                <h3 className="text-sm font-semibold">{dict.sidebar.popularTags}</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(tags)
                    .filter(([key]) => key !== slug)
                    .slice(0, 6)
                    .map(([, tag]) => (
                      <Link
                        key={tag.name}
                        href={`/tags/${tag.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-muted hover:bg-primary hover:text-primary-foreground rounded transition"
                      >
                        <TagIcon className="w-3 h-3" />
                        {tag.name}
                      </Link>
                    ))}
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
