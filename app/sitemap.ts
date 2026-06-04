export const dynamic = 'force-dynamic'
import { MetadataRoute } from 'next'
import { connectDB } from '@/lib/db'
import Post from '@/models/Post'
import User from '@/models/User'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
  await connectDB()

  const [posts, authors] = await Promise.all([
    Post.find({ status: 'published' }).select('slug authorUsername updatedAt publishedAt'),
    User.find({}).select('username updatedAt'),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  const authorRoutes: MetadataRoute.Sitemap = authors.map((u) => ({
    url: `${siteUrl}/${u.username}`,
    lastModified: u.updatedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${siteUrl}/${p.authorUsername}/${p.slug}`,
    lastModified: p.updatedAt || p.publishedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...authorRoutes, ...postRoutes]
}
