import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Post from '@/models/Post'

export async function GET() {
  await connectDB()
  const tags = await Post.aggregate([
    { $match: { status: 'published' } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ])
  return NextResponse.json(tags.map((t) => ({ tag: t._id, count: t.count })))
}
