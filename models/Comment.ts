import mongoose from 'mongoose'

export interface IComment {
  _id: string
  postId: mongoose.Types.ObjectId
  publicationId: mongoose.Types.ObjectId
  name: string
  email: string
  content: string
  status: 'pending' | 'approved' | 'spam'
  createdAt: Date
  updatedAt: Date
}

const commentSchema = new mongoose.Schema<IComment>(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    publicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: ['pending', 'approved', 'spam'], default: 'pending', index: true },
  },
  { timestamps: true }
)

export default (mongoose.models.Comment as mongoose.Model<IComment>) ||
  mongoose.model<IComment>('Comment', commentSchema)
