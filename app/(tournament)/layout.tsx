import '../globals.css'
import type { Metadata, Viewport } from 'next'
import { Newsreader, Geist } from 'next/font/google'
import { cn } from '@/lib/utils'
import { getPayloadClient } from '@/lib/payload'
import { resolveTenant, resolveLayoutTenant } from '@/lib/tournament/tenant'
import { buildThemeCss, googleFontsHref } from '@/lib/tournament/theme'
import { getRequestBaseUrl, socialMetadata } from '@/lib/tournament/seo'
import { BRAND_NAME, SITE_DESCRIPTION, SITE_LOCALE } from '@/lib/site'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

// Default product faces (Cancha house style, matching the landing): an
// editorial serif for headings + a clean grotesque for body. Per-org fonts, when
// chosen, override these via --font-heading / --font-body (see globals.css).
const productSerif = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-product-heading',
  display: 'swap',
})
const productSans = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-product-body',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export async function generateMetadata(): Promise<Metadata> {
  const org = await resolveTenant(await getPayloadClient())
  const base = await getRequestBaseUrl()
  const siteName = org?.name ?? BRAND_NAME
  const description = SITE_DESCRIPTION
  return {
    metadataBase: new URL(base),
    // Child pages set a bare title (e.g. the tournament name); it's framed with
    // the tenant brand here. `default` is used for pages without their own title.
    title: { default: siteName, template: `%s | ${siteName}` },
    description,
    robots: 'index, follow',
    alternates: { canonical: '/' },
    ...socialMetadata({ org, title: siteName, description, path: '/' }),
  }
}

export default async function TournamentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Theme from the host org, or fall back to the logged-in manager's org so the
  // /manage dashboard is themed on the app domain too.
  const org = await resolveLayoutTenant(await getPayloadClient())
  // Theme the document root so the whole page (incl. the html canvas) is themed,
  // not just the body - avoids a mismatched band on short pages.
  const themeCss = org ? buildThemeCss(org.theme, ':root') : null
  const fontsHref = org ? googleFontsHref(org.theme.headingFont, org.theme.bodyFont) : null

  return (
    <html lang={SITE_LOCALE} suppressHydrationWarning>
      {/* Single background layer: ONLY the <body> paints var(--background) (it
          propagates to the whole viewport canvas because <html> has no background).
          Never also paint <html> - two layers of the same colour seam into a band. */}
      <body
        className={cn(
          productSerif.variable,
          productSans.variable,
          'tournament-scope antialiased min-h-screen bg-background text-foreground font-nugros',
        )}
      >
        {/* React 19 hoists <link>/<style> to <head>; the theme block is scoped to .tournament-scope. */}
        {fontsHref && <link rel="stylesheet" href={fontsHref} />}
        {themeCss && <style>{themeCss}</style>}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
