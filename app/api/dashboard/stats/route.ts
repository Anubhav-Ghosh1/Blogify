import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import Post from '@/models/Post'
import Subscriber from '@/models/Subscriber'
import Comment from '@/models/Comment'

export async function GET(req: NextRequest) {
  const user = requireAuth(req)
  await connectDB()
  const authorId = new mongoose.Types.ObjectId(user.sub)

  const [totalPosts, published, drafts, viewsAgg, subscribers, pendingComments] = await Promise.all([
    Post.countDocuments({ author: authorId }),
    Post.countDocuments({ author: authorId, status: 'published' }),
    Post.countDocuments({ author: authorId, status: 'draft' }),
    Post.aggregate([{ $match: { author: authorId } }, { $group: { _id: null, total: { $sum: '$views' } } }]),
    Subscriber.countDocuments({ publicationId: authorId, unsubscribedAt: null }),
    Comment.countDocuments({ publicationId: authorId, status: 'pending' }),
  ])

  const totalViews = viewsAgg[0]?.total || 0
  return NextResponse.json({ totalPosts, published, drafts, totalViews, subscribers, pendingComments })
}
