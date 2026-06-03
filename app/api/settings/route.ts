import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import User from '@/models/User'

export async function GET(req: NextRequest) {
  const user = requireAuth(req)
  await connectDB()
  const u = await User.findById(user.sub).select('-passwordHash').lean()
  if (!u) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(u)
}

export async function PUT(req: NextRequest) {
  const user = requireAuth(req)
  await connectDB()
  const body = await req.json()
  const allowed = ['name', 'bio', 'avatar', 'blogTitle', 'blogDescription', 'blogFont'] as const
  const update: Record<string, string> = {}
  for (const f of allowed) if (f in body) update[f] = String(body[f]).slice(0, 500)

  const u = await User.findByIdAndUpdate(user.sub, update, { new: true }).select('-passwordHash')
  return NextResponse.json(u)
}
