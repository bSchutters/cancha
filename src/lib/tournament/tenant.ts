import { headers } from 'next/headers'
import type { Payload } from 'payload'
import { normalizeTheme, type OrgTheme } from './theme'
import { getSessionUser, getUserTenantId, type SessionUser } from './session'

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
  subdomain: string | null
  customDomain: string | null
  accentColor: string | null
  logoUrl: string | null
  theme: OrgTheme
}

/** Only allow a valid hex colour to be injected into a <style> tag (no CSS injection). */
export function safeHexColor(value: string | null | undefined): string | null {
  return value && /^#[0-9a-fA-F]{3,8}$/.test(value.trim()) ? value.trim() : null
}

type OrgDoc = {
  id: string | number
  name?: string
  slug?: string
  subdomain?: string
  custom_domain?: string
  accent_color?: string
  base_color?: string
  radius?: string
  heading_font?: string
  body_font?: string
  logo?: { url?: string } | string | null
}

function toResolvedTenant(doc: OrgDoc): ResolvedTenant {
  return {
    id: doc.id,
    name: doc.name ?? '',
    slug: doc.slug ?? '',
    subdomain: doc.subdomain ?? null,
    customDomain: doc.custom_domain ?? null,
    accentColor: safeHexColor(doc.accent_color),
    logoUrl: doc.logo && typeof doc.logo === 'object' ? (doc.logo.url ?? null) : null,
    theme: normalizeTheme(doc),
  }
}

/**
 * Resolve the active organization (tenant) from the request host: a custom
 * domain match first, then a subdomain. Returns null for the apex / bare
 * localhost (no tenant scope -> public pages fall back to showing everything).
 */
export async function resolveTenant(payload: Payload): Promise<ResolvedTenant | null> {
  const host = (await headers()).get('host')
  if (!host) return null

  const toResolved = toResolvedTenant

  const bare = host.split(':')[0].toLowerCase()
  const byDomain = await payload.find({
    collection: 'organizations',
    where: { custom_domain: { equals: bare } },
    limit: 1,
    depth: 1,
  })
  if (byDomain.docs[0]) return toResolved(byDomain.docs[0] as never)

  const sub = subdomainFromHost(host)
  if (sub) {
    const bySub = await payload.find({
      collection: 'organizations',
      where: { subdomain: { equals: sub } },
      limit: 1,
      depth: 1,
    })
    if (bySub.docs[0]) return toResolved(bySub.docs[0] as never)
  }
  return null
}

export async function resolveTenantId(payload: Payload): Promise<string | number | null> {
  return (await resolveTenant(payload))?.id ?? null
}

/**
 * The organization that owns a tournament (by slug), regardless of the request
 * host. Used to canonicalise the apex copy of a tournament page to its tenant
 * host (depth 1 populates the multi-tenant `tenant` relationship).
 */
export async function resolveTournamentTenant(
  payload: Payload,
  slug: string,
): Promise<ResolvedTenant | null> {
  const res = await payload.find({
    collection: 'tournaments',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  const tenant = (res.docs[0] as { tenant?: unknown } | undefined)?.tenant
  return tenant && typeof tenant === 'object' ? toResolvedTenant(tenant as OrgDoc) : null
}

/** The only organization's id when exactly one exists, else null (dev/mono-client). */
async function singleOrgId(payload: Payload): Promise<string | number | null> {
  const res = await payload.find({ collection: 'organizations', limit: 2, depth: 0, overrideAccess: true })
  return res.totalDocs === 1 ? res.docs[0].id : null
}

/**
 * The organization a user may manage in /manage: their own tenant, or - for a
 * user without a tenant (e.g. the super-admin) - the single org when only one
 * exists. null means "ambiguous" (super-admin with several orgs -> use /admin).
 */
export async function resolveManageOrgId(
  payload: Payload,
  user: SessionUser | null,
): Promise<string | number | null> {
  return getUserTenantId(user) ?? (user ? await singleOrgId(payload) : null)
}

/**
 * Tenant used to theme the whole layout:
 *  1. the host-resolved org (public/TV on a subdomain or custom domain), else
 *  2. the logged-in user's own org (so /manage is themed on the app domain), else
 *  3. for any logged-in user (incl. the super-admin) when a single org exists.
 * Anonymous visitors on the apex get null (neutral).
 */
export async function resolveLayoutTenant(payload: Payload): Promise<ResolvedTenant | null> {
  const byHost = await resolveTenant(payload)
  if (byHost) return byHost

  const user = await getSessionUser()
  if (!user) return null

  const id = getUserTenantId(user) ?? (await singleOrgId(payload))
  if (id == null) return null
  try {
    const doc = await payload.findByID({
      collection: 'organizations',
      id,
      depth: 1,
      overrideAccess: true,
    })
    return doc ? toResolvedTenant(doc as OrgDoc) : null
  } catch {
    return null
  }
}
