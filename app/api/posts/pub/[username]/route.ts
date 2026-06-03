import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import Post from '@/models/Post'

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  await connectDB()
  const { username } = await params
  const { searchParams } = req.nextUrl
  const tag = searchParams.get('tag') || ''
  const q = searchParams.get('q') || ''
  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const limit = Math.min(20, Number(searchParams.get('limit') || 9))

  const user = await User.findOne({ username: username.toLowerCase() }).lean()
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const filter: Record<string, unknown> = { author: user._id, status: 'published' }
  if (tag) filter.tags = tag
  if (q) filter.$text = { $search: q }

  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Post.find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit).select('-content').lean(),
    Post.countDocuments(filter),
  ])
  return NextResponse.json({ items, total, page, limit })
}
