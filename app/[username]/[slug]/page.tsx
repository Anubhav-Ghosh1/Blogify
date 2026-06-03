import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import Post from '@/models/Post'
import { renderMarkdown } from '@/lib/markdown'
import PostCard from '@/components/PostCard'
import ProgressBar from '@/components/ProgressBar'
import PostContent from '@/components/PostContent'
import CopyLink from '@/components/CopyLink'
import CommentSection from '@/components/CommentSection'
import { fontCss } from '@/lib/fonts'

type Props = { params: Promise<{ username: string; slug: string }> }

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params
  await connectDB()
  const user = await User.findOne({ username: username.toLowerCase() }).lean()
  if (!user) return { title: 'Not Found' }
  const post = await Post.findOne({ author: user._id, slug, status: 'published' }).lean()
  if (!post) return { title: 'Not Found' }

  const title = post.seo?.metaTitle || post.title
  const description = post.seo?.metaDescription || post.excerpt || post.subtitle || ''
  const image = post.seo?.ogImage || post.coverImage || ''
  const url = `${siteUrl}/${username}/${slug}`

  return {
    title,
    description,
    alternates: { canonical: post.seo?.canonicalUrl || url },
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      images: image ? [{ url: image, alt: title }] : [],
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: (post.updatedAt as Date)?.toISOString(),
      authors: [post.authorName || user.name],
      tags: post.tags,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : [],
    },
  }
}

export default async function PublicPostPage({ params }: Props) {
  const { username, slug } = await params
  await connectDB()
  const user = await User.findOne({ username: username.toLowerCase() }).lean()
  if (!user) notFound()

  const post = await Post.findOne({ author: user._id, slug, status: 'published' }).lean()
  if (!post) notFound()

  Post.updateOne({ _id: post._id }, { $inc: { views: 1 } }).catch(() => {})

  const related = await Post.find({
    author: user._id,
    _id: { $ne: post._id },
    status: 'published',
    tags: { $in: post.tags || [] },
  })
    .sort({ publishedAt: -1 })
    .limit(3)
    .select('title slug excerpt subtitle coverImage tags publishedAt readingTime')
    .lean()

  const html = post.contentType === 'markdown'
    ? renderMarkdown(post.content || '')
    : (post.content || '')

  const url = `${siteUrl}/${username}/${slug}`
  const blogTitle = user.blogTitle || `${user.name}'s Blog`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seo?.metaDescription || post.excerpt || '',
    image: (post.seo?.ogImage || post.coverImage) ? [post.seo?.ogImage || post.coverImage] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Person', name: post.authorName || user.name },
    publisher: { '@type': 'Organization', name: blogTitle },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: (post.tags || []).join(', '),
  }

  return (
    <div style={{ fontFamily: fontCss(user.blogFont) }}>
      <ProgressBar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <div className="max-w-content mx-auto px-5 pt-6">
        <Link href={`/${username}`} className="text-muted text-sm hover:text-fg hover:no-underline transition-colors">
          ← {blogTitle}
        </Link>
      </div>

      <article className="max-w-content mx-auto px-5 py-6 pb-20">
        <header className="mb-7">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-3">{post.title}</h1>
          {post.subtitle && <p className="text-muted text-xl leading-snug mb-6">{post.subtitle}</p>}
          <div className="flex flex-wrap items-center gap-3.5 text-muted text-sm py-4 border-t border-b border-line">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <span className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-2 to-accent text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {(user.name || 'A').slice(0, 1).toUpperCase()}
              </span>
            )}
            <Link href={`/${username}`} className="font-medium text-fg hover:text-accent-2 hover:no-underline">{user.name}</Link>
            <span>·</span>
            <time dateTime={new Date(post.publishedAt || post.createdAt).toISOString()}>
              {new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
            <span>·</span>
            <span>{post.readingTime || 1} min read</span>
            {(post.views ?? 0) > 0 && <><span>·</span><span>{post.views!.toLocaleString()} views</span></>}
          </div>
        </header>

        {post.coverImage && (
          <div className="relative w-full rounded-card-lg overflow-hidden mb-8 shadow">
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt || post.title}
              width={1200}
              height={630}
              className="w-full object-cover max-h-[520px]"
              priority
            />
          </div>
        )}

        <PostContent html={html} />

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-9">
            {post.tags.map((t) => (
              <Link key={t} href={`/${username}?tag=${encodeURIComponent(t)}`}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-bg-soft text-muted border border-line hover:bg-accent hover:text-bg hover:border-accent hover:no-underline transition-all">
                {t}
              </Link>
            ))}
          </div>
        )}

        <ShareRow url={url} title={post.title} />

        {/* Comments */}
        <CommentSection postId={String(post._id)} />

        {/* Subscribe */}
        <div className="my-10 bg-bg-elev border border-line rounded-card-lg p-7 text-center">
          <h3 className="font-serif font-semibold text-2xl mb-1">Enjoyed this?</h3>
          <p className="text-muted text-sm mb-5">Subscribe to get new posts from {user.name} in your inbox.</p>
          <form id="post-sub-form" className="flex gap-2 max-w-sm mx-auto">
            <input type="email" required placeholder="you@example.com" id="post-sub-email"
              className="flex-1 px-3.5 py-2.5 border border-line rounded-lg bg-bg text-fg text-sm focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10 transition-all" />
            <button type="submit"
              className="px-5 py-2.5 text-sm font-medium bg-accent text-bg rounded-full hover:opacity-90 transition-opacity whitespace-nowrap">
              Subscribe
            </button>
          </form>
          <script dangerouslySetInnerHTML={{ __html: `
            document.getElementById('post-sub-form').addEventListener('submit', async function(e) {
              e.preventDefault();
              const email = document.getElementById('post-sub-email').value;
              const r = await fetch('/api/subscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, username: '${username}', source: 'post' }) });
              const btn = this.querySelector('button');
              if (r.ok) { btn.textContent = 'Subscribed!'; btn.disabled = true; } else { alert('Subscription failed'); }
            });
          `}} />
        </div>

        {related.length > 0 && (
          <section className="mt-10">
            <h3 className="font-serif text-2xl font-semibold tracking-tight mb-5">Read next</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <PostCard key={String(p._id)} post={p as unknown as Parameters<typeof PostCard>[0]['post']} href={`/${username}/${p.slug}`} />
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  )
}

function ShareRow({ url, title }: { url: string; title: string }) {
  const enc = encodeURIComponent
  return (
    <div className="flex flex-wrap items-center gap-2 py-5 border-t border-b border-line my-10">
      <span className="text-sm text-muted font-medium mr-1">Share</span>
      <CopyLink url={url} />
      <a className="px-3.5 py-1.5 text-xs font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft hover:no-underline transition-all"
        target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`}>X / Twitter</a>
      <a className="px-3.5 py-1.5 text-xs font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft hover:no-underline transition-all"
        target="_blank" rel="noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`}>LinkedIn</a>
      <a className="px-3.5 py-1.5 text-xs font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft hover:no-underline transition-all"
        target="_blank" rel="noreferrer" href={`https://news.ycombinator.com/submitlink?u=${enc(url)}&t=${enc(title)}`}>Hacker News</a>
    </div>
  )
}
