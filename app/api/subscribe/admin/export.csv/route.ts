import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import Subscriber from '@/models/Subscriber'

export async function GET(req: NextRequest) {
  requireAuth(req)
  await connectDB()
  const items = await Subscriber.find({ unsubscribedAt: null }).sort({ createdAt: -1 })
  const rows = [['email', 'source', 'createdAt']].concat(
    items.map((s) => [s.email, s.source, s.createdAt.toISOString()])
  )
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="subscribers.csv"',
    },
  })
}
