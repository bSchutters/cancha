'use client'

import { cn } from '@/lib/utils'
import { LocaleLink } from '@/components/locale-link'
import { useLocale } from '@/i18n/use-locale'
import { getDictionary } from '@/i18n'
import { display, focusRing } from './theme'
import { SPORTS, PROFILES, CONTACT_EMAIL } from '@/lib/marketing/content'

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <LocaleLink
      href={href}
      className={cn('text-sm text-muted-foreground transition-colors hover:text-foreground', focusRing)}
    >
      {children}
    </LocaleLink>
  )
}

export function MarketingFooter() {
  const dict = getDictionary(useLocale())
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div>
          <span style={display} className="text-lg font-medium tracking-tight text-primary">
            Cancha
          </span>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{dict.footer.tagline}</p>
        </div>

        <nav className="flex flex-col gap-3">
          <span className="text-sm font-medium text-foreground">{dict.footer.product}</span>
          <FooterLink href="/fonctionnalites">{dict.nav.features}</FooterLink>
          <FooterLink href="/demo">{dict.nav.demo}</FooterLink>
          <FooterLink href="/tarifs">{dict.nav.pricing}</FooterLink>
          <FooterLink href="/comparatif">{dict.nav.comparison}</FooterLink>
        </nav>

        <nav className="flex flex-col gap-3">
          <span className="text-sm font-medium text-foreground">{dict.footer.resources}</span>
          <FooterLink href="/ressources">{dict.nav.resources}</FooterLink>
          <FooterLink href="/faq">FAQ</FooterLink>
          <FooterLink href="/a-propos">À propos</FooterLink>
        </nav>

        <nav className="flex flex-col gap-3">
          <span className="text-sm font-medium text-foreground">{dict.footer.sports}</span>
          {SPORTS.slice(0, 5).map((s) => (
            <FooterLink key={s.slug} href={`/sports/${s.slug}`}>
              {s.name}
            </FooterLink>
          ))}
        </nav>

        <nav className="flex flex-col gap-3">
          <span className="text-sm font-medium text-foreground">{dict.footer.organizers}</span>
          {PROFILES.map((p) => (
            <FooterLink key={p.slug} href={`/organisateurs/${p.slug}`}>
              {p.name}
            </FooterLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <span>© 2026 Cancha</span>
          <div className="flex items-center gap-5">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={cn('text-sm text-muted-foreground transition-colors hover:text-foreground', focusRing)}
            >
              {dict.footer.contact}
            </a>
            <FooterLink href="/mentions-legales">{dict.footer.legal}</FooterLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
