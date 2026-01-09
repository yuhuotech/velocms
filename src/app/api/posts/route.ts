import { NextResponse } from 'next/server'

// 示例数据（后续从数据库获取）
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

export async function GET() {
  return NextResponse.json({
    posts: samplePosts,
    recentPosts: samplePosts.slice(0, 5),
    popularTags: sampleTags,
  })
}
