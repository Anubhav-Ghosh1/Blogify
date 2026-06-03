import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import Post from '@/models/Post'

export async function GET(req: NextRequest) {
  requireAuth(req)
  await connectDB()
  const { searchParams } = req.nextUrl
  const status = searchParams.get('status') || ''
  const q = searchParams.get('q') || ''
  const filter: Record<string, unknown> = {}
  if (status) filter.status = status
  if (q) filter.$text = { $search: q }
  const items = await Post.find(filter).sort({ updatedAt: -1 }).select('-content')
  return NextResponse.json(items)
}
