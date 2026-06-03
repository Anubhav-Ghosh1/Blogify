import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD required')
  process.exit(1)
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: 'Admin' },
  role: { type: String, default: 'admin' },
})
const User = mongoose.models.User || mongoose.model('User', userSchema)

await mongoose.connect(MONGODB_URI)
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
const existing = await User.findOne({ email: ADMIN_EMAIL })

if (existing) {
  existing.passwordHash = passwordHash
  await existing.save()
  console.log('Admin password reset for', ADMIN_EMAIL)
} else {
  await User.create({ email: ADMIN_EMAIL, passwordHash, name: 'Admin', role: 'admin' })
  console.log('Admin created:', ADMIN_EMAIL)
}

process.exit(0)
