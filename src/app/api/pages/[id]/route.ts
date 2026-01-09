import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/client'
import { pageRepository } from '@/db/repositories'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await db.initialize()
  const { id } = await params
  const page = await pageRepository.findById(parseInt(id))
  
  if (!page) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  }
  
  return NextResponse.json(page)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await db.initialize()
  const { id } = await params
  try {
    const body = await request.json()
    const page = await pageRepository.update(parseInt(id), body)
    return NextResponse.json(page)
  } catch (error) {
    console.error('Update page error:', error)
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await db.initialize()
  const { id } = await params
  try {
    await pageRepository.delete(parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete page error:', error)
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 })
  }
}
