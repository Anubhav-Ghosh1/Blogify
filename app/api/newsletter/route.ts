import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import Post from '@/models/Post'
import Subscriber from '@/models/Subscriber'
import User from '@/models/User'
import { getResend, newsletterHtml } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const user = requireAuth(req)
  await connectDB()
  const { postId } = await req.json()
  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 })

  const [post, author, subscribers] = await Promise.all([
    Post.findOne({ _id: postId, author: user.sub, status: 'published' }).lean(),
    User.findById(user.sub).lean(),
    Subscriber.find({ publicationId: user.sub, unsubscribedAt: null }).select('email').lean(),
  ])

  if (!post) return NextResponse.json({ error: 'Post not found or not published' }, { status: 404 })
  if (!subscribers.length) return NextResponse.json({ sent: 0 })

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
  const postUrl = `${siteUrl}/${author?.username}/${post.slug}`
  const blogTitle = author?.blogTitle || author?.name || 'Blog'

  const emailsToSend = subscribers.map((s) => ({
    from: `${blogTitle} <newsletter@${process.env.RESEND_DOMAIN || 'resend.dev'}>`,
    to: s.email,
    subject: post.title,
    html: newsletterHtml({
      postTitle: post.title,
      postExcerpt: post.excerpt || '',
      postUrl,
      authorName: author?.name || user.name,
      blogTitle,
      unsubUrl: `${siteUrl}/api/subscribe/unsubscribe?email=${encodeURIComponent(s.email)}&pub=${user.sub}`,
    }),
  }))

  // Resend batch — max 100 per call
  let sent = 0
  for (let i = 0; i < emailsToSend.length; i += 100) {
    const batch = emailsToSend.slice(i, i + 100)
    await getResend().batch.send(batch)
    sent += batch.length
  }

  return NextResponse.json({ sent })
}
