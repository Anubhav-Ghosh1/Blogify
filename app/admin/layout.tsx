'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Blog'

interface User { email?: string; name?: string }

function SideLink({ href, children, exact }: { href: string; children: React.ReactNode; exact?: boolean }) {
  const path = usePathname()
  const active = exact ? path === href : path.startsWith(href)
  return (
    <Link href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:no-underline mb-0.5 ${
        active ? 'bg-bg-elev text-fg shadow-sm' : 'text-muted hover:bg-bg-elev hover:text-fg'
      }`}>
      {children}
    </Link>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.user || null))
      .catch(() => {})
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-65px)]">
      {/* Admin header */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/85 dark:bg-[#0b0b0d]/82 backdrop-blur-md">
        <div className="max-w-wide mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <Link href="/admin" className="font-serif font-bold text-xl tracking-tight text-fg hover:opacity-85 hover:no-underline">
            {siteName} · Admin
          </Link>
          <nav className="flex items-center gap-4">
            <a href="/" target="_blank" rel="noreferrer" className="text-muted text-sm hover:text-fg hover:no-underline">View site ↗</a>
            <span className="text-muted text-sm">{user?.email || user?.name}</span>
            <button onClick={logout}
              className="px-3.5 py-1.5 text-xs font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft transition-all">
              Sign out
            </button>
          </nav>
        </div>
      </header>

      {/* Sidebar + content */}
      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-line bg-bg-soft px-3 py-7">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-2 px-3 mb-2">Content</p>
          <SideLink href="/admin" exact>All posts</SideLink>
          <SideLink href="/admin/new">+ New post</SideLink>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-2 px-3 mb-2 mt-5">Audience</p>
          <SideLink href="/admin/subscribers">Subscribers</SideLink>
        </aside>
        <div className="flex-1 px-6 md:px-12 py-10 max-w-5xl">{children}</div>
      </div>
    </div>
  )
}
