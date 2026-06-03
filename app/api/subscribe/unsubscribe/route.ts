import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Subscriber from '@/models/Subscriber'

export async function GET(req: NextRequest) {
  await connectDB()
  const { searchParams } = req.nextUrl
  const email = searchParams.get('email') || ''
  const pub = searchParams.get('pub') || ''
  if (!email || !pub) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  await Subscriber.findOneAndUpdate(
    { email: email.toLowerCase(), publicationId: pub },
    { unsubscribedAt: new Date() }
  )
  return new NextResponse('<html><body style="font-family:sans-serif;text-align:center;padding:80px"><h2>Unsubscribed</h2><p>You have been removed from this mailing list.</p></body></html>', {
    headers: { 'Content-Type': 'text/html' },
  })
}
