import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        'bg-soft': 'var(--bg-soft)',
        'bg-elev': 'var(--bg-elev)',
        fg: 'var(--fg)',
        'fg-soft': 'var(--fg-soft)',
        muted: 'var(--muted)',
        'muted-2': 'var(--muted-2)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
        accent: 'var(--accent)',
        'accent-2': 'var(--accent-2)',
        link: 'var(--link)',
        danger: '#b91c1c',
        success: '#15803d',
        warning: '#b45309',
      },
      maxWidth: {
        content: '720px',
        wide: '1180px',
      },
      borderRadius: {
        card: '10px',
        'card-lg': '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(15,23,42,0.04)',
        DEFAULT: '0 4px 16px rgba(15,23,42,0.06)',
        lg: '0 12px 40px rgba(15,23,42,0.08)',
      },
    },
  },
  plugins: [],
}

export default config
