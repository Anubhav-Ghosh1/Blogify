import Link from 'next/link'

const features = [
  { icon: '✍️', title: 'Rich text editor', desc: 'WYSIWYG editor with images, code blocks, embeds, and formatting.' },
  { icon: '💌', title: 'Email newsletters', desc: 'Send your posts directly to subscribers via email.' },
  { icon: '💬', title: 'Comments', desc: 'Readers can comment. You moderate from your dashboard.' },
  { icon: '📊', title: 'Analytics', desc: 'Track views, top posts, and subscriber growth over time.' },
  { icon: '🔍', title: 'SEO-ready', desc: 'Meta tags, Open Graph, RSS feed, and sitemap out of the box.' },
  { icon: '🎨', title: 'Your own space', desc: 'Your blog lives at yourdomain.com/yourname. Clean, fast, yours.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-16 max-w-3xl mx-auto">
        <h1 className="font-serif font-semibold text-5xl md:text-6xl lg:text-7xl tracking-tight leading-none mb-6">
          A blog you actually own
        </h1>
        <p className="text-muted text-xl max-w-xl mx-auto mb-10 leading-relaxed">
          Start writing in minutes. Your own space, newsletter, comments, and analytics — all in one place.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/signup"
            className="inline-flex items-center px-7 py-3 text-base font-semibold bg-accent text-bg rounded-full hover:opacity-90 hover:no-underline transition-opacity">
            Start for free →
          </Link>
          <Link href="/demo"
            className="inline-flex items-center px-7 py-3 text-base font-medium border border-line-strong text-fg rounded-full hover:bg-bg-soft hover:no-underline transition-all">
            See a demo blog
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-wide mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="bg-bg-elev border border-line rounded-card-lg p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-lg text-fg mb-2">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line bg-bg-soft">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h2 className="font-serif font-semibold text-4xl tracking-tight mb-4">Ready to start writing?</h2>
          <p className="text-muted mb-8">Free to start. Your blog, your readers, your content.</p>
          <Link href="/signup"
            className="inline-flex items-center px-8 py-3 text-base font-semibold bg-accent text-bg rounded-full hover:opacity-90 hover:no-underline transition-opacity">
            Create your blog
          </Link>
        </div>
      </section>
    </div>
  )
}
