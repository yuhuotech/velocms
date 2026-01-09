import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/db/client'
import { commentRepository, captchaRepository } from '@/db/repositories'
import { auth } from '@/auth'

const createCommentSchema = z.object({
  postId: z.number().positive(),
  parentId: z.number().positive().optional(),
  authorName: z.string().min(1).max(50),
  authorEmail: z.string().email().optional().or(z.literal('')),
  content: z.string().min(1).max(5000),
  captchaId: z.number().positive(),
  captchaCode: z.string().length(6),
})

const updateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
})

export async function GET(request: NextRequest) {
  await db.initialize()
  const searchParams = request.nextUrl.searchParams
  const postId = searchParams.get('postId')
  const status = searchParams.get('status') || 'approved'

  if (!postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 })
  }

  try {
    const comments = await commentRepository.findByPostIdTree(
      parseInt(postId),
      status === 'all' ? undefined : status
    )
    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  await db.initialize()
  try {
    const body = await request.json()
    const validatedData = createCommentSchema.parse(body)

    const captchaValid = await captchaRepository.verify(validatedData.captchaCode)
    if (!captchaValid) {
      return NextResponse.json({ error: '验证码错误或已过期' }, { status: 400 })
    }

    const rateLimitOk = await commentRepository.checkRateLimit(
      request.headers.get('x-forwarded-for') || 'unknown',
      validatedData.postId
    )

    if (!rateLimitOk) {
      return NextResponse.json(
        { error: '评论太频繁，请稍后再试' },
        { status: 429 }
      )
    }

    const session = await auth()
    const isAdmin = session?.user?.role === 'admin'

    const comment = await commentRepository.create({
      postId: validatedData.postId,
      parentId: validatedData.parentId,
      authorName: validatedData.authorName,
      authorEmail: validatedData.authorEmail || null,
      content: validatedData.content,
      status: isAdmin ? 'approved' : 'pending',
      isAdmin,
      ipAddress: request.headers.get('x-forwarded-for') || null,
      userAgent: request.headers.get('user-agent') || null,
    })

    return NextResponse.json({
      comment,
      message: isAdmin ? '评论已发布' : '评论已提交，等待审核',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    console.error('Failed to create comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
