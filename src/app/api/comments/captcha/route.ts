import { NextResponse } from 'next/server'
import { db } from '@/db/client'
import { captchaRepository } from '@/db/repositories'

export async function POST() {
  await db.initialize()

  try {
    // 🧹 10% 概率清理过期的验证码
    const CLEANUP_PROBABILITY = 0.1 // 10%
    if (Math.random() < CLEANUP_PROBABILITY) {
      const deletedCount = await captchaRepository.cleanupExpired()
      if (deletedCount > 0) {
        console.log(`[Captcha] Cleaned up ${deletedCount} expired captchas`)
      }
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    const captcha = await captchaRepository.create({ expiresAt })

    return NextResponse.json({
      id: captcha.id,
      code: captcha.code,
      expiresAt: captcha.expiresAt,
    })
  } catch (error) {
    console.error('Failed to create captcha:', error)
    return NextResponse.json({ error: 'Failed to create captcha' }, { status: 500 })
  }
}
