import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { resolveTenantId } from '@/lib/tournament/tenant'
import { listPublicTournaments } from '@/lib/tournament/public-view'
import { getRequestBaseUrl } from '@/lib/tournament/seo'
import { SPORTS, PROFILES } from '@/lib/marketing/content'
import { GUIDES } from '@/lib/marketing/guides'
import { LOCALES, LOCALE_HREFLANG } from '@/i18n/config'

// Per-host sitemap: the tenant is resolved from the request headers, so each
// organization's subdomain/custom domain serves a sitemap listing only that
// organization's tournaments. URLs are locale-prefixed (/fr, /nl, /en) with
// hreflang alternates so each language version is indexed.
export const dynamic = 'force-dynamic'

type Opts = Partial<Omit<MetadataRoute.Sitemap[number], 'url' | 'alternates'>>

/** One sitemap entry per locale for a path, each carrying the full hreflang set. */
function localized(base: string, path: string, opts: Opts): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [LOCALE_HREFLANG[l], `${base}/${l}${path}`]))
  return LOCALES.map((l) => ({ url: `${base}/${l}${path}`, alternates: { languages }, ...opts }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getRequestBaseUrl()
  const payload = await getPayloadClient()
  const tenantId = await resolveTenantId(payload)

  const entries: MetadataRoute.Sitemap = [...localized(base, '', { changeFrequency: 'daily', priority: 1 })]

  // Tournament pages are owned by a tenant host. On the apex (tenantId === null)
  // those same tournaments live on their organizations' own hosts, so listing
  // them here would advertise duplicates of the canonical tenant-host URLs.
  if (tenantId != null) {
    const tournaments = await listPublicTournaments(payload, tenantId)
    for (const t of tournaments) {
      entries.push(
        ...localized(base, `/${t.slug}`, {
          changeFrequency: t.status === 'live' ? 'hourly' : 'weekly',
          priority: t.status === 'live' ? 0.9 : 0.7,
        }),
      )
    }
  } else {
    // Apex (no tenant): the marketing site. List the static + SEO pages here,
    // where they are canonical.
    for (const path of ['/fonctionnalites', '/demo', '/tarifs', '/comparatif', '/faq', '/a-propos', '/ressources']) {
      entries.push(...localized(base, path, { changeFrequency: 'monthly', priority: 0.6 }))
    }
    for (const s of SPORTS) {
      entries.push(...localized(base, `/sports/${s.slug}`, { changeFrequency: 'monthly', priority: 0.6 }))
    }
    for (const p of PROFILES) {
      entries.push(...localized(base, `/organisateurs/${p.slug}`, { changeFrequency: 'monthly', priority: 0.6 }))
    }
    for (const g of GUIDES) {
      entries.push(...localized(base, `/ressources/${g.slug}`, { changeFrequency: 'monthly', priority: 0.5 }))
    }
  }

  return entries
}
