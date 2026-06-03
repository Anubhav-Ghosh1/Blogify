'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Blog'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Login failed')
      }
      router.push(params.get('from') || '/dashboard')
      router.refresh()
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-5 bg-bg">
      <div className="w-full max-w-sm bg-bg-elev border border-line rounded-card-lg p-9 shadow">
        <Link href="/" className="block text-center font-serif font-bold text-2xl tracking-tight text-fg mb-2 hover:no-underline">
          {siteName}
        </Link>
        <h1 className="font-serif text-[26px] font-semibold text-center mb-6">Sign in</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus autoComplete="email"
              className="w-full px-3.5 py-2.5 border border-line rounded-card bg-bg text-fg text-[15px] focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10 transition-all" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
              className="w-full px-3.5 py-2.5 border border-line rounded-card bg-bg text-fg text-[15px] focus:outline-none focus:border-accent-2 focus:ring-2 focus:ring-accent-2/10 transition-all" />
          </div>
          {err && <p className="text-danger text-sm">{err}</p>}
          <button type="submit" disabled={busy}
            className="w-full py-2.5 text-sm font-medium bg-accent text-bg rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity mt-2">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-center mt-5 text-muted text-sm">
          No account?{' '}
          <Link href="/signup" className="text-accent-2 hover:underline">Create your blog</Link>
        </p>
        <p className="text-center mt-2">
          <Link href="/" className="text-muted text-sm hover:text-fg hover:no-underline">← Back to site</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
