'use client'

import { useEffect, useState } from 'react'

interface Subscriber {
  _id: string
  email: string
  source: string
  confirmed: boolean
  unsubscribedAt: string | null
  createdAt: string
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/subscribers')
      .then((r) => r.json())
      .then((d) => { setSubscribers(d.items || []); setTotal(d.total || 0) })
      .finally(() => setLoading(false))
  }, [])

  const active = subscribers.filter((s) => !s.unsubscribedAt)
  const unsub = subscribers.filter((s) => s.unsubscribedAt)

  function exportCsv() {
    const rows = [
      ['Email', 'Status', 'Source', 'Subscribed'],
      ...subscribers.map((s) => [
        s.email,
        s.unsubscribedAt ? 'unsubscribed' : 'active',
        s.source,
        new Date(s.createdAt).toLocaleDateString(),
      ])
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'subscribers.csv'; a.click()
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Subscribers</h1>
          <p className="text-muted text-sm mt-1">{active.length} active · {unsub.length} unsubscribed</p>
        </div>
        {total > 0 && (
          <button onClick={exportCsv}
            className="inline-flex items-center px-4 py-2 text-sm font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft transition-all">
            Export CSV
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-muted text-center py-16">Loading…</div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <p className="text-5xl mb-4">💌</p>
          <p>No subscribers yet. Share your blog to grow your list.</p>
        </div>
      ) : (
        <div className="bg-bg border border-line rounded-card-lg overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-bg-soft">
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted font-semibold text-left">Email</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted font-semibold text-left hidden md:table-cell">Source</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted font-semibold text-left hidden md:table-cell">Subscribed</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted font-semibold text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {subscribers.map((s) => (
                <tr key={s._id} className="hover:bg-bg-soft transition-colors">
                  <td className="px-4 py-3 font-medium text-fg">{s.email}</td>
                  <td className="px-4 py-3 text-muted hidden md:table-cell">{s.source}</td>
                  <td className="px-4 py-3 text-muted hidden md:table-cell">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full ${
                      s.unsubscribedAt
                        ? 'bg-bg-soft text-muted-2 border border-line'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {s.unsubscribedAt ? 'Unsubscribed' : 'Active'}
                    </span>
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
