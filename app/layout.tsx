import type { Metadata } from 'next'
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import 'highlight.js/styles/github.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz'],
})
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' })

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Blog'
const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Writing on engineering, ideas, and craft.'
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')

export const metadata: Metadata = {
  title: { default: siteName, template: `%s — ${siteName}` },
  description: siteDescription,
  metadataBase: new URL(siteUrl || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    siteName,
    title: siteName,
    description: siteDescription,
  },
  twitter: { card: 'summary_large_image' },
  alternates: { types: { 'application/rss+xml': '/rss.xml' } },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0f172a" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('theme') || 'system';
              var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
              if (dark) document.documentElement.classList.add('dark');
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-bg text-fg antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
