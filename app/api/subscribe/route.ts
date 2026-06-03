import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Subscriber from '@/models/Subscriber'
import User from '@/models/User'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const WINDOW_MS = 15 * 60 * 1000
const MAX = 30
const attempts = new Map<string, { count: number; first: number }>()

function checkLimit(ip: string): boolean {
  const now = Date.now()
  const rec = attempts.get(ip)
  if (!rec || now - rec.first > WINDOW_MS) { attempts.set(ip, { count: 1, first: now }); return true }
  if (rec.count >= MAX) return false
  rec.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  if (!checkLimit(ip)) return NextResponse.json({ error: 'too many requests' }, { status: 429 })

  const { email, source, username } = (await req.json()) as { email?: string; source?: string; username?: string }
  const addr = String(email || '').toLowerCase().trim()
  if (!EMAIL_RE.test(addr)) return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  if (!username) return NextResponse.json({ error: 'username required' }, { status: 400 })

  await connectDB()
  const pub = await User.findOne({ username: username.toLowerCase() }).select('_id').lean()
  if (!pub) return NextResponse.json({ error: 'publication not found' }, { status: 404 })

  await Subscriber.updateOne(
    { email: addr, publicationId: pub._id },
    { $setOnInsert: { email: addr, publicationId: pub._id, source: String(source || 'site').slice(0, 40) }, $set: { unsubscribedAt: null } },
    { upsert: true }
  )
  return NextResponse.json({ ok: true })
}
