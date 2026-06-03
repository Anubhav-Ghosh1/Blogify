import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser {
  _id: string
  email: string
  passwordHash: string
  name: string
  username: string
  bio: string
  avatar: string
  blogTitle: string
  blogDescription: string
  blogFont: string
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: '' },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    blogTitle: { type: String, default: '' },
    blogDescription: { type: String, default: '' },
    blogFont: { type: String, default: 'serif' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
)

userSchema.methods.verifyPassword = function (plain: string) {
  return bcrypt.compare(plain, this.passwordHash)
}

userSchema.statics.hashPassword = function (plain: string) {
  return bcrypt.hash(plain, 10)
}

export default (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', userSchema)
