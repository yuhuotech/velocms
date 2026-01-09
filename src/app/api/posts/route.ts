import { NextResponse } from 'next/server'
import { postRepository, tagRepository } from '@/db/repositories'
import { db } from '@/db/client'

export async function GET() {
  try {
    await db.initialize()
    const posts = await postRepository.findAll({ status: 'published' })
    const recentPosts = await postRepository.getRecent(5)
    const popularTags = await tagRepository.getPopular(10)

    return NextResponse.json({
      posts: posts || [],
      recentPosts: recentPosts || [],
      popularTags: popularTags || [],
    })
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}