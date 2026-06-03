'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartPoint { date: string; views: number }
interface TopPost { _id: string; title: string; slug: string; views: number; publishedAt: string }

export default function AnalyticsPage() {
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [topPosts, setTopPosts] = useState<TopPost[]>([])
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/analytics/chart?days=${days}`).then((r) => r.json()),
      fetch('/api/auth/me').then((r) => r.json()),
    ]).then(([data, me]) => {
      const points = (data.chartData || []).map((d: { date: string; views: number }) => ({
        date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        views: d.views,
      }))
      setChartData(points)
      setTopPosts(data.topPosts || [])
      setUsername(me?.username || '')
    }).finally(() => setLoading(false))
  }, [days])

  const totalViews = chartData.reduce((s, d) => s + d.views, 0)

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Analytics</h1>
        <select className="px-3 py-2 border border-line rounded-lg bg-bg text-fg text-sm focus:outline-none"
          value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-bg border border-line rounded-card-lg p-5">
          <div className="text-[11px] uppercase tracking-widest text-muted font-semibold mb-1.5">Views ({days}d)</div>
          <div className="font-serif text-3xl font-semibold">{totalViews.toLocaleString()}</div>
        </div>
        <div className="bg-bg border border-line rounded-card-lg p-5">
          <div className="text-[11px] uppercase tracking-widest text-muted font-semibold mb-1.5">Top post views</div>
          <div className="font-serif text-3xl font-semibold">{topPosts[0]?.views?.toLocaleString() || '—'}</div>
        </div>
        <div className="bg-bg border border-line rounded-card-lg p-5">
          <div className="text-[11px] uppercase tracking-widest text-muted font-semibold mb-1.5">Avg / day</div>
          <div className="font-serif text-3xl font-semibold">{chartData.length ? Math.round(totalViews / days).toLocaleString() : '—'}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-bg border border-line rounded-card-lg p-6 mb-8">
        <h2 className="text-sm font-semibold text-muted mb-4 uppercase tracking-wider">Daily views</h2>
        {loading ? (
          <div className="text-muted text-center py-16">Loading…</div>
        ) : chartData.length === 0 ? (
          <div className="text-muted text-center py-16 text-sm">No view data yet. Publish a post and share it!</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--muted)', fontWeight: 600 }}
                itemStyle={{ color: 'var(--accent-2)' }}
              />
              <Bar dataKey="views" fill="var(--accent-2)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top posts */}
      {topPosts.length > 0 && (
        <div className="bg-bg border border-line rounded-card-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-line">
            <h2 className="font-semibold text-sm">Top posts</h2>
          </div>
          {topPosts.map((p, i) => (
            <div key={p._id} className={`flex items-center gap-4 px-5 py-3.5 ${i !== 0 ? 'border-t border-line' : ''}`}>
              <span className="text-muted-2 text-sm font-mono w-5 flex-shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <a href={username ? `/${username}/${p.slug}` : '#'} target="_blank" rel="noreferrer"
                  className="text-sm font-medium text-fg hover:text-accent-2 hover:no-underline truncate block">{p.title}</a>
              </div>
              <span className="text-muted text-sm flex-shrink-0">{p.views.toLocaleString()} views</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
