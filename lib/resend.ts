import { Resend } from 'resend'

let _resend: Resend | null = null
export function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured')
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}
export { getResend as resend }

export function newsletterHtml(opts: {
  postTitle: string
  postExcerpt: string
  postUrl: string
  authorName: string
  blogTitle: string
  unsubUrl: string
}): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e5">
    <div style="padding:32px 40px">
      <p style="font-size:13px;color:#888;margin:0 0 24px">${opts.blogTitle}</p>
      <h1 style="font-size:28px;font-weight:700;color:#0f172a;margin:0 0 16px;line-height:1.3">${opts.postTitle}</h1>
      <p style="font-size:16px;color:#475569;line-height:1.6;margin:0 0 28px">${opts.postExcerpt}</p>
      <a href="${opts.postUrl}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 28px;border-radius:100px;font-size:14px;font-weight:600;text-decoration:none">Read the full post →</a>
    </div>
    <div style="padding:20px 40px;border-top:1px solid #e5e5e5;background:#fafafa">
      <p style="font-size:12px;color:#94a3b8;margin:0">You're subscribed to ${opts.blogTitle} by ${opts.authorName}. <a href="${opts.unsubUrl}" style="color:#94a3b8">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`
}
