import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demo blog — see what yours could look like',
  description: 'A live preview of a blog built on Blogify.',
}

const demoUser = {
  name: 'Alex Carter',
  username: 'alex',
  bio: 'Writing about engineering, design, and the craft of shipping software.',
  blogTitle: "Alex's Notebook",
  blogDescription: 'Notes on engineering, design systems, and shipping software that lasts.',
}

const demoPosts = [
  {
    _id: '1',
    title: 'On building software that lasts',
    excerpt: 'Most code we write does not survive five years. Here is what makes the rare bit that does outlive the rest.',
    tags: ['engineering', 'craft'],
    publishedAt: '2026-05-28',
    readingTime: 6,
    coverGrad: 'from-indigo-500 to-purple-500',
  },
  {
    _id: '2',
    title: 'Design systems are not component libraries',
    excerpt: 'The trap most teams fall into: shipping a library of buttons and calling it a system. The actual work is upstream.',
    tags: ['design', 'systems'],
    publishedAt: '2026-05-14',
    readingTime: 8,
    coverGrad: 'from-rose-500 to-orange-500',
  },
  {
    _id: '3',
    title: 'A short defense of boring tech',
    excerpt: 'Postgres, Django, jQuery. Boring is a feature, not a bug. You can ship more with less if you stop chasing.',
    tags: ['engineering'],
    publishedAt: '2026-04-30',
    readingTime: 4,
    coverGrad: 'from-emerald-500 to-teal-500',
  },
  {
    _id: '4',
    title: 'Notes from rewriting our deploy pipeline',
    excerpt: 'Three months, two false starts, one outage. Here is what we learned moving from Jenkins to GitHub Actions.',
    tags: ['devops', 'engineering'],
    publishedAt: '2026-04-12',
    readingTime: 9,
    coverGrad: 'from-sky-500 to-blue-600',
  },
  {
    _id: '5',
    title: 'On writing for engineers who hate writing',
    excerpt: 'Documentation is not the enemy. The enemy is documentation written like documentation. Treat it like code.',
    tags: ['writing', 'craft'],
    publishedAt: '2026-03-28',
    readingTime: 5,
    coverGrad: 'from-amber-500 to-red-500',
  },
  {
    _id: '6',
    title: 'Why your standup is broken',
    excerpt: 'If your daily standup runs over 15 minutes, something is wrong. Usually it is not the meeting. It is the team.',
    tags: ['teams', 'process'],
    publishedAt: '2026-03-10',
    readingTime: 7,
    coverGrad: 'from-fuchsia-500 to-pink-600',
  },
]

const allTags = ['engineering', 'design', 'systems', 'craft', 'devops', 'writing', 'teams', 'process']

export default function DemoPage() {
  const featured = demoPosts[0]
  const rest = demoPosts.slice(1)

  return (
    <div className="max-w-wide mx-auto px-6 pb-20">
      {/* Demo banner */}
      <div className="mt-6 mb-2 flex items-center gap-3 bg-accent-2/10 border border-accent-2/30 rounded-card-lg px-5 py-3">
        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-accent-2 text-white rounded-full">Demo</span>
        <p className="text-sm text-fg-soft">
          This is a sample blog showing what yours could look like.
        </p>
        <Link href="/signup"
          className="ml-auto inline-flex items-center px-4 py-1.5 text-xs font-semibold bg-accent text-bg rounded-full hover:opacity-90 hover:no-underline transition-opacity whitespace-nowrap">
          Create your own →
        </Link>
      </div>

      {/* Profile header */}
      <div className="flex items-start gap-5 pt-8 pb-10 border-b border-line mb-10">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-2xl flex-shrink-0">
          A
        </div>
        <div>
          <h1 className="font-serif font-semibold text-4xl tracking-tight">{demoUser.blogTitle}</h1>
          <p className="text-muted mt-2 text-lg">{demoUser.blogDescription}</p>
          <p className="text-muted-2 text-sm mt-1">by <span className="text-muted">@{demoUser.username}</span></p>
        </div>
      </div>

      {/* Search + tags */}
      <div className="mb-8">
        <div className="flex gap-2 mb-4 max-w-md opacity-60 pointer-events-none">
          <input placeholder="Search…" disabled
            className="flex-1 px-3.5 py-2.5 border border-line rounded-lg bg-bg text-fg text-sm" />
          <button className="px-5 py-2.5 text-sm font-medium bg-accent text-bg rounded-full">Search</button>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-bg border border-accent">All</span>
          {allTags.map((t) => (
            <span key={t} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-bg-soft text-muted border border-line">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Featured */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mb-7">
        <article className="col-span-full grid md:grid-cols-[1.1fr_1fr] border border-line rounded-card-lg bg-bg-elev overflow-hidden">
          <div className={`bg-gradient-to-br ${featured.coverGrad} min-h-[280px] md:h-full`} />
          <div className="flex flex-col justify-center gap-3 p-8 md:p-10">
            <div className="flex items-center gap-2 text-muted text-xs">
              <span>{new Date(featured.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              <span>·</span>
              <span>{featured.readingTime} min read</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-fg m-0">
              <span className="hover:text-accent-2 transition-colors cursor-default">{featured.title}</span>
            </h2>
            <p className="text-muted text-base leading-relaxed">{featured.excerpt}</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {featured.tags.map((t) => (
                <span key={t} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-bg-soft text-muted border border-line">{t}</span>
              ))}
            </div>
          </div>
        </article>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {rest.map((p) => (
          <article key={p._id} className="flex flex-col border border-line rounded-card-lg bg-bg-elev overflow-hidden">
            <div className={`bg-gradient-to-br ${p.coverGrad} aspect-video`} />
            <div className="flex flex-col flex-1 gap-2.5 p-5">
              <div className="flex items-center gap-2 text-muted text-xs">
                <span>{new Date(p.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                <span>·</span>
                <span>{p.readingTime} min read</span>
              </div>
              <h2 className="font-serif text-[22px] font-semibold leading-snug tracking-tight text-fg m-0">{p.title}</h2>
              <p className="text-muted text-sm leading-relaxed line-clamp-2">{p.excerpt}</p>
              <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                {p.tags.map((t) => (
                  <span key={t} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-bg-soft text-muted border border-line">{t}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Subscribe sample */}
      <div className="mt-16 bg-bg-elev border border-line rounded-card-lg p-8 text-center max-w-md mx-auto">
        <h3 className="font-serif font-semibold text-2xl mb-2">Stay in the loop</h3>
        <p className="text-muted text-sm mb-5">Get new posts from {demoUser.name} delivered to your inbox.</p>
        <div className="flex gap-2 opacity-60">
          <input type="email" placeholder="you@example.com" disabled
            className="flex-1 px-3.5 py-2.5 border border-line rounded-lg bg-bg text-fg text-sm" />
          <button disabled
            className="px-5 py-2.5 text-sm font-medium bg-accent text-bg rounded-full whitespace-nowrap">
            Subscribe
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-20 text-center border-t border-line pt-16">
        <h2 className="font-serif font-semibold text-3xl tracking-tight mb-3">Ready to start yours?</h2>
        <p className="text-muted mb-7">Free to start. Live in under a minute.</p>
        <Link href="/signup"
          className="inline-flex items-center px-7 py-3 text-base font-semibold bg-accent text-bg rounded-full hover:opacity-90 hover:no-underline transition-opacity">
          Create your blog →
        </Link>
      </div>
    </div>
  )
}
