import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { resolveTenantId } from '@/lib/tournament/tenant'
import { listPublicTournaments } from '@/lib/tournament/public-view'
import { getRequestBaseUrl } from '@/lib/tournament/seo'
import { SPORTS, PROFILES } from '@/lib/marketing/content'

// Per-host sitemap: the tenant is resolved from the request headers, so each
// organization's subdomain/custom domain serves a sitemap listing only that
// organization's tournaments.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getRequestBaseUrl()
  const entries: MetadataRoute.Sitemap = [{ url: base, changeFrequency: 'daily', priority: 1 }]

  const payload = await getPayloadClient()
  const tenantId = await resolveTenantId(payload)

  // Tournament pages are owned by a tenant host. On the apex (tenantId === null)
  // those same tournaments live on their organizations' own hosts, so listing
  // them here would advertise duplicates of the canonical tenant-host URLs.
  if (tenantId != null) {
    const tournaments = await listPublicTournaments(payload, tenantId)
    for (const t of tournaments) {
      entries.push({
        url: `${base}/${t.slug}`,
        changeFrequency: t.status === 'live' ? 'hourly' : 'weekly',
        priority: t.status === 'live' ? 0.9 : 0.7,
      })
    }
  } else {
    // Apex (no tenant): the marketing site. List the static + SEO pages here,
    // where they are canonical.
    for (const path of ['/tarifs', '/faq', '/a-propos']) {
      entries.push({ url: `${base}${path}`, changeFrequency: 'monthly', priority: 0.6 })
    }
    for (const s of SPORTS) {
      entries.push({ url: `${base}/sports/${s.slug}`, changeFrequency: 'monthly', priority: 0.6 })
    }
    for (const p of PROFILES) {
      entries.push({ url: `${base}/organisateurs/${p.slug}`, changeFrequency: 'monthly', priority: 0.6 })
    }
  }

  return entries
}
