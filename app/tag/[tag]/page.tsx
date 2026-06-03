import type { Metadata } from 'next'
import Link from 'next/link'
import { connectDB } from '@/lib/db'
import Post from '@/models/Post'
import PostCard from '@/components/PostCard'

type Props = { params: Promise<{ tag: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params
  return {
    title: `#${tag}`,
    description: `Posts tagged #${tag}.`,
  }
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params
  await connectDB()
  const posts = await Post.find({ status: 'published', tags: tag })
    .sort({ publishedAt: -1 })
    .limit(30)
    .select('-content')
    .lean()

  return (
    <div className="max-w-wide mx-auto px-6 py-10">
      <div className="mb-8">
        <Link href="/" className="text-muted text-sm hover:text-fg hover:no-underline">← All posts</Link>
        <h1 className="font-serif text-4xl font-semibold tracking-tight mt-2 mb-1">#{tag}</h1>
        <p className="text-muted text-sm">{posts.length} post{posts.length === 1 ? '' : 's'}</p>
      </div>
      {posts.length === 0 ? (
        <div className="text-muted text-center py-20">No posts.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {posts.map((p) => <PostCard key={String(p._id)} post={p as unknown as Parameters<typeof PostCard>[0]['post']} />)}
        </div>
      )}
    </div>
  )
}
