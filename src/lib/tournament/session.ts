import { headers as nextHeaders } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'

export interface SessionUser {
  id: number | string
  email?: string
  role?: string
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

/**
 * The single owner of the tool (developer). Only this user may see/use the dev
 * mode - set OWNER_EMAIL in the environment. Falls back to closed (no owner) so
 * dev features stay hidden if the env var is missing.
 */
export function isOwner(user: SessionUser | null): boolean {
  const owner = process.env.OWNER_EMAIL?.trim().toLowerCase()
  return !!owner && !!user?.email && user.email.trim().toLowerCase() === owner
}
