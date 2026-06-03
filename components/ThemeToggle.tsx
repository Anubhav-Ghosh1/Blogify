'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

function apply(theme: Theme) {
  const root = document.documentElement
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  root.classList.toggle('dark', isDark)
}

const SunIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
)
const MoonIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)
const MonitorIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
)

const options: { value: Theme; Icon: typeof SunIcon; label: string }[] = [
  { value: 'light', Icon: SunIcon, label: 'Light' },
  { value: 'system', Icon: MonitorIcon, label: 'System' },
  { value: 'dark', Icon: MoonIcon, label: 'Dark' },
]

export default function ThemeToggle({ variant = 'icon' }: { variant?: 'icon' | 'menu' | 'segmented' }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as Theme) || 'system'
    setTheme(saved)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('theme', theme)
    apply(theme)
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => apply('system')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme, mounted])

  if (!mounted) {
    if (variant === 'segmented' || variant === 'menu') return <div className="h-9 w-[114px]" />
    return <div className="w-9 h-9" />
  }

  // Segmented pill — 3 buttons, animated highlight on active
  const segmented = (
    <div className="inline-flex items-center bg-bg-soft border border-line rounded-full p-0.5">
      {options.map(({ value, Icon, label }) => {
        const active = theme === value
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            aria-label={label}
            title={label}
            className={`relative w-7 h-7 inline-flex items-center justify-center rounded-full transition-colors duration-200 ${
              active
                ? 'bg-bg text-fg shadow-sm'
                : 'text-muted-2 hover:text-fg'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        )
      })}
    </div>
  )

  if (variant === 'segmented') return segmented

  if (variant === 'menu') {
    return (
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted">Theme</span>
        {segmented}
      </div>
    )
  }

  // Icon variant — single button cycling, animated swap
  function cycle() {
    setTheme((t) => (t === 'light' ? 'dark' : t === 'dark' ? 'system' : 'light'))
  }
  const ActiveIcon = options.find((o) => o.value === theme)?.Icon || MonitorIcon
  const labelText = options.find((o) => o.value === theme)?.label || ''

  return (
    <button
      onClick={cycle}
      aria-label={`Theme: ${labelText}`}
      title={`Theme: ${labelText}`}
      className="group relative w-9 h-9 inline-flex items-center justify-center rounded-full border border-line text-muted hover:text-fg hover:border-line-strong hover:bg-bg-soft transition-all duration-200"
    >
      <ActiveIcon className="w-[15px] h-[15px] transition-transform duration-300 group-hover:rotate-12" />
    </button>
  )
}
