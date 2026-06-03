import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import Comment from '@/models/Comment'

export async function GET(req: NextRequest) {
  const user = requireAuth(req)
  await connectDB()
  const status = req.nextUrl.searchParams.get('status') || 'pending'
  const comments = await Comment.find({ publicationId: user.sub, status })
    .sort({ createdAt: -1 })
    .populate('postId', 'title slug')
    .lean()
  return NextResponse.json(comments)
}
