import { notFound } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import Sidebar from '@/components/sidebar'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Tag, Share2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { MarkdownContent } from '@/components/markdown-content'
import { CommentList } from '@/components/comments'
import { getSettings, getDictionary } from '@/lib/i18n'
import { postRepository, tagRepository } from '@/db/repositories'
import { db } from '@/db/client'

export async function generateStaticParams() {
  await db.initialize()
  const posts = await postRepository.findAll({ status: 'published' })
  return posts.map((post: any) => ({
    slug: post.slug,
  }))
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  await db.initialize()
  const { slug } = await params
  
  const post = await postRepository.findBySlug(slug)
  const settings = await getSettings()
  const dict = await getDictionary(settings.language)

  const recentPosts = await postRepository.getRecent(5)
  const popularTags = await tagRepository.getPopular(10)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar dict={dict} />

      <main className="flex-1">
        {/* Back Button */}
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {dict.posts.back}
          </Link>
        </div>

        {/* Post Content */}
        <article className="container mx-auto px-4 pb-12">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              {/* Header */}
              <header className="mb-8 space-y-4">
                <h1 className="text-4xl font-bold">{post.title}</h1>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(new Date(post.publishedAt || post.createdAt))}</span>
                  </div>
                  {post.readingTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{dict.posts.readTime.replace('{time}', post.readingTime.toString())}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                    <span>{dict.posts.share}</span>
                  </div>
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag: any) => (
                      <Link
                        key={tag.slug}
                        href={`/tags/${tag.slug}`}
                        className="inline-flex items-center gap-1 text-sm px-3 py-1 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full transition"
                      >
                        <Tag className="w-3 h-3" />
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                )}
              </header>

              {/* Cover Image */}
              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
                />
              )}

              {/* Content */}
              <MarkdownContent content={post.content} />

              {/* Share Buttons */}
              <div className="mt-12 pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">{dict.posts.shareTo}</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[#1DA1F2] text-white rounded-lg text-sm hover:opacity-90 transition">
                    Twitter
                  </button>
                  <button className="px-4 py-2 bg-[#4267B2] text-white rounded-lg text-sm hover:opacity-90 transition">
                    Facebook
                  </button>
                  <button className="px-4 py-2 bg-[#0F0F0F] text-white rounded-lg text-sm hover:opacity-90 transition">
                    Weibo
                  </button>
                </div>
              </div>

              <CommentList postId={post.id} dict={dict} />
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
        </article>
      </main>

      <Footer dict={dict} authorName={settings.authorName || 'Admin'} />
    </div>
  )
}
