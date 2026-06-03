import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import Post from '@/models/Post'

function excerptFromHtml(html: string, max = 200): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return text.length <= max ? text : text.slice(0, max).replace(/\s\S*$/, '') + '…'
}

export async function GET(req: NextRequest) {
  const user = requireAuth(req)
  await connectDB()
  const { searchParams } = req.nextUrl
  const status = searchParams.get('status') || ''
  const q = searchParams.get('q') || ''
  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const limit = Math.min(50, Number(searchParams.get('limit') || 20))

  const filter: Record<string, unknown> = { author: user.sub }
  if (status) filter.status = status
  if (q) filter.$text = { $search: q }

  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Post.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).select('-content').lean(),
    Post.countDocuments(filter),
  ])
  return NextResponse.json({ items, total, page, limit })
}

export async function POST(req: NextRequest) {
  const user = requireAuth(req)
  await connectDB()
  const body = await req.json()
  if (!body.title) return NextResponse.json({ error: 'title required' }, { status: 400 })

  const slug = await (Post as unknown as { uniqueSlug(t: string, a: string): Promise<string> }).uniqueSlug(
    body.slug || body.title,
    user.sub
  )
  const post = await Post.create({
    title: body.title,
    slug,
    subtitle: body.subtitle || '',
    excerpt: body.excerpt || excerptFromHtml(body.content || ''),
    content: body.content || '',
    contentType: body.contentType || 'html',
    coverImage: body.coverImage || '',
    coverImageAlt: body.coverImageAlt || '',
    tags: Array.isArray(body.tags) ? body.tags : [],
    status: body.status === 'published' ? 'published' : 'draft',
    seo: body.seo || {},
    author: user.sub,
    authorName: user.name || '',
    authorUsername: user.username || '',
  })
  return NextResponse.json(post, { status: 201 })
}
