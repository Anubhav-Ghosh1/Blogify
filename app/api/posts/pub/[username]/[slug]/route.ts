import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import Post from '@/models/Post'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ username: string; slug: string }> }) {
  await connectDB()
  const { username, slug } = await params
  const user = await User.findOne({ username: username.toLowerCase() }).lean()
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const post = await Post.findOne({ author: user._id, slug, status: 'published' }).lean()
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // increment views
  await Post.updateOne({ _id: post._id }, { $inc: { views: 1 } })

  return NextResponse.json(post)
}
