import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export function uploadBuffer(buffer: Buffer, folder = 'blog'): Promise<{ secure_url: string; public_id: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: 'image' }, (err, result) => {
        if (err || !result) return reject(err ?? new Error('Upload failed'))
        resolve(result as { secure_url: string; public_id: string; width: number; height: number })
      })
      .end(buffer)
  })
}
