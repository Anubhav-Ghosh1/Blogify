'use client'

import { useEffect, useState, useCallback } from 'react'

interface Comment {
  _id: string
  name: string
  email: string
  content: string
  status: string
  createdAt: string
  postId: { _id: string; title: string; slug: string } | string
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'approved' | 'spam'>('pending')

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/comments/mod?status=${tab}`)
      .then((r) => r.json())
      .then((d) => setComments(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [tab])

  useEffect(() => { load() }, [load])

  async function moderate(id: string, status: string) {
    await fetch(`/api/comments/mod/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  async function remove(id: string) {
    await fetch(`/api/comments/mod/${id}`, { method: 'DELETE' })
    load()
  }

  const postTitle = (c: Comment) => {
    if (typeof c.postId === 'object' && c.postId) return c.postId.title
    return 'Unknown post'
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight mb-6">Comments</h1>

      <div className="flex gap-1 mb-6 bg-bg-soft border border-line rounded-lg p-1 w-fit">
        {(['pending', 'approved', 'spam'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${tab === t ? 'bg-bg text-fg shadow-sm border border-line' : 'text-muted hover:text-fg'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-muted text-center py-16">Loading…</div>
      ) : comments.length === 0 ? (
        <div className="text-muted text-center py-16">No {tab} comments.</div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c._id} className="bg-bg border border-line rounded-card-lg p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <span className="font-medium text-fg text-sm">{c.name}</span>
                  <span className="text-muted-2 text-xs ml-2">{c.email}</span>
                  <span className="text-muted-2 text-xs ml-2">on <span className="text-muted">{postTitle(c)}</span></span>
                </div>
                <span className="text-muted-2 text-xs">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-fg-soft text-sm mt-2 whitespace-pre-wrap">{c.content}</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {tab !== 'approved' && (
                  <button onClick={() => moderate(c._id, 'approved')}
                    className="px-3 py-1.5 text-xs font-medium bg-success text-white rounded-full hover:opacity-90 transition-opacity">
                    Approve
                  </button>
                )}
                {tab !== 'spam' && (
                  <button onClick={() => moderate(c._id, 'spam')}
                    className="px-3 py-1.5 text-xs font-medium border border-line-strong text-muted rounded-full hover:bg-bg-soft transition-all">
                    Mark spam
                  </button>
                )}
                {tab !== 'pending' && (
                  <button onClick={() => moderate(c._id, 'pending')}
                    className="px-3 py-1.5 text-xs font-medium border border-line-strong text-muted rounded-full hover:bg-bg-soft transition-all">
                    Pending
                  </button>
                )}
                <button onClick={() => remove(c._id)}
                  className="px-3 py-1.5 text-xs font-medium text-danger border border-line-strong rounded-full hover:bg-danger hover:text-white hover:border-danger transition-all">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
