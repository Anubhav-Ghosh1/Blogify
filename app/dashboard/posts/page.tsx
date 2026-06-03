'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface Post {
  _id: string
  title: string
  slug: string
  status: string
  tags: string[]
  views: number
  updatedAt: string
}

function PostsContent() {
  const sp = useSearchParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState(sp.get('status') || '')
  const [q, setQ] = useState('')
  const [username, setUsername] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (q) params.set('q', q)
    Promise.all([
      fetch(`/api/posts?${params}`).then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ]).then(([data, me]) => {
      setPosts(data.items || [])
      setTotal(data.total || 0)
      setUsername(me?.username || '')
    }).finally(() => setLoading(false))
  }, [statusFilter, q])

  useEffect(() => { load() }, [load])

  async function remove(id: string) {
    if (!confirm('Delete this post permanently?')) return
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Posts <span className="text-muted font-sans text-xl">{total > 0 ? `(${total})` : ''}</span></h1>
        <Link href="/dashboard/new"
          className="inline-flex items-center px-4 py-2 text-sm font-medium bg-accent text-bg rounded-full hover:opacity-90 hover:no-underline transition-opacity">
          + New post
        </Link>
      </div>

      <div className="flex gap-2.5 flex-wrap mb-5">
        <form onSubmit={(e) => { e.preventDefault(); load() }} className="flex gap-2 flex-1 min-w-48">
          <input className="flex-1 px-3.5 py-2 border border-line rounded-lg bg-bg text-fg text-sm focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10"
            placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="submit" className="px-4 py-2 text-sm font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft transition-all">Search</button>
        </form>
        <select className="px-3 py-2 border border-line rounded-lg bg-bg text-fg text-sm focus:outline-none focus:border-accent-2"
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      {loading ? (
        <div className="text-muted text-center py-16">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="text-muted text-center py-16">
          No posts. <Link href="/dashboard/new" className="text-accent-2 hover:underline">Write one →</Link>
        </div>
      ) : (
        <div className="border border-line rounded-card bg-bg overflow-hidden">
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
                    <Link href={`/dashboard/edit/${p._id}`} className="font-medium text-fg hover:text-accent-2 hover:no-underline">{p.title || '(untitled)'}</Link>
                    {username && <div className="text-muted-2 text-xs mt-0.5">/{username}/{p.slug}</div>}
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
                      {p.status === 'published' && username && (
                        <a href={`/${username}/${p.slug}`} target="_blank" rel="noreferrer"
                          className="px-3 py-1.5 text-xs font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft hover:no-underline transition-all">View</a>
                      )}
                      <Link href={`/dashboard/edit/${p._id}`}
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

export default function PostsPage() {
  return <Suspense><PostsContent /></Suspense>
}
