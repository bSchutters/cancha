import { headers } from 'next/headers'
import type { Metadata } from 'next'
import type { ResolvedTenant } from './tenant'

/**
 * Absolute base URL for the *current request host*.
 *
 * This app is multi-tenant by host: every organization is served on its own
 * host (`{subdomain}.cupgenerator.app` or a custom domain), and the apex
 * (`cupgenerator.app`) is the public landing. Deriving the base from the request
 * host therefore gives each tenant correct, self-referential metadataBase /
 * canonical / sitemap / Open Graph URLs with zero global configuration - and
 * never canonicalises to a host that isn't actually serving yet.
 */
export async function getRequestBaseUrl(): Promise<string> {
  const h = await headers()
  const host = h.get('host') ?? 'localhost:3000'
  const bare = host.split(':')[0].toLowerCase()
  const isLocal = bare === 'localhost' || bare.endsWith('.localhost') || bare === '127.0.0.1'
  const proto = h.get('x-forwarded-proto') ?? (isLocal ? 'http' : 'https')
  return `${proto}://${host}`
}

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'cupgenerator.app'

/**
 * The canonical, indexable base URL for a tenant. A tournament is reachable both
 * on its organization's host and on the apex fallback, so its canonical must
 * point at the tenant host to avoid duplicate content. Subdomains are the live
 * tenant hosts today; custom domains are provisioned later, so we never
 * canonicalise to one. Outside production (and for tenants without a subdomain)
 * we keep the request-derived `fallback` so dev never canonicalises to prod.
 */
export function tenantBaseUrl(
  org: { subdomain: string | null } | null,
  fallback: string,
): string {
  if (org?.subdomain && process.env.NODE_ENV === 'production') {
    return `https://${org.subdomain}.${ROOT_DOMAIN}`
  }
  return fallback
}

/**
 * Open Graph + Twitter card metadata branded for the active tenant. URLs and
 * image paths are relative; Next.js resolves them against `metadataBase` (the
 * current tenant host). `images` lets a page override the default (tenant logo)
 * with a more specific visual, e.g. a tournament poster; falsy entries are
 * ignored so callers can pass `[t.visualUrl, org?.logoUrl]` as a preference list.
 */
export function socialMetadata(opts: {
  org: ResolvedTenant | null
  title: string
  description?: string
  path?: string
  images?: (string | null | undefined)[]
  card?: 'summary' | 'summary_large_image'
}): Pick<Metadata, 'openGraph' | 'twitter'> {
  const siteName = opts.org?.name ?? 'Cup Generator'
  // Pass `images: []` when a file-based opengraph-image route supplies the image
  // (it becomes og:image automatically, and Twitter falls back to it).
  const picked = (opts.images ?? [opts.org?.logoUrl]).filter(Boolean) as string[]
  const images = picked.length ? picked : undefined
  return {
    openGraph: {
      type: 'website',
      siteName,
      locale: 'fr_BE',
      title: opts.title,
      description: opts.description,
      url: opts.path ?? '/',
      images,
    },
    twitter: {
      card: opts.card ?? (images ? 'summary_large_image' : 'summary'),
      title: opts.title,
      description: opts.description,
      images,
    },
  }
}
