'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { renderMarkdown, excerptFromMarkdown } from '@/lib/markdown'

interface PostForm {
  title: string; slug: string; subtitle: string; excerpt: string; content: string
  coverImage: string; coverImageAlt: string; tags: string[]; status: 'draft' | 'published'
  seo: { metaTitle: string; metaDescription: string; canonicalUrl: string; ogImage: string }
}

const empty: PostForm = {
  title: '', slug: '', subtitle: '', excerpt: '', content: '',
  coverImage: '', coverImageAlt: '', tags: [], status: 'draft',
  seo: { metaTitle: '', metaDescription: '', canonicalUrl: '', ogImage: '' },
}

const AUTOSAVE_MS = 2500

export default function AdminEditor({ id }: { id?: string }) {
  const router = useRouter()
  const [post, setPost] = useState<PostForm>(empty)
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [preview, setPreview] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [dirty, setDirty] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const savedSnap = useRef(JSON.stringify(empty))
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!id) { savedSnap.current = JSON.stringify(empty); return }
    fetch(`/api/posts/admin/${id}`)
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((data) => {
        const merged = { ...empty, ...data, seo: { ...empty.seo, ...(data.seo || {}) } }
        setPost(merged)
        savedSnap.current = JSON.stringify(merged)
      })
      .catch(() => setErr('Failed to load'))
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
    const body = { ...post, ...(nextStatus ? { status: nextStatus } : {}), excerpt: post.excerpt || excerptFromMarkdown(post.content) }
    try {
      const res = await fetch(id ? `/api/posts/${id}` : '/api/posts', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Save failed') }
      const data = await res.json()
      if (!id) { showToast('Created'); router.push(`/admin/edit/${data._id}`); return data }
      const merged = { ...empty, ...data, seo: { ...empty.seo, ...(data.seo || {}) } }
      setPost(merged); savedSnap.current = JSON.stringify(merged)
      if (!opts.silent) showToast(nextStatus === 'published' ? 'Published' : nextStatus === 'draft' ? 'Unpublished' : 'Saved')
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

  async function uploadFile(file: File, target: 'cover' | 'og' | 'inline') {
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch('/api/upload/image', { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Upload failed')
    const { url } = await res.json()
    if (target === 'cover') update('coverImage', url)
    else if (target === 'og') updateSeo('ogImage', url)
    else insertSnippet(`\n![](${url})\n`)
    showToast('Image uploaded')
  }

  function insertSnippet(snippet: string) {
    const ta = taRef.current; const cur = post.content || ''
    if (!ta) return update('content', cur + snippet)
    const s = ta.selectionStart ?? cur.length; const e = ta.selectionEnd ?? cur.length
    update('content', cur.slice(0, s) + snippet + cur.slice(e))
    requestAnimationFrame(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + snippet.length })
  }

  function wrap(pre: string, suf = pre) {
    const ta = taRef.current; const cur = post.content || ''
    if (!ta) return insertSnippet(pre + suf)
    const s = ta.selectionStart; const e = ta.selectionEnd; const sel = cur.slice(s, e)
    update('content', cur.slice(0, s) + pre + sel + suf + cur.slice(e))
    requestAnimationFrame(() => { ta.focus(); ta.selectionStart = s + pre.length; ta.selectionEnd = e + pre.length })
  }

  function addLink() {
    const url = window.prompt('URL (https://…)'); if (!url) return
    const ta = taRef.current; const cur = post.content || ''
    const s = ta?.selectionStart ?? cur.length; const e = ta?.selectionEnd ?? cur.length
    insertSnippet(`[${cur.slice(s, e) || 'link text'}](${url})`)
  }

  function addTag() {
    const v = tagInput.trim().toLowerCase(); if (!v) return
    if (!post.tags.includes(v)) update('tags', [...post.tags, v])
    setTagInput('')
  }

  const previewHtml = useMemo(() => renderMarkdown(post.content), [post.content])
  const wordCount = useMemo(() => (post.content || '').trim().split(/\s+/).filter(Boolean).length, [post.content])
  const publicUrl = post.slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${post.slug}` : ''

  if (loading) return <div className="text-muted text-center py-20">Loading…</div>

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold">{id ? 'Edit post' : 'New post'}</h1>
          <p className="text-muted text-xs mt-1">
            {saving ? 'Saving…' : dirty ? 'Unsaved changes' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : id ? 'Up to date' : 'Draft'}
            <span className="ml-3">{wordCount} words · {Math.max(1, Math.round(wordCount / 200))} min read</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreview((v) => !v)}
            className="px-3.5 py-1.5 text-sm font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft transition-all">
            {preview ? 'Edit' : 'Preview'}
          </button>
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

      <div className="grid xl:grid-cols-[1fr_320px] gap-7">
        {/* Editor */}
        <div>
          <input
            className="w-full px-4 py-3.5 border border-line rounded-card bg-bg text-fg font-serif text-3xl font-semibold tracking-tight focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10 transition-all"
            placeholder="Title"
            value={post.title}
            onChange={(e) => update('title', e.target.value)}
          />
          <input
            className="w-full px-4 py-2.5 border border-line rounded-card bg-bg text-muted text-lg focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10 transition-all mt-2.5"
            placeholder="Subtitle (optional)"
            value={post.subtitle}
            onChange={(e) => update('subtitle', e.target.value)}
          />

          {!preview ? (
            <div className="mt-3.5">
              {/* Toolbar */}
              <div className="flex flex-wrap gap-1 p-2 border border-line border-b-0 rounded-t-card bg-bg-soft">
                {[
                  ['Bold', () => wrap('**')],
                  ['Italic', () => wrap('_')],
                  ['Code', () => wrap('`')],
                  ['H2', () => insertSnippet('\n## Heading\n')],
                  ['H3', () => insertSnippet('\n### Heading\n')],
                  ['Quote', () => insertSnippet('\n> Quote\n')],
                  ['List', () => insertSnippet('\n- item\n- item\n')],
                  ['1. List', () => insertSnippet('\n1. item\n2. item\n')],
                  ['Code block', () => insertSnippet('\n```\ncode\n```\n')],
                  ['Divider', () => insertSnippet('\n---\n')],
                  ['Link', addLink],
                ].map(([label, fn]) => (
                  <button key={label as string} type="button" onClick={fn as () => void}
                    className="px-2.5 py-1 text-xs font-medium border border-line text-muted rounded-md hover:bg-bg hover:text-fg transition-all">
                    {label as string}
                  </button>
                ))}
                <label className="px-2.5 py-1 text-xs font-medium border border-line text-muted rounded-md hover:bg-bg hover:text-fg transition-all cursor-pointer">
                  Image
                  <input type="file" accept="image/*" hidden onChange={(e) => {
                    const f = e.target.files?.[0]; if (f) uploadFile(f, 'inline').catch(() => setErr('Upload failed')); e.target.value = ''
                  }} />
                </label>
              </div>
              {/* Textarea with drag-drop */}
              <div
                className={`relative ${dragOver ? 'ring-2 ring-accent-2' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={async (e) => {
                  e.preventDefault(); setDragOver(false)
                  const f = e.dataTransfer.files?.[0]
                  if (f?.type.startsWith('image/')) uploadFile(f, 'inline').catch(() => setErr('Upload failed'))
                }}
              >
                {dragOver && (
                  <div className="absolute inset-0 border-2 border-dashed border-accent-2 rounded-b-card bg-accent-2/5 flex items-center justify-center z-10 pointer-events-none">
                    <span className="text-accent-2 font-semibold text-sm">Drop image to upload</span>
                  </div>
                )}
                <textarea
                  ref={taRef}
                  className="w-full min-h-[420px] px-4 py-3.5 border border-line rounded-b-card bg-bg text-fg font-mono text-sm leading-relaxed resize-y focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10 transition-all"
                  placeholder="Write in Markdown… drag, drop, or paste images to upload."
                  value={post.content}
                  onChange={(e) => update('content', e.target.value)}
                  onPaste={async (e) => {
                    const items = e.clipboardData?.items || []
                    for (const item of items) {
                      if (item.kind === 'file' && item.type.startsWith('image/')) {
                        e.preventDefault()
                        const file = item.getAsFile()
                        if (file) uploadFile(file, 'inline').catch(() => setErr('Upload failed'))
                        return
                      }
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="mt-3.5 border border-line rounded-card p-6">
              <div className="prose" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          )}
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
                  <button onClick={async () => { await navigator.clipboard.writeText(publicUrl); showToast('Copied') }}
                    className="px-2.5 py-1.5 text-xs border border-line-strong text-fg rounded-lg hover:bg-bg-soft transition-all">Copy</button>
                </div>
                {post.status === 'published' && (
                  <a href={`/p/${post.slug}`} target="_blank" rel="noreferrer" className="text-muted text-xs mt-2 block hover:text-fg hover:no-underline">Open ↗</a>
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
              <button type="button" onClick={addTag}
                className="px-3 py-2 text-sm border border-line-strong text-fg rounded-lg hover:bg-bg-soft transition-all">Add</button>
            </div>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {post.tags.map((t) => (
                  <button key={t} type="button" onClick={() => update('tags', post.tags.filter((x) => x !== t))}
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
                <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f, 'cover').catch(() => setErr('Upload failed')) }} />
              </label>
              {post.coverImage && (
                <button type="button" onClick={() => update('coverImage', '')}
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

          <SideCard title="SEO & metadata">
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
                    placeholder={field === 'canonicalUrl' ? 'https://…' : field === 'ogImage' ? 'defaults to cover' : ''}
                    value={post.seo[field]} onChange={(e) => updateSeo(field, e.target.value)} />
                )}
              </div>
            ))}
            <label className="inline-flex mt-2.5 px-3 py-1.5 text-xs font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft transition-all cursor-pointer">
              Upload OG image
              <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f, 'og').catch(() => setErr('Upload failed')) }} />
            </label>
          </SideCard>

          <p className="text-muted text-xs text-center">⌘/Ctrl+S to save · paste or drag images into editor</p>
        </aside>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-accent text-bg px-4 py-2 rounded-full text-sm font-medium shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  )
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-line rounded-card bg-bg-elev p-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">{title}</h3>
      {children}
    </div>
  )
}
