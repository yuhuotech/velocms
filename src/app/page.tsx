import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import PostCard from '@/components/post-card'
import Sidebar from '@/components/sidebar'
import { getSettings, getDictionary } from '@/lib/i18n'

// 💡 定义一个本地函数直接获取数据，而不是通过 fetch
async function getPostsData() {
  // 这里暂时复用之前的模拟数据，后续你可以直接调用 repository
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
      title: 'TypeScript 高级类型技巧',
      slug: 'typescript-advanced-types',
      excerpt: '掌握 TypeScript 的高级类型系统，让你的代码更加类型安全和可维护。',
      coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop',
      publishedAt: new Date('2024-01-10'),
      readingTime: 12,
      tags: [
        { name: 'TypeScript', slug: 'typescript' },
        { name: '前端开发', slug: 'frontend' },
      ],
    },
    {
      id: 3,
      title: '使用 Tailwind CSS 构建现代网站',
      slug: 'tailwind-css-modern-websites',
      excerpt: 'Tailwind CSS 是一个功能强大的实用优先 CSS 框架，本文介绍如何使用它构建现代网站。',
      coverImage: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&h=400&fit=crop',
      publishedAt: new Date('2024-01-05'),
      readingTime: 10,
      tags: [
        { name: 'Tailwind CSS', slug: 'tailwindcss' },
        { name: 'CSS', slug: 'css' },
      ],
    },
  ];

  const sampleTags = [
    { name: 'Next.js', slug: 'nextjs', count: 15 },
    { name: 'React', slug: 'react', count: 12 },
    { name: 'TypeScript', slug: 'typescript', count: 8 },
  ];

  return {
    posts: samplePosts,
    recentPosts: samplePosts.slice(0, 5),
    popularTags: sampleTags,
  };
}

export default async function BlogHome() {
  const { posts, recentPosts, popularTags } = await getPostsData()
  const settings = await getSettings()
  const dict = await getDictionary(settings.language)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar dict={dict} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {dict.home.hero.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              {dict.home.hero.subtitle}
            </p>
            <div className="flex justify-center gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {dict.home.hero.stats.posts.replace('{count}', posts.length.toString())}
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {dict.home.hero.stats.tags.replace('{count}', popularTags.length.toString())}
              </span>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Posts Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {posts.map((post: any) => (
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
              {posts.length === 0 && (
                <div className="text-center py-12 border border-border rounded-lg">
                  <p className="text-muted-foreground">{dict.home.empty}</p>
                </div>
              )}

              {/* Pagination (Sample) */}
              <div className="flex justify-center gap-2 pt-6">
                <button
                  disabled
                  className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {dict.home.pagination.prev}
                </button>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">
                  1
                </button>
                <button className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition">
                  2
                </button>
                <button className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition">
                  {dict.home.pagination.next}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Sidebar
                recentPosts={recentPosts}
                popularTags={popularTags}
                dict={dict}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer dict={dict} authorName={settings.authorName || 'Admin'} />
    </div>
  )
}