import { cn } from '@/lib/utils'
import { BRAND, fontVars } from './theme'
import { MarketingNav } from './nav'
import { MarketingFooter } from './footer'
import { SmoothScroll } from './motion'
import { StickyCta } from './sticky-cta'
import { Analytics } from './analytics'
import { AnnouncementBar } from './announcement-bar'

/**
 * Wrapper for every marketing page: scopes the brand theme (cream + ink-blue) and
 * fonts via CSS variables, mounts Lenis smooth scroll, and frames content with the
 * shared nav + footer. Never used by tenant tournament pages, /manage or /admin.
 */
export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={BRAND}
      className={cn(fontVars, 'min-h-screen overflow-x-hidden bg-background text-foreground antialiased')}
    >
      <SmoothScroll>
        <AnnouncementBar />
        <MarketingNav />
        <main>{children}</main>
        <MarketingFooter />
      </SmoothScroll>
      <StickyCta />
      <Analytics />
    </div>
  )
}
