import type { Metadata } from 'next'
import NewsletterForm from '@/components/NewsletterForm'

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Blog'

export const metadata: Metadata = {
  title: 'About',
  description: `About ${siteName} — writing on engineering, ideas, and craft.`,
}

export default function AboutPage() {
  return (
    <div className="max-w-content mx-auto px-5 py-10 pb-20">
      <h1 className="font-serif text-5xl font-semibold tracking-tight mb-8">About</h1>
      <div className="font-serif text-xl leading-relaxed text-fg-soft space-y-5">
        <p>
          Welcome to {siteName} — a publication of essays, notes, and ideas on
          engineering, design, and the craft of building things.
        </p>
        <p>
          Articles are published on no fixed schedule, but you can subscribe to
          the newsletter below to get them in your inbox as soon as they go live.
          The full archive is also available as an <a href="/rss.xml" className="text-link underline hover:decoration-2">RSS feed</a>.
        </p>
        <h2 className="font-serif text-3xl font-semibold tracking-tight text-fg pt-4">Contact</h2>
        <p>
          Reach out at <a href="mailto:hello@example.com" className="text-link underline hover:decoration-2">hello@example.com</a> with
          questions, corrections, or just to say hello.
        </p>
      </div>
      <NewsletterForm source="about" />
    </div>
  )
}
