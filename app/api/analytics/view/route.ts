import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Analytics from '@/models/Analytics'
import Post from '@/models/Post'

export async function POST(req: NextRequest) {
  await connectDB()
  const { postId } = await req.json()
  if (!postId) return NextResponse.json({ ok: false }, { status: 400 })

  const post = await Post.findById(postId).select('author').lean()
  if (!post) return NextResponse.json({ ok: false }, { status: 404 })

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  await Promise.all([
    Analytics.findOneAndUpdate(
      { postId, date: today },
      { $inc: { views: 1 }, $setOnInsert: { publicationId: post.author } },
      { upsert: true }
    ),
    Post.updateOne({ _id: postId }, { $inc: { views: 1 } }),
  ])

  return NextResponse.json({ ok: true })
}
