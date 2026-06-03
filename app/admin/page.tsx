'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Post {
  _id: string; title: string; slug: string; status: string
  tags: string[]; updatedAt: string; views: number
}
interface Stats { totalPosts: number; drafts: number; published: number; totalViews: number }

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [q, setQ] = useState('')

  function load() {
    setLoading(true)
    const sp = new URLSearchParams()
    if (statusFilter) sp.set('status', statusFilter)
    if (q) sp.set('q', q)
    Promise.all([
      fetch(`/api/posts/admin/all?${sp}`).then((r) => r.json()),
      fetch('/api/posts/admin/stats').then((r) => r.json()),
    ])
      .then(([p, s]) => { setPosts(p); setStats(s) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [statusFilter]) // eslint-disable-line

  async function remove(id: string) {
    if (!confirm('Delete this post permanently?')) return
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap gap-3 mb-5">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Dashboard</h1>
        <Link href="/admin/new"
          className="inline-flex items-center px-4 py-2 text-sm font-medium bg-accent text-bg rounded-full hover:opacity-90 hover:no-underline transition-opacity">
          + New post
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total posts', value: stats.totalPosts },
            { label: 'Published', value: stats.published },
            { label: 'Drafts', value: stats.drafts },
            { label: 'Total views', value: stats.totalViews.toLocaleString() },
          ].map((s) => (
            <div key={s.label} className="bg-bg-elev border border-line rounded-card p-5">
              <div className="text-[11px] uppercase tracking-widest text-muted font-semibold mb-1.5">{s.label}</div>
              <div className="font-serif text-3xl font-semibold text-fg">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2.5 flex-wrap mb-5">
        <form onSubmit={(e) => { e.preventDefault(); load() }} className="flex gap-2 flex-1 min-w-48">
          <input className="flex-1 px-3.5 py-2 border border-line rounded-lg bg-bg text-fg text-sm focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10"
            placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="submit" className="px-4 py-2 text-sm font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft transition-all">Search</button>
        </form>
        <select className="px-3 py-2 border border-line rounded-lg bg-bg text-fg text-sm focus:outline-none focus:border-accent-2"
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      {loading ? (
        <div className="text-muted text-center py-16">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="text-muted text-center py-16">
          No posts yet. <Link href="/admin/new" className="text-accent-2 hover:underline">Write your first one →</Link>
        </div>
      ) : (
        <div className="border border-line rounded-card bg-bg-elev overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-bg-soft text-left">
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted font-semibold">Title</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted font-semibold">Status</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted font-semibold hidden md:table-cell">Tags</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted font-semibold hidden md:table-cell">Updated</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted font-semibold hidden md:table-cell">Views</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {posts.map((p) => (
                <tr key={p._id} className="hover:bg-bg-soft transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/edit/${p._id}`} className="font-medium text-fg hover:text-accent-2 hover:no-underline">{p.title || '(untitled)'}</Link>
                    <div className="text-muted text-xs mt-0.5">/p/{p.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full ${
                      p.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(p.tags || []).slice(0, 3).map((t) => (
                        <span key={t} className="px-2 py-0.5 text-[11px] rounded-full bg-bg-soft text-muted border border-line">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted hidden md:table-cell">{new Date(p.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-muted hidden md:table-cell">{(p.views || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {p.status === 'published' && (
                        <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer"
                          className="px-3 py-1.5 text-xs font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft hover:no-underline transition-all">View</a>
                      )}
                      <Link href={`/admin/edit/${p._id}`}
                        className="px-3 py-1.5 text-xs font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft hover:no-underline transition-all">Edit</Link>
                      <button onClick={() => remove(p._id)}
                        className="px-3 py-1.5 text-xs font-medium text-danger border border-line-strong rounded-full hover:bg-danger hover:text-white hover:border-danger transition-all cursor-pointer">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
