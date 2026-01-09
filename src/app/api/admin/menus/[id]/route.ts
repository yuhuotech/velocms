import { NextResponse } from 'next/server'
import { menuRepository } from '@/db/repositories'
import { db } from '@/db/client'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await db.initialize()
    const { id } = await params
    const data = await req.json()
    const menu = await menuRepository.update(parseInt(id), data)
    return NextResponse.json(menu)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await db.initialize()
    const { id } = await params
    await menuRepository.delete(parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
