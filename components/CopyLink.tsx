'use client'

import { useState } from 'react'

export default function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy}
      className="px-3.5 py-1.5 text-xs font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft transition-all cursor-pointer">
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  )
}
