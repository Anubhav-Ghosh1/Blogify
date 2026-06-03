'use client'

import { useEffect, useState } from 'react'

interface Comment {
  _id: string
  name: string
  content: string
  createdAt: string
}

export default function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    fetch(`/api/comments/${postId}`)
      .then((r) => r.json())
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [postId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrMsg('')
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, name, email, content }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed')
      }
      setStatus('sent')
      setName(''); setEmail(''); setContent('')
    } catch (e: unknown) {
      setStatus('error')
      setErrMsg(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  return (
    <section className="mt-12 border-t border-line pt-10">
      <h3 className="font-serif text-2xl font-semibold tracking-tight mb-6">
        {comments.length > 0 ? `${comments.length} Comment${comments.length !== 1 ? 's' : ''}` : 'Comments'}
      </h3>

      {comments.length > 0 && (
        <div className="space-y-5 mb-10">
          {comments.map((c) => (
            <div key={c._id} className="border border-line rounded-card p-4 bg-bg-elev">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-2 to-accent text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                  {c.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="font-medium text-fg text-sm">{c.name}</span>
                <span className="text-muted-2 text-xs">
                  {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <p className="text-fg-soft text-sm leading-relaxed whitespace-pre-wrap">{c.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-bg-elev border border-line rounded-card-lg p-6">
        <h4 className="font-semibold text-base mb-4">Leave a comment</h4>
        {status === 'sent' ? (
          <div className="text-success text-sm font-medium">
            Comment submitted! It will appear after moderation.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">Name</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} maxLength={100}
                  className="w-full px-3.5 py-2.5 border border-line rounded-card bg-bg text-fg text-sm focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">Email <span className="font-normal normal-case">(not shown)</span></label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-line rounded-card bg-bg text-fg text-sm focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">Comment</label>
              <textarea required value={content} onChange={(e) => setContent(e.target.value)} rows={4} maxLength={2000}
                className="w-full px-3.5 py-2.5 border border-line rounded-card bg-bg text-fg text-sm resize-none focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10 transition-all" />
              <p className="text-[11px] text-muted-2 mt-1">{content.length}/2000</p>
            </div>
            {status === 'error' && <p className="text-danger text-sm">{errMsg}</p>}
            <button type="submit" disabled={status === 'sending'}
              className="px-5 py-2.5 text-sm font-medium bg-accent text-bg rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity">
              {status === 'sending' ? 'Posting…' : 'Post comment'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
