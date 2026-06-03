'use client'

import { useEffect, useState } from 'react'

interface Sub { _id: string; email: string; source: string; createdAt: string }

export default function AdminSubscribers() {
  const [items, setItems] = useState<Sub[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    fetch('/api/subscribe/admin/list').then((r) => r.json()).then(setItems).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function remove(id: string) {
    if (!confirm('Remove this subscriber?')) return
    await fetch(`/api/subscribe/admin/${id}`, { method: 'DELETE' })
    load()
  }

  function exportCsv() {
    window.open('/api/subscribe/admin/export.csv', '_blank')
  }

  return (
    <div>
      <div className="flex justify-between items-center flex-wrap gap-3 mb-2">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Subscribers</h1>
          <p className="text-muted text-sm mt-1">{items.length} active subscriber{items.length === 1 ? '' : 's'}</p>
        </div>
        <button onClick={exportCsv} disabled={items.length === 0}
          className="px-4 py-2 text-sm font-medium bg-accent text-bg rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity">
          Export CSV
        </button>
      </div>

      <hr className="border-line my-6" />

      {loading ? (
        <div className="text-muted text-center py-16">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-muted text-center py-16">No subscribers yet. Embed the newsletter form to collect emails.</div>
      ) : (
        <div className="border border-line rounded-card bg-bg-elev overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-bg-soft">
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-muted font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-muted font-semibold hidden md:table-cell">Source</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-muted font-semibold hidden md:table-cell">Subscribed</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((s) => (
                <tr key={s._id} className="hover:bg-bg-soft transition-colors">
                  <td className="px-4 py-3">
                    <a href={`mailto:${s.email}`} className="text-fg hover:text-accent-2 hover:no-underline">{s.email}</a>
                  </td>
                  <td className="px-4 py-3 text-muted hidden md:table-cell">{s.source}</td>
                  <td className="px-4 py-3 text-muted hidden md:table-cell">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(s._id)}
                      className="px-3 py-1.5 text-xs font-medium text-danger border border-line-strong rounded-full hover:bg-danger hover:text-white hover:border-danger transition-all cursor-pointer">
                      Remove
                    </button>
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
