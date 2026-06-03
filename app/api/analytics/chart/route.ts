import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import Analytics from '@/models/Analytics'
import Post from '@/models/Post'

export async function GET(req: NextRequest) {
  const user = requireAuth(req)
  await connectDB()
  const days = Math.min(90, Number(req.nextUrl.searchParams.get('days') || 30))
  const pubId = new mongoose.Types.ObjectId(user.sub)

  const since = new Date()
  since.setUTCDate(since.getUTCDate() - days)
  since.setUTCHours(0, 0, 0, 0)

  const [chartData, topPosts] = await Promise.all([
    Analytics.aggregate([
      { $match: { publicationId: pubId, date: { $gte: since } } },
      { $group: { _id: '$date', views: { $sum: '$views' } } },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', views: 1, _id: 0 } },
    ]),
    Post.find({ author: pubId, status: 'published' })
      .sort({ views: -1 })
      .limit(5)
      .select('title slug views publishedAt')
      .lean(),
  ])

  return NextResponse.json({ chartData, topPosts })
}
