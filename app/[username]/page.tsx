import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import Post from '@/models/Post'
import PostCard from '@/components/PostCard'
import { fontCss } from '@/lib/fonts'

const RESERVED = new Set([
  'admin', 'dashboard', 'login', 'signup', 'logout', 'about', 'api',
  'tag', 'p', 'rss', 'sitemap', 'robots', 'favicon', 'static', 'public',
  'demo',
])

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  await connectDB()
  const user = await User.findOne({ username: username.toLowerCase() }).lean()
  if (!user) return {}
  return {
    title: user.blogTitle || `${user.name}'s Blog`,
    description: user.blogDescription || `Writing by ${user.name}`,
  }
}

export default async function PublicBlogPage({ params, searchParams }: {
  params: Promise<{ username: string }>
  searchParams: Promise<{ page?: string; tag?: string; q?: string }>
}) {
  const { username } = await params
  if (RESERVED.has(username.toLowerCase())) notFound()

  await connectDB()
  const user = await User.findOne({ username: username.toLowerCase() }).lean()
  if (!user) notFound()

  const sp = await searchParams
  const page = Math.max(1, Number(sp.page || 1))
  const tag = sp.tag || ''
  const q = sp.q || ''
  const LIMIT = 9

  const filter: Record<string, unknown> = { author: user._id, status: 'published' }
  if (tag) filter.tags = tag
  if (q) filter.$text = { $search: q }

  const skip = (page - 1) * LIMIT
  const [items, total, allTags] = await Promise.all([
    Post.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(LIMIT).select('-content').lean(),
    Post.countDocuments(filter),
    Post.aggregate([
      { $match: { author: user._id, status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 12 },
    ]),
  ])

  const totalPages = Math.ceil(total / LIMIT) || 1
  const blogTitle = user.blogTitle || `${user.name}'s Blog`
  const featured = page === 1 && !q ? items[0] : null
  const rest = featured ? items.slice(1) : items

  return (
    <div className="max-w-wide mx-auto px-6 pb-20" style={{ fontFamily: fontCss(user.blogFont) }}>
      {/* Profile header */}
      <div className="flex items-start gap-5 pt-12 pb-10 border-b border-line mb-10">
        {user.avatar && (
          <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
        )}
        <div>
          <h1 className="font-serif font-semibold text-4xl tracking-tight">{blogTitle}</h1>
          {user.blogDescription && <p className="text-muted mt-2 text-lg">{user.blogDescription}</p>}
          <p className="text-muted-2 text-sm mt-1">by <span className="text-muted">@{user.username}</span></p>
        </div>
      </div>

      {/* Search + tags */}
      <div className="mb-8">
        <form method="GET" className="flex gap-2 mb-4 max-w-md">
          <input name="q" defaultValue={q} placeholder="Search…"
            className="flex-1 px-3.5 py-2.5 border border-line rounded-lg bg-bg text-fg text-sm focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10 transition-all" />
          <button type="submit"
            className="px-5 py-2.5 text-sm font-medium bg-accent text-bg rounded-full hover:opacity-90 transition-opacity">
            Search
          </button>
        </form>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Link href={`/${username}`}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all hover:no-underline ${!tag ? 'bg-accent text-bg border-accent' : 'bg-bg-soft text-muted border-line hover:bg-accent hover:text-bg hover:border-accent'}`}>
              All
            </Link>
            {allTags.map((t: { _id: string; count: number }) => (
              <Link key={t._id} href={`/${username}?tag=${encodeURIComponent(t._id)}`}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all hover:no-underline ${tag === t._id ? 'bg-accent text-bg border-accent' : 'bg-bg-soft text-muted border-line hover:bg-accent hover:text-bg hover:border-accent'}`}>
                {t._id}<span className="opacity-60">· {t.count}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="text-muted text-center py-20">{q ? `No results for "${q}".` : 'No posts yet.'}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {featured && <PostCard post={featured as unknown as Parameters<typeof PostCard>[0]['post']} href={`/${username}/${featured.slug}`} featured />}
          {rest.map((p) => <PostCard key={String(p._id)} post={p as unknown as Parameters<typeof PostCard>[0]['post']} href={`/${username}/${p.slug}`} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          {page > 1 && (
            <Link href={`/${username}?${new URLSearchParams({ ...(q && { q }), ...(tag && { tag }), page: String(page - 1) })}`}
              className="px-4 py-2 text-sm font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft hover:no-underline transition-all">
              ← Previous
            </Link>
          )}
          <span className="text-muted text-sm">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`/${username}?${new URLSearchParams({ ...(q && { q }), ...(tag && { tag }), page: String(page + 1) })}`}
              className="px-4 py-2 text-sm font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft hover:no-underline transition-all">
              Next →
            </Link>
          )}
        </div>
      )}

      {/* Subscribe */}
      <div className="mt-16 bg-bg-elev border border-line rounded-card-lg p-8 text-center max-w-md mx-auto">
        <h3 className="font-serif font-semibold text-2xl mb-2">Stay in the loop</h3>
        <p className="text-muted text-sm mb-5">Get new posts from {user.name} delivered to your inbox.</p>
        <form id="sub-form" onSubmit={undefined} className="flex gap-2">
          <input type="email" required placeholder="you@example.com" id="sub-email"
            className="flex-1 px-3.5 py-2.5 border border-line rounded-lg bg-bg text-fg text-sm focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10 transition-all" />
          <button type="submit"
            className="px-5 py-2.5 text-sm font-medium bg-accent text-bg rounded-full hover:opacity-90 transition-opacity whitespace-nowrap">
            Subscribe
          </button>
        </form>
        <script dangerouslySetInnerHTML={{ __html: `
          document.getElementById('sub-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('sub-email').value;
            const r = await fetch('/api/subscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, username: '${username}', source: 'blog' }) });
            const btn = this.querySelector('button');
            if (r.ok) { btn.textContent = 'Subscribed!'; btn.disabled = true; } else { alert('Subscription failed'); }
          });
        `}} />
      </div>
    </div>
  )
}
