import { APIError, type CollectionBeforeValidateHook } from 'payload'
import { isDemoUser } from '@/lib/demo/config'

/**
 * A tournament belongs to the organization of whoever creates it.
 *
 * The multi-tenant plugin makes `tenant` required, but it only auto-fills it
 * from the tenant-selector cookie of the Payload admin UI. The custom /manage
 * interface never sets that cookie, so creating a tournament there failed with
 * "Ce champ est requis" pointing at a field the form does not even show — an
 * error an organizer has no way to act on.
 *
 * Mirrors `setTenantFromTournament`, which already does this for the child
 * collections; the parent had simply been left out.
 *
 * Resolution order, matching `resolveManageOrgId`:
 *   1. an explicitly provided tenant wins (admin UI, seeding, imports),
 *   2. otherwise the creator's own organization,
 *   3. otherwise, when a single organization exists, that one (covers a
 *      super-admin who belongs to none),
 *   4. otherwise leave it unset: a super-admin with several organizations is
 *      genuinely ambiguous, and the required-field error is then the right
 *      answer rather than a silent wrong guess.
 */
export const setTenantFromUser: CollectionBeforeValidateHook = async ({ data, req, operation }) => {
  if (!data || operation !== 'create') return data

  // The demo account may explore the creation form, but not actually create:
  // the demo would otherwise fill up with half-configured tournaments between
  // resets. Enforced here rather than only in the UI, since a client-side guard
  // is trivially bypassed.
  if (isDemoUser(req.user as { email?: string } | null)) {
    throw new APIError('DEMO_READ_ONLY', 403)
  }

  if (data.tenant != null) return data

  const user = req.user as { tenants?: Array<{ tenant?: unknown }> } | null
  const own = user?.tenants?.[0]?.tenant
  if (own != null) {
    data.tenant = typeof own === 'object' ? (own as { id: number | string }).id : own
    return data
  }

  try {
    const orgs = await req.payload.find({
      collection: 'organizations',
      limit: 2,
      depth: 0,
      overrideAccess: true,
    })
    if (orgs.totalDocs === 1) data.tenant = orgs.docs[0].id
  } catch {
    // Leave unset; the required-field validation will surface the problem.
  }

  return data
}
