'use client'

import { useState } from 'react'

interface Props {
  compact?: boolean
  source?: string
}

export default function NewsletterForm({ compact = false, source = 'site' }: Props) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setState('sending')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'failed')
      }
      setState('done')
      setEmail('')
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Subscription failed')
      setState('error')
    }
  }

  if (state === 'done') {
    return <p className="text-muted text-sm m-0">Thanks — you&apos;re subscribed.</p>
  }

  if (compact) {
    return (
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 min-w-0 px-3 py-2 text-sm border border-line rounded-lg bg-bg text-fg focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10"
        />
        <button type="submit" disabled={state === 'sending'}
          className="px-4 py-2 text-sm font-medium bg-accent text-bg rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap">
          {state === 'sending' ? '…' : 'Subscribe'}
        </button>
      </form>
    )
  }

  return (
    <div className="bg-bg-soft border border-line rounded-card-lg p-7 my-10">
      <h3 className="font-serif text-[22px] font-semibold text-fg m-0 mb-1.5">Subscribe to the newsletter</h3>
      <p className="text-muted text-[15px] m-0 mb-4">Get new posts delivered to your inbox. No spam, unsubscribe any time.</p>
      <form onSubmit={onSubmit} className="flex gap-2 flex-wrap sm:flex-nowrap">
        <input
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
          className="flex-1 min-w-0 px-3.5 py-2.5 border border-line rounded-lg bg-bg text-fg text-[15px] focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10 transition-all"
        />
        <button type="submit" disabled={state === 'sending'}
          className="px-5 py-2.5 text-sm font-medium bg-accent text-bg rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap">
          {state === 'sending' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>
      {err && <p className="text-danger text-sm mt-2">{err}</p>}
    </div>
  )
}
