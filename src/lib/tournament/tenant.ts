import { headers } from 'next/headers'
import type { Payload } from 'payload'

/**
 * Extract the tenant subdomain from a host.
 *  - `asturiana.localhost:3001` -> 'asturiana'  (browsers resolve *.localhost locally)
 *  - `asturiana.cupgenerator.app` -> 'asturiana'
 *  - bare `localhost`, apex domain, or `www.` -> null (no tenant)
 */
export function subdomainFromHost(host: string | null): string | null {
  if (!host) return null
  const h = host.split(':')[0].toLowerCase()
  if (h === 'localhost') return null
  if (h.endsWith('.localhost')) return h.split('.')[0] || null
  const parts = h.split('.')
  if (parts.length >= 3 && parts[0] !== 'www') return parts[0]
  return null
}

export interface ResolvedTenant {
  id: string | number
  name: string
  slug: string
  accentColor: string | null
}

/**
 * Resolve the active organization (tenant) from the request host: a custom
 * domain match first, then a subdomain. Returns null for the apex / bare
 * localhost (no tenant scope -> public pages fall back to showing everything).
 */
export async function resolveTenant(payload: Payload): Promise<ResolvedTenant | null> {
  const host = (await headers()).get('host')
  if (!host) return null

  const toResolved = (doc: { id: string | number; name?: string; slug?: string; accent_color?: string }): ResolvedTenant => ({
    id: doc.id,
    name: doc.name ?? '',
    slug: doc.slug ?? '',
    accentColor: doc.accent_color ?? null,
  })

  const bare = host.split(':')[0].toLowerCase()
  const byDomain = await payload.find({
    collection: 'organizations',
    where: { custom_domain: { equals: bare } },
    limit: 1,
    depth: 0,
  })
  if (byDomain.docs[0]) return toResolved(byDomain.docs[0] as never)

  const sub = subdomainFromHost(host)
  if (sub) {
    const bySub = await payload.find({
      collection: 'organizations',
      where: { subdomain: { equals: sub } },
      limit: 1,
      depth: 0,
    })
    if (bySub.docs[0]) return toResolved(bySub.docs[0] as never)
  }
  return null
}

export async function resolveTenantId(payload: Payload): Promise<string | number | null> {
  return (await resolveTenant(payload))?.id ?? null
}
