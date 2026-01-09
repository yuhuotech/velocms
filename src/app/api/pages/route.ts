import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { pageRepository } from '@/db/repositories'
import { z } from 'zod'

const pageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  status: z.enum(['published', 'draft']).default('published'),
})

export async function GET() {
  await db.initialize()
  const pages = await pageRepository.findAll()
  return NextResponse.json(pages)
}

export async function POST(request: NextRequest) {
  await db.initialize()
  try {
    const body = await request.json()
    const validated = pageSchema.parse(body)
    
    // Check slug uniqueness
    const existing = await pageRepository.findBySlug(validated.slug)
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    const page = await pageRepository.create(validated)
    return NextResponse.json(page)
  } catch (error) {
    console.error('Create page error:', error)
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 })
  }
}
