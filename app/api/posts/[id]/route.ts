import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import Post from '@/models/Post'

type Params = { params: Promise<{ id: string }> }

function excerptFromHtml(html: string, max = 200): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return text.length <= max ? text : text.slice(0, max).replace(/\s\S*$/, '') + '…'
}

export async function GET(req: NextRequest, { params }: Params) {
  const user = requireAuth(req)
  const { id } = await params
  await connectDB()
  const post = await Post.findOne({ _id: id, author: user.sub })
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const user = requireAuth(req)
  const { id } = await params
  await connectDB()
  const post = await Post.findOne({ _id: id, author: user.sub })
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const body = await req.json()
  if (body.slug && body.slug !== post.slug) {
    post.slug = await (Post as unknown as { uniqueSlug(s: string, a: string, id: string): Promise<string> }).uniqueSlug(
      body.slug, user.sub, id
    )
  } else if (body.title && body.title !== post.title && !body.slug) {
    post.slug = await (Post as unknown as { uniqueSlug(s: string, a: string, id: string): Promise<string> }).uniqueSlug(
      body.title, user.sub, id
    )
  }

  const fields = ['title', 'subtitle', 'excerpt', 'content', 'contentType', 'coverImage', 'coverImageAlt', 'tags', 'status', 'seo'] as const
  for (const f of fields) if (f in body) (post as unknown as Record<string, unknown>)[f] = body[f]
  if (!post.excerpt && post.content) post.excerpt = excerptFromHtml(post.content)
  await post.save()
  return NextResponse.json(post)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const user = requireAuth(req)
  const { id } = await params
  await connectDB()
  const out = await Post.findOneAndDelete({ _id: id, author: user.sub })
  if (!out) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
