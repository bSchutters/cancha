import Link from 'next/link'
import { AREA_SERVED, BRAND_NAME, SITE_DESCRIPTION, SITE_LOCALE } from '@/lib/site'
import { CONTACT_EMAIL, PRICE_TIERS } from '@/lib/marketing/content'

/** Renders a JSON-LD <script>, escaping `<` so the payload can't break out. */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

/**
 * Site-wide structured data for the apex landing: Organization + WebSite +
 * SoftwareApplication (with the pay-per-team price floor). URLs are absolute and
 * derived from the request host, so they stay correct on the Vercel URL today
 * and on the real domain later.
 */
export function SiteJsonLd({ baseUrl }: { baseUrl: string }) {
  const lowPrice = Math.min(...PRICE_TIERS.map((t) => t.rate))
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': `${baseUrl}/#organization`,
            name: BRAND_NAME,
            url: baseUrl,
            email: CONTACT_EMAIL,
            description: SITE_DESCRIPTION,
            areaServed: { '@type': 'Country', name: 'Belgium' },
          },
          {
            '@type': 'WebSite',
            '@id': `${baseUrl}/#website`,
            name: BRAND_NAME,
            url: baseUrl,
            inLanguage: SITE_LOCALE,
            publisher: { '@id': `${baseUrl}/#organization` },
          },
          {
            '@type': 'SoftwareApplication',
            name: BRAND_NAME,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            url: baseUrl,
            inLanguage: SITE_LOCALE,
            description: SITE_DESCRIPTION,
            areaServed: AREA_SERVED,
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'EUR',
              lowPrice: String(lowPrice),
              offerCount: PRICE_TIERS.length,
            },
          },
        ],
      }}
    />
  )
}

type Crumb = { name: string; href?: string }

/**
 * Visible breadcrumb trail + matching BreadcrumbList JSON-LD. The last item is
 * the current page (no href). `baseUrl` is the request host so the structured
 * data carries absolute, self-referential URLs.
 */
export function Breadcrumbs({ baseUrl, items }: { baseUrl: string; items: Crumb[] }) {
  return (
    <nav aria-label="Fil d’Ariane" className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((it, i) => (
          <li key={it.name} className="flex items-center gap-1.5">
            {i > 0 && (
              <span aria-hidden className="text-border">
                /
              </span>
            )}
            {it.href ? (
              <Link href={it.href} className="transition-colors hover:text-foreground">
                {it.name}
              </Link>
            ) : (
              <span className="text-foreground" aria-current="page">
                {it.name}
              </span>
            )}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((it, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: it.name,
            ...(it.href ? { item: `${baseUrl}${it.href}` } : {}),
          })),
        }}
      />
    </nav>
  )
}
