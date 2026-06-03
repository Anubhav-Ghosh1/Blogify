import mongoose from 'mongoose'

export interface IAnalytics {
  _id: string
  postId: mongoose.Types.ObjectId
  publicationId: mongoose.Types.ObjectId
  date: Date
  views: number
}

const analyticsSchema = new mongoose.Schema<IAnalytics>({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  publicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true },
  views: { type: Number, default: 0 },
})

analyticsSchema.index({ postId: 1, date: 1 }, { unique: true })
analyticsSchema.index({ publicationId: 1, date: 1 })

export default (mongoose.models.Analytics as mongoose.Model<IAnalytics>) ||
  mongoose.model<IAnalytics>('Analytics', analyticsSchema)
