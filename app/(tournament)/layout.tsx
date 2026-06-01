import '../globals.css'
import type { Metadata, Viewport } from 'next'
import { cn } from '@/lib/utils'
import { getPayloadClient } from '@/lib/payload'
import { resolveTenant } from '@/lib/tournament/tenant'
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
  const org = await resolveTenant(await getPayloadClient())
  // accentColor is already sanitized to a valid hex in resolveTenant.
  const accent = org?.accentColor

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={cn('tournament-scope antialiased min-h-screen bg-background text-foreground font-nugros')}>
        {accent && (
          <style>{`.tournament-scope{--spanish-accent-2:${accent};--spanish-accent-2-light:color-mix(in srgb, ${accent} 70%, #fff);--spanish-accent-2-dark:color-mix(in srgb, ${accent} 65%, #000);}`}</style>
        )}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
