import { NextResponse, type NextRequest } from 'next/server'
import type { Payload } from 'payload'
import { getPayloadClient } from '@/lib/payload'
import { getUserTenantIds, type SessionUser } from './session'
import { TournamentError } from './orchestrator'

/**
 * Returns an authenticated admin/manager Payload client, or null if unauthorized.
 *
 * WARNING: this proves only that the caller is *an* organizer, NOT that they may
 * touch a given tournament. The orchestrator writes through Payload's Local API,
 * which runs with access control disabled, so the multi-tenant plugin does not
 * protect these routes. Any route acting on a specific tournament MUST use
 * `requireTournamentManager` / `requireMatchManager` instead.
 */
export async function requireManager(
  request: NextRequest,
): Promise<{ payload: Payload; user: SessionUser } | null> {
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: request.headers })
    if (user?.role === 'admin' || user?.role === 'manager') {
      return { payload, user: user as SessionUser }
    }
  } catch {
    // fall through
  }
  return null
}

/** True when `user` may act on a document owned by `tenant`. */
function ownsTenant(user: SessionUser, tenant: unknown): boolean {
  const allowed = getUserTenantIds(user)
  if (allowed === null) return true // super-admin: every organization
  if (allowed.length === 0) return false // manager with no org: nothing
  const id = tenant != null && typeof tenant === 'object' ? (tenant as { id?: unknown }).id : tenant
  if (id == null) return false
  return allowed.some((t) => String(t) === String(id))
}

/**
 * Authenticated organizer, scoped to ONE tournament.
 *
 * Taking the tournament reference as an argument is deliberate: a route cannot
 * obtain a client without naming what it is about to touch, so the tenant check
 * cannot be forgotten when a new endpoint is added.
 *
 * `ref` is either the numeric id or the slug (routes use both).
 */
export async function requireTournamentManager(
  request: NextRequest,
  ref: string,
): Promise<{ payload: Payload; user: SessionUser; tournamentId: number } | null> {
  const auth = await requireManager(request)
  if (!auth) return null
  const { payload, user } = auth
  try {
    const numeric = Number(ref)
    const res = await payload.find({
      collection: 'tournaments',
      where: Number.isFinite(numeric) && String(numeric) === ref ? { id: { equals: numeric } } : { slug: { equals: ref } },
      limit: 1,
      depth: 0,
    })
    const t = res.docs[0] as { id: number; tenant?: unknown } | undefined
    if (!t) return null
    if (!ownsTenant(user, t.tenant)) return null
    return { payload, user, tournamentId: t.id }
  } catch {
    return null
  }
}

/** Same guard, for routes addressing a single match (score entry). */
export async function requireMatchManager(
  request: NextRequest,
  matchId: string,
): Promise<{ payload: Payload; user: SessionUser; matchId: number } | null> {
  const auth = await requireManager(request)
  if (!auth) return null
  const { payload, user } = auth
  const id = Number(matchId)
  if (!Number.isFinite(id)) return null
  try {
    const match = (await payload.findByID({ collection: 'tournament-matches', id, depth: 0 })) as {
      id: number
      tenant?: unknown
    }
    if (!ownsTenant(user, match.tenant)) return null
    return { payload, user, matchId: match.id }
  } catch {
    return null
  }
}

/** Restricted to the platform super-admin (role 'admin'), or OWNER_EMAIL as a fallback. */
export async function requireOwner(request: NextRequest): Promise<{ payload: Payload } | null> {
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: request.headers })
    const u = user as { role?: string; email?: string } | null
    if (u?.role === 'admin') return { payload }
    const owner = process.env.OWNER_EMAIL?.trim().toLowerCase()
    if (owner && u?.email && u.email.trim().toLowerCase() === owner) return { payload }
  } catch {
    // fall through
  }
  return null
}

const ERROR_STATUS: Record<string, number> = {
  NOT_FOUND: 404,
  PRECONDITION_FAILED: 409,
  VALIDATION_ERROR: 400,
  DUPLICATE_TEAM_NAME: 409,
  REGISTRATION_CLOSED: 409,
}

/** Map an orchestrator action result/throw to a JSON response with the error contract. */
export async function runAction(fn: () => Promise<unknown>): Promise<NextResponse> {
  try {
    const data = await fn()
    return NextResponse.json({ data })
  } catch (err) {
    if (err instanceof TournamentError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: ERROR_STATUS[err.code] ?? 400 },
      )
    }
    console.error('Tournament action error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Erreur interne' } },
      { status: 500 },
    )
  }
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Non autorisé' } }, { status: 401 })
}
