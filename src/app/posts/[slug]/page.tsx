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

// 示例文章数据（与 API 路由一致）
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
  {
    id: 4,
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
  {
    id: 5,
    title: 'Vite vs Webpack：构建工具对比',
    slug: 'vite-vs-webpack',
    excerpt: 'Vite 和 Webpack 都是流行的构建工具，本文将从多个维度对比它们的优缺点。',
    coverImage: null,
    publishedAt: new Date('2023-12-20'),
    readingTime: 8,
    tags: [
      { name: 'Vite', slug: 'vite' },
      { name: 'Webpack', slug: 'webpack' },
      { name: '构建工具', slug: 'build-tools' },
    ],
  },
]

const sampleTags = [
  { name: 'Next.js', slug: 'nextjs', count: 15 },
  { name: 'React', slug: 'react', count: 12 },
  { name: 'TypeScript', slug: 'typescript', count: 8 },
  { name: 'Tailwind CSS', slug: 'tailwindcss', count: 6 },
  { name: 'CSS', slug: 'css', count: 5 },
  { name: '前端开发', slug: 'frontend', count: 20 },
]

// 示例文章内容
const sampleContent = `# Next.js 15 App Router 完全指南

## 简介

Next.js 15 带来了很多新特性，其中最重要的是 App Router 的进一步完善。本文将详细介绍 App Router 的使用方法和最佳实践。

## 主要特性

### 1. Server Components

Server Components 是 React 18 的核心特性之一，它允许我们在服务端渲染组件，从而提高性能。

\`\`\`typescript
// 这是一个 Server Component
async function PostList() {
  const posts = await fetchPosts()
  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
\`\`\`

### 2. 数据获取

在 App Router 中，我们可以直接在组件中获取数据：

\`\`\`typescript
async function Post({ id }: { id: string }) {
  const post = await db.post.findUnique({
    where: { id }
  })

  return <div>{post.title}</div>
}
\`\`\`

### 3. 路由组织

App Router 使用基于文件系统的路由，更加直观：

\`\`\`
app/
├── page.tsx         // /
├── about/
│   └── page.tsx     // /about
└── posts/
    ├── page.tsx      // /posts
    └── [id]/
        └── page.tsx  // /posts/123
\`\`\`

## 最佳实践

1. **默认使用 Server Components**：只在需要交互时使用 Client Components
2. **合理使用 Suspense**：提高用户体验
3. **优化图片加载**：使用 next/image 组件
4. **使用并行路由**：提高应用性能

## 总结

Next.js 15 的 App Router 提供了更强大的功能和更好的开发体验。掌握这些特性，可以让我们构建更优秀的 Web 应用。
`

// 获取所有文章的 slug
export async function generateStaticParams() {
  return samplePosts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = samplePosts.find((p: any) => p.slug === slug)
  
  const settings = await getSettings()
  const dict = await getDictionary(settings.language)

  const recentPosts = samplePosts.slice(0, 5)
  const popularTags = sampleTags

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
            返回首页
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
                    <span>{formatDate(new Date(post.publishedAt))}</span>
                  </div>
                  {post.readingTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readingTime} 分钟阅读</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                    <span>分享</span>
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
              <MarkdownContent content={sampleContent} />

              {/* Share Buttons */}
              <div className="mt-12 pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">分享到：</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[#1DA1F2] text-white rounded-lg text-sm hover:opacity-90 transition">
                    Twitter
                  </button>
                  <button className="px-4 py-2 bg-[#4267B2] text-white rounded-lg text-sm hover:opacity-90 transition">
                    Facebook
                  </button>
                  <button className="px-4 py-2 bg-[#0F0F0F] text-white rounded-lg text-sm hover:opacity-90 transition">
                    Bilibili
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