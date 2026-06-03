import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Comment from '@/models/Comment'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  await connectDB()
  const { postId } = await params
  const comments = await Comment.find({ postId, status: 'approved' })
    .sort({ createdAt: 1 })
    .select('name content createdAt')
    .lean()
  return NextResponse.json(comments)
}
