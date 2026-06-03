import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import Subscriber from '@/models/Subscriber'

export async function GET(req: NextRequest) {
  requireAuth(req)
  await connectDB()
  const items = await Subscriber.find({ unsubscribedAt: null }).sort({ createdAt: -1 })
  return NextResponse.json(items)
}
