'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '' })
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Signup failed')
      }
      router.push('/dashboard')
      router.refresh()
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Signup failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-5 bg-bg">
      <div className="w-full max-w-sm bg-bg-elev border border-line rounded-card-lg p-9 shadow">
        <Link href="/" className="block text-center font-serif font-bold text-2xl tracking-tight text-fg mb-2 hover:no-underline">
          Start writing
        </Link>
        <h1 className="font-serif text-[24px] font-semibold text-center mb-6 text-muted">Create your blog</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">Full name</label>
            <input
              type="text" required autoFocus value={form.name} onChange={(e) => set('name', e.target.value)}
              className="w-full px-3.5 py-2.5 border border-line rounded-card bg-bg text-fg text-[15px] focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">Email</label>
            <input
              type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email"
              className="w-full px-3.5 py-2.5 border border-line rounded-card bg-bg text-fg text-[15px] focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">Username</label>
            <div className="flex items-center border border-line rounded-card bg-bg focus-within:border-accent-2 focus-within:ring-2 focus-within:ring-accent-2/10 transition-all overflow-hidden">
              <span className="pl-3.5 pr-1 text-muted text-[15px] select-none">@</span>
              <input
                type="text" required value={form.username}
                onChange={(e) => set('username', e.target.value.replace(/[^a-z0-9_-]/gi, '').toLowerCase())}
                minLength={3} maxLength={30} pattern="[a-z0-9_-]+" autoComplete="username"
                className="flex-1 px-1.5 py-2.5 bg-transparent text-fg text-[15px] focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-muted-2 mt-1">Your blog will be at yourdomain.com/{form.username || 'yourname'}</p>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">Password</label>
            <input
              type="password" required value={form.password} onChange={(e) => set('password', e.target.value)}
              minLength={8} autoComplete="new-password"
              className="w-full px-3.5 py-2.5 border border-line rounded-card bg-bg text-fg text-[15px] focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10 transition-all"
            />
            <p className="text-[11px] text-muted-2 mt-1">Minimum 8 characters</p>
          </div>
          {err && <p className="text-danger text-sm">{err}</p>}
          <button type="submit" disabled={busy}
            className="w-full py-2.5 text-sm font-medium bg-accent text-bg rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity mt-2">
            {busy ? 'Creating…' : 'Create blog'}
          </button>
        </form>
        <p className="text-center mt-5 text-muted text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-accent-2 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
