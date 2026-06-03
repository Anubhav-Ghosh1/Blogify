import Link from 'next/link'
import NewsletterForm from './NewsletterForm'

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Blog'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-bg-soft mt-16">
      <div className="max-w-wide mx-auto px-6 py-14 grid md:grid-cols-[2fr_1fr_1fr] gap-10">
        <div>
          <div className="font-serif font-bold text-2xl tracking-tight text-fg mb-2">{siteName}</div>
          <p className="text-muted text-sm max-w-sm m-0 mb-5">Notes, essays, and ideas. New articles delivered to your inbox.</p>
          <NewsletterForm compact source="footer" />
        </div>
        <div>
          <h4 className="text-[11px] uppercase tracking-widest text-muted font-semibold mb-3.5">Explore</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/" className="text-fg-soft hover:text-fg hover:no-underline">Home</Link>
            <Link href="/about" className="text-fg-soft hover:text-fg hover:no-underline">About</Link>
            <a href="/rss.xml" target="_blank" rel="noreferrer" className="text-fg-soft hover:text-fg hover:no-underline">RSS feed</a>
          </div>
        </div>
        <div>
          <h4 className="text-[11px] uppercase tracking-widest text-muted font-semibold mb-3.5">Connect</h4>
          <div className="flex flex-col gap-2 text-sm">
            <a href="mailto:hello@example.com" className="text-fg-soft hover:text-fg hover:no-underline">Email</a>
            <a href="https://twitter.com/" target="_blank" rel="noreferrer" className="text-fg-soft hover:text-fg hover:no-underline">Twitter / X</a>
            <a href="https://github.com/" target="_blank" rel="noreferrer" className="text-fg-soft hover:text-fg hover:no-underline">GitHub</a>
          </div>
        </div>
      </div>
      <div className="max-w-wide mx-auto px-6 py-6 border-t border-line flex flex-wrap justify-between gap-2 text-[13px] text-muted">
        <span>© {new Date().getFullYear()} {siteName}. All rights reserved.</span>
        <Link href="/about" className="hover:text-fg hover:no-underline">About</Link>
      </div>
    </footer>
  )
}
