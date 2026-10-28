import type { Where } from 'payload'
import type { Id } from './types'

/**
 * Referees available to a tournament: its own, plus the organization's reusable
 * list (referees with no tournament).
 *
 * The reusable part MUST be filtered on the tenant. These queries run through the
 * Local API (access control off), and `tournament exists: false` alone matched
 * the reusable referees of every organization — leaking their contact details to
 * any organizer and drawing them onto other clubs' matches. A tournament with no
 * tenant only gets its own referees.
 */
export function refereePoolWhere(tournamentId: Id, tenant: unknown): Where {
  const own: Where = { tournament: { equals: tournamentId } }
  const tenantId = tenant != null && typeof tenant === 'object' ? (tenant as { id?: Id }).id : (tenant as Id | null | undefined)
  if (tenantId == null) return own
  return {
    or: [own, { and: [{ tournament: { exists: false } }, { tenant: { equals: tenantId } }] }],
  }
}
