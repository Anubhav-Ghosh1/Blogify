'use client'

import { useEffect, useState } from 'react'
import { BLOG_FONTS, fontCss } from '@/lib/fonts'

interface Settings {
  name: string
  bio: string
  avatar: string
  blogTitle: string
  blogDescription: string
  blogFont: string
  username: string
}

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>({ name: '', bio: '', avatar: '', blogTitle: '', blogDescription: '', blogFont: 'serif', username: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => setForm({
        name: d.name || '',
        bio: d.bio || '',
        avatar: d.avatar || '',
        blogTitle: d.blogTitle || '',
        blogDescription: d.blogDescription || '',
        blogFont: d.blogFont || 'serif',
        username: d.username || '',
      }))
      .finally(() => setLoading(false))
  }, [])

  function set(field: keyof Settings, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setErr(null)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, bio: form.bio, avatar: form.avatar, blogTitle: form.blogTitle, blogDescription: form.blogDescription, blogFont: form.blogFont }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Save failed') }
      setToast('Settings saved')
      setTimeout(() => setToast(null), 2000)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Save failed')
    } finally { setSaving(false) }
  }

  async function uploadAvatar(file: File) {
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/upload/image', { method: 'POST', body: fd })
    if (!res.ok) { setErr('Upload failed'); return }
    const { url } = await res.json()
    set('avatar', url)
  }

  if (loading) return <div className="text-muted text-center py-20">Loading…</div>

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-3xl font-semibold tracking-tight mb-6">Settings</h1>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Avatar */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">Profile photo</label>
          <div className="flex items-center gap-4">
            {form.avatar ? (
              <img src={form.avatar} alt="" className="w-16 h-16 rounded-full object-cover border border-line" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-2 to-accent text-white flex items-center justify-center text-xl font-semibold flex-shrink-0">
                {(form.name || '?').slice(0, 1).toUpperCase()}
              </div>
            )}
            <label className="px-4 py-2 text-sm font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft transition-all cursor-pointer">
              Upload photo
              <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f) }} />
            </label>
            {form.avatar && (
              <button type="button" onClick={() => set('avatar', '')} className="px-4 py-2 text-sm font-medium border border-line-strong text-muted rounded-full hover:bg-bg-soft transition-all">
                Remove
              </button>
            )}
          </div>
        </div>

        <Field label="Display name">
          <input value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </Field>

        <Field label="Username (read-only)">
          <input value={`@${form.username}`} readOnly className="text-muted cursor-not-allowed" />
        </Field>

        <Field label="Blog title">
          <input value={form.blogTitle} onChange={(e) => set('blogTitle', e.target.value)} placeholder="My Blog" />
        </Field>

        <Field label="Blog description">
          <textarea value={form.blogDescription} onChange={(e) => set('blogDescription', e.target.value)}
            rows={2} placeholder="A short description of what you write about" />
        </Field>

        <Field label="Bio">
          <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)}
            rows={3} placeholder="Tell your readers a bit about yourself" />
        </Field>

        {/* Font picker */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">Blog font</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(BLOG_FONTS).map(([key, { name }]) => {
              const active = form.blogFont === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => set('blogFont', key)}
                  className={`text-left p-4 border rounded-card transition-all ${
                    active
                      ? 'border-accent-2 bg-accent-2/5 ring-2 ring-accent-2/20'
                      : 'border-line bg-bg hover:border-line-strong'
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-widest text-muted font-semibold mb-1">{name}</div>
                  <div className="text-xl text-fg leading-tight" style={{ fontFamily: fontCss(key) }}>
                    The quick brown fox
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {err && <p className="text-danger text-sm">{err}</p>}

        <button type="submit" disabled={saving}
          className="px-6 py-2.5 text-sm font-medium bg-accent text-bg rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity">
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </form>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-accent text-bg px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactElement }) {
  const cls = 'w-full px-3.5 py-2.5 border border-line rounded-card bg-bg text-fg text-[15px] focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10 transition-all'
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">{label}</label>
      {children.type === 'textarea'
        ? <textarea {...children.props as React.TextareaHTMLAttributes<HTMLTextAreaElement>} className={`${cls} resize-none`} />
        : <input {...children.props as React.InputHTMLAttributes<HTMLInputElement>} className={`${cls} ${(children.props as { className?: string }).className || ''}`} />}
    </div>
  )
}
