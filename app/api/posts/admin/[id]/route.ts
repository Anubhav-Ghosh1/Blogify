import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import Post from '@/models/Post'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  requireAuth(req)
  const { id } = await params
  await connectDB()
  const post = await Post.findById(id)
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(post)
}
