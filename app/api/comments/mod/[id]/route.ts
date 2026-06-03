import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import Comment from '@/models/Comment'

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const user = requireAuth(req)
  const { id } = await params
  await connectDB()
  const { status } = await req.json()
  if (!['approved', 'spam', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }
  const comment = await Comment.findOneAndUpdate(
    { _id: id, publicationId: user.sub },
    { status },
    { new: true }
  )
  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(comment)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const user = requireAuth(req)
  const { id } = await params
  await connectDB()
  const out = await Comment.findOneAndDelete({ _id: id, publicationId: user.sub })
  if (!out) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
