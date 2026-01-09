import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import PostCard from '@/components/post-card'
import Sidebar from '@/components/sidebar'
import { getSettings, getDictionary } from '@/lib/i18n'

import { postRepository, tagRepository } from '@/db/repositories'
import { db } from '@/db/client'

// 💡 定义一个本地函数直接获取数据，而不是通过 fetch
async function getPostsData() {
  await db.initialize()
  const posts = await postRepository.findAll({ status: 'published' })
  const recentPosts = await postRepository.getRecent(5)
  const popularTags = await tagRepository.getPopular(10)

  return {
    posts: posts || [],
    recentPosts: recentPosts || [],
    popularTags: popularTags || [],
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