import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 20
const attempts = new Map<string, { count: number; first: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const rec = attempts.get(ip)
  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: now })
    return true
  }
  if (rec.count >= MAX_ATTEMPTS) return false
  rec.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
  }

  const { email, password } = (await req.json()) as { email?: string; password?: string }
  if (!email || !password) {
    return NextResponse.json({ error: 'email + password required' }, { status: 400 })
  }

  await connectDB()
  const user = await User.findOne({ email: email.toLowerCase().trim() })
  const invalid = () => NextResponse.json({ error: 'invalid credentials' }, { status: 401 })

  if (!user) return invalid()
  const ok = await (user as unknown as { verifyPassword(p: string): Promise<boolean> }).verifyPassword(password)
  if (!ok) return invalid()

  const token = jwt.sign(
    { sub: String(user._id), email: user.email, role: user.role, name: user.name, username: user.username },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  )

  const res = NextResponse.json({
    user: { id: user._id, email: user.email, name: user.name, role: user.role, username: user.username },
  })
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
  return res
}
