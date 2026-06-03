import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import jwt from 'jsonwebtoken'

const RESERVED = new Set([
  'admin', 'dashboard', 'login', 'signup', 'logout', 'about', 'api',
  'tag', 'p', 'rss', 'sitemap', 'robots', 'favicon', 'static', 'public',
  'settings', 'posts', 'new', 'edit', 'analytics', 'subscribers', 'help',
  'support', 'terms', 'privacy', 'blog', 'home', 'me', 'null', 'undefined',
])

export async function POST(req: NextRequest) {
  await connectDB()
  const body = await req.json()
  const { name, email, password, username } = body

  if (!name || !email || !password || !username) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const slug = username.toLowerCase().replace(/[^a-z0-9_-]/g, '')
  if (slug.length < 3 || slug.length > 30) {
    return NextResponse.json({ error: 'Username must be 3–30 chars (letters, numbers, _ -)' }, { status: 400 })
  }
  if (RESERVED.has(slug)) {
    return NextResponse.json({ error: 'That username is reserved' }, { status: 400 })
  }

  const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: slug }] })
  if (exists) {
    if (exists.email === email.toLowerCase()) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
  }

  const passwordHash = await (User as unknown as { hashPassword(p: string): Promise<string> }).hashPassword(password)
  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    name,
    username: slug,
    blogTitle: `${name}'s Blog`,
    blogDescription: '',
  })

  const token = jwt.sign(
    { sub: String(user._id), email: user.email, role: user.role, name: user.name, username: user.username },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  )

  const res = NextResponse.json({ _id: user._id, name: user.name, username: user.username }, { status: 201 })
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return res
}
