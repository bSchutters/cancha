import '../globals.css'
import type { Metadata, Viewport } from 'next'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'Cup Generator',
  description: 'Gestion de tournois de futsal : inscriptions, tirage, calendrier, classements et résultats en direct.',
  robots: 'index, follow',
}

export default function TournamentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="h-full dark" suppressHydrationWarning>
      <body className={cn('tournament-scope antialiased min-h-full bg-spanish-bg text-white font-nugros')}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
