import mongoose from 'mongoose'

export interface ISubscriber {
  _id: string
  email: string
  publicationId: mongoose.Types.ObjectId
  source: string
  confirmed: boolean
  unsubscribedAt: Date | null
  createdAt: Date
}

const subscriberSchema = new mongoose.Schema<ISubscriber>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    publicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    source: { type: String, default: 'site' },
    confirmed: { type: Boolean, default: true },
    unsubscribedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

// email unique per publication
subscriberSchema.index({ email: 1, publicationId: 1 }, { unique: true })

export default (mongoose.models.Subscriber as mongoose.Model<ISubscriber>) ||
  mongoose.model<ISubscriber>('Subscriber', subscriberSchema)
