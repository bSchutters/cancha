import Link from 'next/link'
import { cn } from '@/lib/utils'
import { display, focusRing } from './theme'
import { SPORTS, PROFILES, CONTACT_EMAIL } from '@/lib/marketing/content'

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn('text-sm text-muted-foreground transition-colors hover:text-foreground', focusRing)}>
      {children}
    </Link>
  )
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div>
          <span style={display} className="text-lg font-medium tracking-tight">
            Cancha
          </span>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
            La plateforme de gestion de tournois sportifs, du tirage au trophée.
          </p>
        </div>

        <nav className="flex flex-col gap-3">
          <span className="text-sm font-medium text-foreground">Produit</span>
          <FooterLink href="/fonctionnalites">Fonctionnalités</FooterLink>
          <FooterLink href="/demo">Aperçu interactif</FooterLink>
          <FooterLink href="/tarifs">Tarifs</FooterLink>
          <FooterLink href="/comparatif">Comparatif</FooterLink>
        </nav>

        <nav className="flex flex-col gap-3">
          <span className="text-sm font-medium text-foreground">Ressources</span>
          <FooterLink href="/ressources">Guides</FooterLink>
          <FooterLink href="/faq">FAQ</FooterLink>
          <FooterLink href="/a-propos">À propos</FooterLink>
        </nav>

        <nav className="flex flex-col gap-3">
          <span className="text-sm font-medium text-foreground">Sports</span>
          {SPORTS.slice(0, 5).map((s) => (
            <FooterLink key={s.slug} href={`/sports/${s.slug}`}>
              {s.name}
            </FooterLink>
          ))}
        </nav>

        <nav className="flex flex-col gap-3">
          <span className="text-sm font-medium text-foreground">Organisateurs</span>
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
              Contact
            </a>
            <FooterLink href="/mentions-legales">Mentions légales</FooterLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
