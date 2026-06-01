import '../globals.css'
import type { Metadata, Viewport } from 'next'
import { cn } from '@/lib/utils'
import { getPayloadClient } from '@/lib/payload'
import { resolveTenant, resolveLayoutTenant } from '@/lib/tournament/tenant'
import { buildThemeCss, googleFontsHref } from '@/lib/tournament/theme'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export async function generateMetadata(): Promise<Metadata> {
  const org = await resolveTenant(await getPayloadClient())
  return {
    title: org?.name ?? 'Cup Generator',
    description: 'Gestion de tournois de futsal : inscriptions, tirage, calendrier, classements et résultats en direct.',
    robots: 'index, follow',
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
    <html lang="fr" suppressHydrationWarning>
      {/* Single background layer: ONLY the <body> paints var(--background) (it
          propagates to the whole viewport canvas because <html> has no background).
          Never also paint <html> - two layers of the same colour seam into a band. */}
      <body className={cn('tournament-scope antialiased min-h-screen bg-background text-foreground font-nugros')}>
        {/* React 19 hoists <link>/<style> to <head>; the theme block is scoped to .tournament-scope. */}
        {fontsHref && <link rel="stylesheet" href={fontsHref} />}
        {themeCss && <style>{themeCss}</style>}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
