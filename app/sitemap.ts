export const dynamic = 'force-dynamic'
import { MetadataRoute } from 'next'
import { connectDB } from '@/lib/db'
import Post from '@/models/Post'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
  await connectDB()
  const posts = await Post.find({ status: 'published' }).select('slug updatedAt publishedAt')

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${siteUrl}/p/${p.slug}`,
    lastModified: p.updatedAt || p.publishedAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...postRoutes]
}
