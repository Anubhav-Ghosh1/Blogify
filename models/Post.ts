import mongoose from 'mongoose'
import slugify from 'slugify'

export interface IPost {
  _id: string
  title: string
  slug: string
  subtitle: string
  excerpt: string
  content: string
  contentType: 'markdown' | 'html'
  coverImage: string
  coverImageAlt: string
  tags: string[]
  author: mongoose.Types.ObjectId
  authorName: string
  authorUsername: string
  status: 'draft' | 'published'
  publishedAt: Date | null
  seo: {
    metaTitle: string
    metaDescription: string
    canonicalUrl: string
    ogImage: string
  }
  readingTime: number
  views: number
  createdAt: Date
  updatedAt: Date
}

const postSchema = new mongoose.Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, index: true },
    subtitle: { type: String, default: '' },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    contentType: { type: String, enum: ['markdown', 'html'], default: 'html' },
    coverImage: { type: String, default: '' },
    coverImageAlt: { type: String, default: '' },
    tags: { type: [String], default: [], index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    authorName: { type: String, default: '' },
    authorUsername: { type: String, default: '', index: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    publishedAt: { type: Date, default: null },
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      canonicalUrl: { type: String, default: '' },
      ogImage: { type: String, default: '' },
    },
    readingTime: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// slug unique per author
postSchema.index({ author: 1, slug: 1 }, { unique: true })
postSchema.index({ authorUsername: 1, slug: 1 })
postSchema.index({ title: 'text', content: 'text', tags: 'text' })

function makeSlug(s: string): string {
  return slugify(s, { lower: true, strict: true, trim: true }).slice(0, 80)
}

postSchema.statics.uniqueSlug = async function (title: string, authorId: string, currentId?: string): Promise<string> {
  const base = makeSlug(title) || 'post'
  let candidate = base
  let n = 1
  while (true) {
    const found = await this.findOne({ author: authorId, slug: candidate })
    if (!found || String(found._id) === String(currentId)) return candidate
    candidate = `${base}-${++n}`
  }
}

function extractFirstImage(html: string): string {
  if (!html) return ''
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (m) return m[1]
  // markdown fallback ![alt](url)
  const md = html.match(/!\[[^\]]*\]\(([^)]+)\)/)
  return md ? md[1] : ''
}

postSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const text = (this.content || '').replace(/<[^>]+>/g, ' ')
    const words = text.trim().split(/\s+/).filter(Boolean).length
    this.readingTime = Math.max(1, Math.round(words / 200))
    if (!this.coverImage) {
      const first = extractFirstImage(this.content || '')
      if (first) this.coverImage = first
    }
  }
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  next()
})

export default (mongoose.models.Post as mongoose.Model<IPost> & {
  uniqueSlug(title: string, authorId: string, currentId?: string): Promise<string>
}) || mongoose.model<IPost>('Post', postSchema)
