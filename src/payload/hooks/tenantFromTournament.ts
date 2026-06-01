import type { CollectionBeforeValidateHook } from 'payload'

/**
 * Tenant-scoped child collections (teams, matches, referees, sponsors) belong to
 * the same organization (tenant) as their parent tournament. The multi-tenant
 * plugin makes the `tenant` field required, but programmatic/REST creates have
 * no selected-tenant context (e.g. a super-admin with no tenant cookie). This
 * hook derives `tenant` from the related tournament when it isn't already set,
 * so adding a team, seeding, drawing, scheduling, etc. all work.
 */
export const setTenantFromTournament: CollectionBeforeValidateHook = async ({ data, req }) => {
  if (!data || data.tenant != null) return data

  const tournament = data.tournament
  if (tournament == null) return data
  const tournamentId =
    typeof tournament === 'object' ? (tournament as { id: number | string }).id : tournament

  try {
    const t = await req.payload.findByID({
      collection: 'tournaments',
      id: tournamentId,
      depth: 0,
      overrideAccess: true,
    })
    const tenant = (t as { tenant?: number | string | { id: number | string } } | null)?.tenant
    if (tenant != null) data.tenant = typeof tenant === 'object' ? tenant.id : tenant
  } catch {
    // Leave unset; the required-field validation will surface the problem.
  }

  return data
}
