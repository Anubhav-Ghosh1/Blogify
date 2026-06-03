import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { uploadBuffer } from '@/lib/cloudinary'

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif'])
const MAX_SIZE = 8 * 1024 * 1024

export async function POST(req: NextRequest) {
  requireAuth(req)
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: 'image only' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'max 8MB' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const result = await uploadBuffer(buffer, 'blog')
  return NextResponse.json({ url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height })
}
