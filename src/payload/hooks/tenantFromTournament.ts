import { APIError, type CollectionBeforeValidateHook } from 'payload'
import { userHasTenant } from '../access'

type TenantRef = number | string | { id: number | string }

const idOf = (rel: unknown): number | string | null => {
  if (rel != null && typeof rel === 'object') return (rel as { id?: number | string }).id ?? null
  return (rel as number | string | null | undefined) ?? null
}

/**
 * Tenant-scoped child collections (teams, matches, referees, sponsors) belong to
 * the same organization (tenant) as their parent tournament.
 *
 * The parent is the single source of truth: `tenant` is always derived from the
 * tournament, overriding whatever the request sent. Keeping a client-supplied
 * value let an organizer create, through the REST API, a team in another
 * organization's tournament simply by labelling it with their own tenant (the
 * multi-tenant plugin only checks that the tenant is theirs, not that it matches
 * the tournament).
 *
 * When the write comes from a signed-in user (REST / admin UI), that user must
 * belong to the resolved organization. Server-side Local API calls (public
 * registration, the orchestrator, seeding) carry no user and are trusted.
 *
 * A document without a tournament (a reusable referee) keeps its own tenant, with
 * the same membership check.
 */
export const setTenantFromTournament: CollectionBeforeValidateHook = async ({ data, req, originalDoc }) => {
  if (!data) return data
  // Trusted server-side write that already names its tenant: skip the lookup, so
  // the orchestrator's bulk writes do not pay one extra query each.
  if (!req.user && data.tenant != null) return data

  const tournamentId = idOf(data.tournament ?? originalDoc?.tournament)

  if (tournamentId != null) {
    let tenant: TenantRef | null = null
    try {
      const t = await req.payload.findByID({
        collection: 'tournaments',
        id: tournamentId,
        depth: 0,
        overrideAccess: true,
        req,
      })
      tenant = ((t as { tenant?: TenantRef } | null)?.tenant ?? null) as TenantRef | null
    } catch {
      // Unknown tournament: leave it to the relationship validation to report.
      return data
    }
    if (tenant != null) data.tenant = idOf(tenant)
  }

  const tenant = data.tenant ?? originalDoc?.tenant
  if (req.user && tenant != null && !userHasTenant(req.user as never, tenant)) {
    throw new APIError('Cette organisation ne vous appartient pas.', 403)
  }

  return data
}
