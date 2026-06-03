'use client'

import { useEffect, useState } from 'react'

export default function ProgressBar() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    function onScroll() {
      const h = document.documentElement
      const total = h.scrollHeight - h.clientHeight
      setPct(total > 0 ? Math.min(100, (h.scrollTop / total) * 100) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 h-[3px] bg-accent-2 z-50 transition-[width] duration-100"
      style={{ width: `${pct}%` }}
    />
  )
}
