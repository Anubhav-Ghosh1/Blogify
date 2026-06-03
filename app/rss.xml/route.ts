import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Post from '@/models/Post'

function esc(s: string) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function GET() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
  const name = process.env.NEXT_PUBLIC_SITE_NAME || 'Blog'
  const desc = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Latest articles'

  await connectDB()
  const posts = await Post.find({ status: 'published' }).sort({ publishedAt: -1 }).limit(50)

  const items = posts.map((p) => {
    const url = `${siteUrl}/p/${p.slug}`
    return `<item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${(p.publishedAt || p.createdAt).toUTCString()}</pubDate>
      <description>${esc(p.excerpt || p.subtitle || '')}</description>
      ${(p.tags || []).map((t) => `<category>${esc(t)}</category>`).join('')}
    </item>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(name)}</title>
    <link>${siteUrl}</link>
    <description>${esc(desc)}</description>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
    },
  })
}
