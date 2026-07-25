import { headers as nextHeaders } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'

export interface SessionUser {
  id: number | string
  email?: string
  role?: string
  /** Organizations the user belongs to (added by the multi-tenant plugin). */
  tenants?: Array<{ tenant?: number | string | { id: number | string } }>
}

/** Read the authenticated Payload user from the request cookies (server components). */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const payload = await getPayloadClient()
    const h = await nextHeaders()
    const { user } = await payload.auth({ headers: h })
    return (user as SessionUser) ?? null
  } catch {
    return null
  }
}

export function isManager(user: SessionUser | null): boolean {
  return user?.role === 'admin' || user?.role === 'manager'
}

/** Platform super-admin: sees and manages every organization (no tenant scope). */
export function isSuperAdmin(user: SessionUser | null): boolean {
  return user?.role === 'admin'
}

/**
 * The organization (tenant) a manager belongs to. Returns null for a super-admin
 * (not scoped) or a user with no membership.
 */
export function getUserTenantId(user: SessionUser | null): number | string | null {
  if (isSuperAdmin(user)) return null
  const t = user?.tenants?.[0]?.tenant
  if (t == null) return null
  return typeof t === 'object' ? t.id : t
}

/**
 * EVERY organization the user belongs to (the plugin allows several).
 *
 * Returns `null` only for a super-admin, meaning "no tenant restriction". A
 * manager with no organization yields `[]`, which callers must read as "access
 * to nothing" — never as "access to everything". That distinction is what
 * `getUserTenantId` cannot express, since it collapses both cases to null.
 */
export function getUserTenantIds(user: SessionUser | null): (number | string)[] | null {
  if (isSuperAdmin(user)) return null
  return (user?.tenants ?? [])
    .map((t) => t?.tenant)
    .filter((t): t is number | string | { id: number | string } => t != null)
    .map((t) => (typeof t === 'object' ? t.id : t))
}

/**
 * The single owner of the tool (developer). Only this user may see/use the dev
 * mode - set OWNER_EMAIL in the environment. Falls back to closed (no owner) so
 * dev features stay hidden if the env var is missing.
 */
export function isOwner(user: SessionUser | null): boolean {
  if (isSuperAdmin(user)) return true
  const owner = process.env.OWNER_EMAIL?.trim().toLowerCase()
  return !!owner && !!user?.email && user.email.trim().toLowerCase() === owner
}
