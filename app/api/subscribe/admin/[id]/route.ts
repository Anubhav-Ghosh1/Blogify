import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import Subscriber from '@/models/Subscriber'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(req: NextRequest, { params }: Params) {
  requireAuth(req)
  const { id } = await params
  await connectDB()
  const out = await Subscriber.findByIdAndDelete(id)
  if (!out) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
