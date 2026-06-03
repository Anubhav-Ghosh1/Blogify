'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const TipTapEditor = dynamic(() => import('./TipTapEditor'), { ssr: false })

interface PostForm {
  title: string; slug: string; subtitle: string; excerpt: string; content: string
  contentType: 'html' | 'markdown'
  coverImage: string; coverImageAlt: string; tags: string[]; status: 'draft' | 'published'
  seo: { metaTitle: string; metaDescription: string; canonicalUrl: string; ogImage: string }
}

const empty: PostForm = {
  title: '', slug: '', subtitle: '', excerpt: '', content: '',
  contentType: 'html',
  coverImage: '', coverImageAlt: '', tags: [], status: 'draft',
  seo: { metaTitle: '', metaDescription: '', canonicalUrl: '', ogImage: '' },
}

const AUTOSAVE_MS = 3000

export default function DashboardEditor({ id }: { id?: string }) {
  const router = useRouter()
  const [post, setPost] = useState<PostForm>(empty)
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [dirty, setDirty] = useState(false)
  const [username, setUsername] = useState('')
  const savedSnap = useRef(JSON.stringify(empty))
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => setUsername(d?.username || '')).catch(() => {})
  }, [])

  useEffect(() => {
    if (!id) { savedSnap.current = JSON.stringify(empty); return }
    fetch(`/api/posts/${id}`)
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data) => {
        const merged = { ...empty, ...data, seo: { ...empty.seo, ...(data.seo || {}) } }
        setPost(merged)
        savedSnap.current = JSON.stringify(merged)
      })
      .catch(() => setErr('Failed to load post'))
      .finally(() => setLoading(false))
  }, [id])

  function update(field: keyof PostForm, value: unknown) {
    setPost((p) => ({ ...p, [field]: value }))
    setDirty(true)
  }
  function updateSeo(field: keyof PostForm['seo'], value: string) {
    setPost((p) => ({ ...p, seo: { ...p.seo, [field]: value } }))
    setDirty(true)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 1800)
  }

  const save = useCallback(async (nextStatus?: 'published' | 'draft', opts = { silent: false }) => {
    if (!post.title.trim()) { if (!opts.silent) setErr('Title required'); return null }
    setErr(null); setSaving(true)
    const body = { ...post, ...(nextStatus ? { status: nextStatus } : {}) }
    try {
      const res = await fetch(id ? `/api/posts/${id}` : '/api/posts', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Save failed') }
      const data = await res.json()
      if (!id) { showToast('Created'); router.push(`/dashboard/edit/${data._id}`); return data }
      const merged = { ...empty, ...data, seo: { ...empty.seo, ...(data.seo || {}) } }
      setPost(merged); savedSnap.current = JSON.stringify(merged)
      if (!opts.silent) showToast(nextStatus === 'published' ? 'Published!' : nextStatus === 'draft' ? 'Unpublished' : 'Saved')
      setDirty(false); setLastSaved(new Date())
      return data
    } catch (e: unknown) {
      if (!opts.silent) setErr(e instanceof Error ? e.message : 'Save failed')
      return null
    } finally { setSaving(false) }
  }, [post, id, router])

  useEffect(() => {
    if (!id || !dirty || !post.title.trim()) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => {
      if (JSON.stringify(post) !== savedSnap.current) save(undefined, { silent: true })
    }, AUTOSAVE_MS)
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current) }
  }, [post, dirty, id, save])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [save])

  useEffect(() => {
    function warn(e: BeforeUnloadEvent) { if (dirty) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  async function uploadImage(file: File): Promise<string> {
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/upload/image', { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Upload failed')
    const { url } = await res.json()
    return url
  }

  async function uploadCover(file: File) {
    try { const url = await uploadImage(file); update('coverImage', url); showToast('Cover image uploaded') }
    catch { setErr('Cover upload failed'); showToast('Upload failed') }
  }

  function addTag() {
    const v = tagInput.trim().toLowerCase(); if (!v) return
    if (post.tags.includes(v)) { showToast('Tag already added'); setTagInput(''); return }
    update('tags', [...post.tags, v])
    setTagInput('')
    showToast(`Tag "${v}" added`)
  }

  function removeTag(t: string) {
    update('tags', post.tags.filter((x) => x !== t))
    showToast(`Tag "${t}" removed`)
  }

  async function sendNewsletter() {
    if (!id) return
    if (!confirm(`Send this post to your subscribers now?`)) return
    const res = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: id }) })
    const d = await res.json()
    if (res.ok) showToast(`Sent to ${d.sent} subscriber${d.sent !== 1 ? 's' : ''}`)
    else setErr(d.error || 'Send failed')
  }

  const publicUrl = post.slug && username ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${username}/${post.slug}` : ''

  if (loading) return <div className="text-muted text-center py-20">Loading…</div>

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold">{id ? 'Edit post' : 'New post'}</h1>
          <p className="text-muted text-xs mt-1">
            {saving ? 'Saving…' : dirty ? 'Unsaved changes' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : id ? 'Up to date' : 'Draft'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {post.status === 'published' && id && (
            <button onClick={sendNewsletter} className="px-3.5 py-1.5 text-sm font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft transition-all">
              📧 Send newsletter
            </button>
          )}
          <button onClick={() => save()} disabled={saving}
            className="px-3.5 py-1.5 text-sm font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft disabled:opacity-50 transition-all">
            {saving ? 'Saving…' : 'Save'}
          </button>
          {post.status === 'published' ? (
            <button onClick={() => save('draft')} disabled={saving}
              className="px-4 py-1.5 text-sm font-medium bg-accent text-bg rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity">
              Unpublish
            </button>
          ) : (
            <button onClick={() => save('published')} disabled={saving}
              className="px-4 py-1.5 text-sm font-medium bg-success text-white rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity">
              Publish
            </button>
          )}
        </div>
      </div>

      {err && <p className="text-danger text-sm mb-4">{err}</p>}

      <div className="grid xl:grid-cols-[1fr_300px] gap-6">
        {/* Editor */}
        <div className="space-y-3">
          <input
            className="w-full px-4 py-3.5 border border-line rounded-card bg-bg text-fg font-serif text-3xl font-semibold tracking-tight focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10 transition-all"
            placeholder="Title"
            value={post.title}
            onChange={(e) => update('title', e.target.value)}
          />
          <input
            className="w-full px-4 py-2.5 border border-line rounded-card bg-bg text-muted text-lg focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10 transition-all"
            placeholder="Subtitle (optional)"
            value={post.subtitle}
            onChange={(e) => update('subtitle', e.target.value)}
          />
          <TipTapEditor
            value={post.content}
            onChange={(html) => update('content', html)}
            onUploadImage={uploadImage}
            onAction={(msg) => showToast(msg)}
            placeholder="Start writing your post…"
          />
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <SideCard title="Status">
            <span className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full ${
              post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>{post.status}</span>
            {publicUrl && (
              <>
                <p className="text-[11px] uppercase tracking-wider text-muted font-semibold mt-3 mb-1.5">Public link</p>
                <div className="flex gap-1.5">
                  <input readOnly value={publicUrl} className="flex-1 min-w-0 px-2.5 py-1.5 border border-line rounded-lg bg-bg text-muted text-xs focus:outline-none" />
                  <button onClick={async () => { await navigator.clipboard.writeText(publicUrl); showToast('Public link copied') }}
                    className="px-2.5 py-1.5 text-xs border border-line-strong text-fg rounded-lg hover:bg-bg-soft transition-all">Copy</button>
                </div>
                {post.status === 'published' && (
                  <a href={publicUrl} target="_blank" rel="noreferrer" className="text-muted text-xs mt-2 block hover:text-fg hover:no-underline">Open ↗</a>
                )}
              </>
            )}
          </SideCard>

          <SideCard title="Slug">
            <input className="w-full px-3 py-2 border border-line rounded-lg bg-bg text-fg text-sm focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10"
              placeholder="auto from title" value={post.slug} onChange={(e) => update('slug', e.target.value)} />
          </SideCard>

          <SideCard title="Tags">
            <div className="flex gap-1.5">
              <input className="flex-1 min-w-0 px-3 py-2 border border-line rounded-lg bg-bg text-fg text-sm focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10"
                placeholder="add tag + Enter" value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }} />
              <button type="button" onClick={addTag} className="px-3 py-2 text-sm border border-line-strong text-fg rounded-lg hover:bg-bg-soft transition-all">Add</button>
            </div>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {post.tags.map((t) => (
                  <button key={t} type="button" onClick={() => removeTag(t)}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-bg-soft text-muted border border-line hover:bg-accent hover:text-bg hover:border-accent transition-all cursor-pointer">
                    {t} ×
                  </button>
                ))}
              </div>
            )}
          </SideCard>

          <SideCard title="Cover image">
            {post.coverImage && <img src={post.coverImage} alt="" className="w-full rounded-lg mb-2" />}
            <div className="flex gap-1.5">
              <label className="px-3 py-1.5 text-xs font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft transition-all cursor-pointer">
                {post.coverImage ? 'Replace' : 'Upload'}
                <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f) }} />
              </label>
              {post.coverImage && (
                <button type="button" onClick={() => { update('coverImage', ''); showToast('Cover removed') }}
                  className="px-3 py-1.5 text-xs font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft transition-all">Remove</button>
              )}
            </div>
            <input className="w-full mt-2 px-3 py-2 border border-line rounded-lg bg-bg text-fg text-sm focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10"
              placeholder="Alt text" value={post.coverImageAlt} onChange={(e) => update('coverImageAlt', e.target.value)} />
          </SideCard>

          <SideCard title="Excerpt">
            <textarea className="w-full px-3 py-2 border border-line rounded-lg bg-bg text-fg text-sm resize-none focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10"
              rows={3} placeholder="Auto-generated if empty" value={post.excerpt} onChange={(e) => update('excerpt', e.target.value)} />
          </SideCard>

          <SideCard title="SEO">
            {(['metaTitle', 'metaDescription', 'canonicalUrl', 'ogImage'] as const).map((field) => (
              <div key={field}>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1 mt-3">
                  {field === 'metaTitle' ? 'Meta title' : field === 'metaDescription' ? 'Meta description' : field === 'canonicalUrl' ? 'Canonical URL' : 'OG image URL'}
                </label>
                {field === 'metaDescription' ? (
                  <textarea className="w-full px-3 py-2 border border-line rounded-lg bg-bg text-fg text-sm resize-none focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10"
                    rows={2} value={post.seo[field]} onChange={(e) => updateSeo(field, e.target.value)} />
                ) : (
                  <input className="w-full px-3 py-2 border border-line rounded-lg bg-bg text-fg text-sm focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10"
                    value={post.seo[field]} onChange={(e) => updateSeo(field, e.target.value)} />
                )}
              </div>
            ))}
          </SideCard>

          <div className="flex flex-col items-center gap-2 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-2/10 border border-accent-2/30 rounded-full text-[11px] text-accent-2 font-medium">
              <span>Save:</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-bg border border-line rounded shadow-sm text-fg">⌘</kbd>
              <span className="text-muted-2">+</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-bg border border-line rounded shadow-sm text-fg">S</kbd>
            </div>
            <p className="text-muted-2 text-[10px]">Autosaves every 3s while editing</p>
          </div>
        </aside>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-toast">
          <div className="flex items-center gap-2.5 bg-bg-elev border border-line shadow-lg rounded-full pl-3 pr-5 py-2.5 min-w-[180px]">
            <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-success/15 text-success flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 8 6.5 11.5 13 5" /></svg>
            </span>
            <span className="text-sm font-medium text-fg">{toast}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-line rounded-card bg-bg p-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">{title}</h3>
      {children}
    </div>
  )
}
