import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export interface JWTPayload {
  sub: string
  email: string
  role: string
  name: string
  username: string
  iat?: number
  exp?: number
}

function getToken(req: NextRequest): string | null {
  const cookie = req.cookies.get('token')?.value
  if (cookie) return cookie
  const header = req.headers.get('authorization') || ''
  return header.startsWith('Bearer ') ? header.slice(7) : null
}

export function getAuthUser(req: NextRequest): JWTPayload | null {
  const token = getToken(req)
  if (!token) return null
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
  } catch {
    return null
  }
}

export function requireAuth(req: NextRequest): JWTPayload {
  const user = getAuthUser(req)
  if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 })
  return user
}
