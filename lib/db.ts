import mongoose from 'mongoose'

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null }
}

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) throw new Error('MONGODB_URI env var missing')

let cached = global.__mongoose

if (!cached) {
  cached = global.__mongoose = { conn: null, promise: null }
}

export async function connectDB(): Promise<mongoose.Connection> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    mongoose.set('strictQuery', true)
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m.connection)
  }

  cached.conn = await cached.promise
  return cached.conn
}
