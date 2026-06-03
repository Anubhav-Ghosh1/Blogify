import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import Post from '@/models/Post'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  await connectDB()
  const { username } = await params
  const user = await User.findOne({ username: username.toLowerCase() }).select('-passwordHash').lean()
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const postCount = await Post.countDocuments({ author: user._id, status: 'published' })
  return NextResponse.json({ ...user, postCount })
}
