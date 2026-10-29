import type { CSSProperties } from 'react'
import { marketingSerif as serif, marketingSans as sans } from '@/fonts'

// Cancha brand fonts (self-hosted, see src/fonts): editorial serif for display +
// clean grotesque body. Shared across all marketing pages.
export const fontVars = `${serif.variable} ${sans.variable}`

// Brand palette ("Crème + bleu encre"): warm paper bg, near-black warm ink text,
// muted ink-blue accent. Applied as CSS custom properties on the marketing shell
// so shadcn primitives read them via --color-* tokens, without touching globals.
export const BRAND: CSSProperties = {
  '--background': '#FAF9F5',
  '--foreground': '#1A1A18',
  '--card': '#FFFFFF',
  '--card-foreground': '#1A1A18',
  '--primary': '#35527D',
  '--primary-foreground': '#FFFFFF',
  '--secondary': '#F0EDE4',
  '--secondary-foreground': '#1A1A18',
  '--muted': '#F0EDE4',
  '--muted-foreground': '#5F5B54',
  '--accent': '#ECEAE2',
  '--accent-foreground': '#1A1A18',
  '--border': '#E6E1D6',
  '--input': '#E6E1D6',
  '--ring': '#35527D',
  '--radius': '0.75rem',
  // Marketing pages are always light (cream), even though the app shell defaults
  // to a dark next-themes class on <html> — anchor native controls/scrollbars.
  colorScheme: 'light',
  fontFamily: 'var(--font-geist-brand), ui-sans-serif, system-ui, sans-serif',
} as CSSProperties

// Editorial serif for display headings.
export const display: CSSProperties = {
  fontFamily: 'var(--font-newsreader), ui-serif, Georgia, serif',
}

// Visible focus ring for bare links (shadcn Button ships its own).
export const focusRing =
  'rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
