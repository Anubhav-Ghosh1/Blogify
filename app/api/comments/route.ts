import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Post from '@/models/Post'
import Comment from '@/models/Comment'

export async function POST(req: NextRequest) {
  await connectDB()
  const body = await req.json()
  const { postId, name, email, content } = body

  if (!postId || !name || !email || !content) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: 'Comment too long' }, { status: 400 })
  }

  const post = await Post.findOne({ _id: postId, status: 'published' }).lean()
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  const comment = await Comment.create({
    postId,
    publicationId: post.author,
    name: name.trim().slice(0, 100),
    email: email.toLowerCase().trim(),
    content: content.trim(),
    status: 'pending',
  })
  return NextResponse.json({ _id: comment._id, status: 'pending' }, { status: 201 })
}
