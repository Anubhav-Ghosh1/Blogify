import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import Post from '@/models/Post'

export async function GET(req: NextRequest) {
  requireAuth(req)
  await connectDB()
  const [total, drafts, published, viewsAgg] = await Promise.all([
    Post.countDocuments({}),
    Post.countDocuments({ status: 'draft' }),
    Post.countDocuments({ status: 'published' }),
    Post.aggregate([{ $group: { _id: null, v: { $sum: '$views' } } }]),
  ])
  return NextResponse.json({ totalPosts: total, drafts, published, totalViews: viewsAgg[0]?.v || 0 })
}
