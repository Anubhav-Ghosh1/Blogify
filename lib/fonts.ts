export const BLOG_FONTS = {
  serif: { name: 'Serif (Fraunces)', css: 'var(--font-fraunces), Georgia, serif' },
  sans: { name: 'Sans (Inter)', css: 'var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif' },
  georgia: { name: 'Georgia', css: 'Georgia, "Times New Roman", serif' },
  system: { name: 'System UI', css: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  mono: { name: 'Mono (JetBrains)', css: 'var(--font-jetbrains), ui-monospace, SFMono-Regular, monospace' },
} as const

export type BlogFontKey = keyof typeof BLOG_FONTS

export function fontCss(key?: string): string {
  if (key && key in BLOG_FONTS) return BLOG_FONTS[key as BlogFontKey].css
  return BLOG_FONTS.serif.css
}
