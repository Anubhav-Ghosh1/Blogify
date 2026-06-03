import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Post from '@/models/Post'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params
  await connectDB()
  const post = await Post.findOne({ slug, status: 'published' })
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })

  Post.updateOne({ _id: post._id }, { $inc: { views: 1 } }).catch(() => {})

  const related = await Post.find({
    _id: { $ne: post._id },
    status: 'published',
    tags: { $in: post.tags || [] },
  })
    .sort({ publishedAt: -1 })
    .limit(3)
    .select('title slug excerpt subtitle coverImage tags publishedAt readingTime authorName')

  return NextResponse.json({ ...post.toObject(), related })
}
