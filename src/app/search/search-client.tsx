'use client'

import { useState } from 'react'
import PostCard from '@/components/post-card'
import { Search as SearchIcon } from 'lucide-react'
import type { Dictionary } from '@/lib/i18n'

interface SearchClientProps {
  dict: Dictionary
}

export default function SearchClient({ dict }: SearchClientProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // 示例文章数据
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
  ]

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery)
    setIsSearching(true)

    // 模拟搜索延迟
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (!searchQuery.trim()) {
      setResults([])
      setIsSearching(false)
      return
    }

    // 简单的搜索过滤（实际应该调用 API）
    const filtered = samplePosts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag: any) =>
          tag.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    )

    setResults(filtered)
    setIsSearching(false)
  }

  return (
    <>
      {/* Header */}
      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">{dict.nav.search}</h1>
          <p className="text-lg text-muted-foreground">
            在 {samplePosts.length} 篇文章中搜索内容
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="输入关键词搜索文章、标签..."
              className="w-full pl-12 pr-4 py-4 border border-border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            支持搜索：文章标题、摘要、标签
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="container mx-auto px-4 pb-12">
        {isSearching ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground mt-4">搜索中...</p>
          </div>
        ) : query ? (
          <>
            <div className="mb-4">
              <span className="text-muted-foreground">
                搜索 "{query}" 找到 {results.length} 个结果
              </span>
            </div>

            {results.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {results.map((post) => (
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
            ) : (
              <div className="text-center py-12 border border-border rounded-lg">
                <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">没有找到相关文章</p>
                <p className="text-sm text-muted-foreground mt-2">
                  试试其他关键词
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              输入关键词开始搜索
            </p>
          </div>
        )}
      </section>
    </>
  )
}
