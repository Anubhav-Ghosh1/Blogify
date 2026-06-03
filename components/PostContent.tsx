'use client'

import { useEffect, useRef } from 'react'

export default function PostContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    // Add copy buttons to code blocks
    ref.current.querySelectorAll('pre').forEach((pre) => {
      if (pre.querySelector('.copy-btn')) return
      const btn = document.createElement('button')
      btn.className = 'copy-btn'
      btn.textContent = 'Copy'
      btn.type = 'button'
      btn.addEventListener('click', async () => {
        const code = pre.querySelector('code')
        try {
          await navigator.clipboard.writeText(code ? code.innerText : pre.innerText)
          btn.textContent = 'Copied!'
          setTimeout(() => (btn.textContent = 'Copy'), 1400)
        } catch {}
      })
      pre.style.position = 'relative'
      pre.appendChild(btn)
    })
    // Open external links in new tab
    ref.current.querySelectorAll<HTMLAnchorElement>('a[href^="http"]').forEach((a) => {
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
    })
  }, [html])

  return (
    <div
      ref={ref}
      className="prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
