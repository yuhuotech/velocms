import PostEditor from '@/components/admin/post-editor'
import { getSettings, getDictionary } from '@/lib/i18n'

// Sample data
const samplePost = {
  id: 1,
  title: 'Next.js 15 App Router 完全指南',
  slug: 'nextjs-15-app-router-guide',
  excerpt: 'Next.js 15 带来了很多新特性，本文将详细介绍 App Router 的使用方法和最佳实践。',
  content: '# Next.js 15 App Router Guide\n\nIntroduction...', 
  coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
  status: 'published',
  tags: ['Next.js', 'React'],
  category: '技术',
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const settings = await getSettings()
  const dict = await getDictionary(settings.language)

  return <PostEditor post={samplePost} dict={dict} />
}