import Link from 'next/link'
import Image from 'next/image'

interface Post {
  _id: string
  title: string
  slug: string
  subtitle?: string
  excerpt?: string
  coverImage?: string
  coverImageAlt?: string
  tags?: string[]
  publishedAt?: string | Date | null
  createdAt?: string | Date | null
  readingTime?: number
  authorName?: string
}

interface Props {
  post: Post
  featured?: boolean
  href?: string
}

export default function PostCard({ post, featured = false, href }: Props) {
  const postHref = href ?? `/p/${post.slug}`
  const date = new Date(post.publishedAt || post.createdAt || '')

  if (featured) {
    return (
      <article className="col-span-full grid md:grid-cols-[1.1fr_1fr] border border-line rounded-card-lg bg-bg-elev overflow-hidden hover:shadow transition-shadow">
        <Link href={`${postHref}`} className="block">
          {post.coverImage ? (
            <div className="relative w-full min-h-[280px] md:h-full">
              <Image src={post.coverImage} alt={post.coverImageAlt || ''} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-full min-h-[280px] md:h-full bg-gradient-to-br from-bg-soft to-line" />
          )}
        </Link>
        <div className="flex flex-col justify-center gap-3 p-8 md:p-10">
          <div className="flex items-center gap-2 text-muted text-xs">
            <span>{date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            <span>·</span>
            <span>{post.readingTime || 1} min read</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-fg m-0">
            <Link href={`${postHref}`} className="hover:text-accent-2 hover:no-underline">{post.title}</Link>
          </h2>
          {(post.subtitle || post.excerpt) && (
            <p className="text-muted text-base leading-relaxed line-clamp-3">{post.subtitle || post.excerpt}</p>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {post.tags.slice(0, 3).map((t) => (
                <Link key={t} href={`/tag/${encodeURIComponent(t)}`}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-bg-soft text-muted border border-line hover:bg-accent hover:text-bg hover:border-accent hover:no-underline transition-all">
                  {t}
                </Link>
              ))}
            </div>
          )}
        </div>
      </article>
    )
  }

  return (
    <article className="flex flex-col border border-line rounded-card-lg bg-bg-elev overflow-hidden hover:-translate-y-0.5 hover:shadow hover:border-line-strong transition-all duration-200">
      <Link href={`${postHref}`} className="block">
        {post.coverImage ? (
          <div className="relative w-full aspect-video">
            <Image src={post.coverImage} alt={post.coverImageAlt || ''} fill className="object-cover" loading="lazy" />
          </div>
        ) : (
          <div className="w-full aspect-video bg-gradient-to-br from-bg-soft to-line" />
        )}
      </Link>
      <div className="flex flex-col flex-1 gap-2.5 p-5">
        <div className="flex items-center gap-2 text-muted text-xs">
          <span>{date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          <span>·</span>
          <span>{post.readingTime || 1} min read</span>
        </div>
        <h2 className="font-serif text-[22px] font-semibold leading-snug tracking-tight text-fg m-0">
          <Link href={`${postHref}`} className="hover:text-accent-2 hover:no-underline">{post.title}</Link>
        </h2>
        {(post.subtitle || post.excerpt) && (
          <p className="text-muted text-sm leading-relaxed line-clamp-2 m-0">{post.subtitle || post.excerpt}</p>
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
            {post.tags.slice(0, 3).map((t) => (
              <Link key={t} href={`/tag/${encodeURIComponent(t)}`}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-bg-soft text-muted border border-line hover:bg-accent hover:text-bg hover:border-accent hover:no-underline transition-all">
                {t}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
