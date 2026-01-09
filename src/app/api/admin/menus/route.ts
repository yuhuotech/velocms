import { NextResponse } from 'next/server'
import { menuRepository } from '@/db/repositories'
import { db } from '@/db/client'

export async function GET() {
  try {
    await db.initialize()
    const menus = await menuRepository.findAll()
    return NextResponse.json(menus)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await db.initialize()
    const data = await req.json()
    const menu = await menuRepository.create(data)
    return NextResponse.json(menu)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    await db.initialize()
    const items = await req.json()
    await menuRepository.saveAll(items)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
