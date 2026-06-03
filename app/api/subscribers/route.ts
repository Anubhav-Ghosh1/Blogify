import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import Subscriber from '@/models/Subscriber'

export async function GET(req: NextRequest) {
  const user = requireAuth(req)
  await connectDB()
  const { searchParams } = req.nextUrl
  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const limit = Math.min(100, Number(searchParams.get('limit') || 50))
  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    Subscriber.find({ publicationId: user.sub }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Subscriber.countDocuments({ publicationId: user.sub }),
  ])
  return NextResponse.json({ items, total, page, limit })
}
