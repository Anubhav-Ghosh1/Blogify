'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  totalPosts: number
  published: number
  drafts: number
  totalViews: number
  subscribers: number
  pendingComments: number
}

interface Post {
  _id: string
  title: string
  slug: string
  status: string
  views: number
  publishedAt: string | null
}

export default function DashboardHome() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [username, setUsername] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/stats').then((r) => r.json()),
      fetch('/api/posts?limit=5').then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ]).then(([s, p, me]) => {
      setStats(s)
      setRecentPosts(p.items || [])
      setUsername(me?.username || '')
    }).catch(() => {})
  }, [])

  const statCards = stats ? [
    { label: 'Published', value: stats.published, href: '/dashboard/posts?status=published' },
    { label: 'Drafts', value: stats.drafts, href: '/dashboard/posts?status=draft' },
    { label: 'Total views', value: stats.totalViews.toLocaleString(), href: '/dashboard/analytics' },
    { label: 'Subscribers', value: stats.subscribers, href: '/dashboard/subscribers' },
  ] : []

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-7">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Overview</h1>
        <Link href="/dashboard/new"
          className="inline-flex items-center px-4 py-2 text-sm font-medium bg-accent text-bg rounded-full hover:opacity-90 hover:no-underline transition-opacity">
          + New post
        </Link>
      </div>

      {stats?.pendingComments ? (
        <div className="mb-5 flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-card px-4 py-3">
          <span className="text-amber-600 dark:text-amber-400 text-sm font-medium">
            {stats.pendingComments} comment{stats.pendingComments !== 1 ? 's' : ''} awaiting moderation
          </span>
          <Link href="/dashboard/comments" className="text-amber-700 dark:text-amber-300 text-sm font-semibold hover:underline ml-auto">
            Review →
          </Link>
        </div>
      ) : null}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href}
            className="bg-bg border border-line rounded-card-lg p-5 hover:border-line-strong hover:no-underline transition-all">
            <div className="text-[11px] uppercase tracking-widest text-muted font-semibold mb-1.5">{s.label}</div>
            <div className="font-serif text-3xl font-semibold text-fg">{s.value}</div>
          </Link>
        ))}
      </div>

      {/* Recent posts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Recent posts</h2>
          <Link href="/dashboard/posts" className="text-accent-2 text-sm hover:underline">All posts →</Link>
        </div>
        {recentPosts.length === 0 ? (
          <div className="bg-bg border border-line rounded-card-lg p-10 text-center">
            <p className="text-muted mb-4">No posts yet.</p>
            <Link href="/dashboard/new"
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium bg-accent text-bg rounded-full hover:opacity-90 hover:no-underline transition-opacity">
              Write your first post
            </Link>
          </div>
        ) : (
          <div className="bg-bg border border-line rounded-card-lg overflow-hidden">
            {recentPosts.map((p, i) => (
              <div key={p._id} className={`flex items-center gap-4 px-5 py-3.5 ${i !== 0 ? 'border-t border-line' : ''} hover:bg-bg-soft transition-colors`}>
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/edit/${p._id}`} className="font-medium text-fg hover:text-accent-2 hover:no-underline text-sm truncate block">
                    {p.title || '(untitled)'}
                  </Link>
                  {username && (
                    <span className="text-muted-2 text-xs">/{username}/{p.slug}</span>
                  )}
                </div>
                <span className={`flex-shrink-0 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full ${
                  p.status === 'published'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>{p.status}</span>
                <span className="text-muted-2 text-xs flex-shrink-0">{p.views.toLocaleString()} views</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
