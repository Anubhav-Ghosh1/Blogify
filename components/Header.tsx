'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

interface Me { name: string; username: string }

export default function Header() {
  const [open, setOpen] = useState(false)
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setMe(d || null))
      .catch(() => setMe(null))
      .finally(() => setLoading(false))
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setMe(null)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 dark:bg-[#18181b]/85 backdrop-blur-md backdrop-saturate-150">
      <div className="max-w-wide mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
        <Link href="/" className="font-serif font-bold text-2xl tracking-tight text-fg hover:opacity-85 hover:no-underline transition-opacity">
          Blogify
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-3">
          <ThemeToggle variant="segmented" />
          {!loading && (
            me ? (
              <>
                <Link href={`/${me.username}`} className="text-muted text-sm font-medium hover:text-fg hover:no-underline transition-colors">
                  My blog
                </Link>
                <Link href="/dashboard"
                  className="text-muted text-sm font-medium hover:text-fg hover:no-underline transition-colors">
                  Dashboard
                </Link>
                <button onClick={logout}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft transition-all">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-muted text-sm font-medium hover:text-fg hover:no-underline transition-colors">
                  Sign in
                </Link>
                <Link href="/signup"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-accent text-bg rounded-full hover:opacity-90 hover:no-underline transition-opacity">
                  Start for free
                </Link>
              </>
            )
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-muted hover:text-fg transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l12 12M16 4L4 16" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h14M3 10h14M3 14h14" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-line bg-bg px-6 py-4 flex flex-col gap-3">
          {me ? (
            <>
              <Link href={`/${me.username}`} onClick={() => setOpen(false)} className="text-muted text-sm font-medium hover:text-fg hover:no-underline">My blog</Link>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="text-muted text-sm font-medium hover:text-fg hover:no-underline">Dashboard</Link>
              <button onClick={() => { setOpen(false); logout() }} className="text-left text-muted text-sm font-medium hover:text-fg">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="text-muted text-sm font-medium hover:text-fg hover:no-underline">Sign in</Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="text-muted text-sm font-medium hover:text-fg hover:no-underline">Create blog</Link>
            </>
          )}
          <div className="pt-2 border-t border-line"><ThemeToggle variant="menu" /></div>
        </div>
      )}
    </header>
  )
}
