import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // redirect old /admin to /dashboard
  if (pathname.startsWith('/admin')) {
    const url = req.nextUrl.clone()
    url.pathname = pathname.replace('/admin', '/dashboard')
    return NextResponse.redirect(url)
  }

  const token = req.cookies.get('token')?.value
  if (!token) {
    const url = new URL('/login', req.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    const url = new URL('/login', req.url)
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
