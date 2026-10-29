import localFont from 'next/font/local'

// Cancha house faces, self-hosted: Newsreader (editorial serif) and Geist
// (grotesque body), latin subset, variable weight. Served from our own origin,
// so no request reaches Google Fonts (GDPR) and a build never depends on
// downloading them (a failed fetch used to fail the whole build).
// Files from Fontsource 5.3.0, SIL Open Font License 1.1 (see *-OFL.txt).
//
// next/font needs literal options and one call per CSS variable, hence the
// repetition; calls sharing a file are deduped in the build output.

/** Product (tournament pages, /manage, console) heading face. */
export const productSerif = localFont({
  src: [
    { path: './newsreader-latin-wght-normal.woff2', weight: '200 800', style: 'normal' },
    { path: './newsreader-latin-wght-italic.woff2', weight: '200 800', style: 'italic' },
  ],
  variable: '--font-product-heading',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
})

/** Product body face. */
export const productSans = localFont({
  src: [{ path: './geist-latin-wght-normal.woff2', weight: '100 900', style: 'normal' }],
  variable: '--font-product-body',
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
})

/** Marketing pages heading face. */
export const marketingSerif = localFont({
  src: [
    { path: './newsreader-latin-wght-normal.woff2', weight: '200 800', style: 'normal' },
    { path: './newsreader-latin-wght-italic.woff2', weight: '200 800', style: 'italic' },
  ],
  variable: '--font-newsreader',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
})

/** Marketing pages body face. */
export const marketingSans = localFont({
  src: [{ path: './geist-latin-wght-normal.woff2', weight: '100 900', style: 'normal' }],
  variable: '--font-geist-brand',
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
})
