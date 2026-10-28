import type { CollectionBeforeChangeHook } from 'payload'

const idOf = (rel: unknown): number | string | null => {
  if (rel != null && typeof rel === 'object') return (rel as { id?: number | string }).id ?? null
  return (rel as number | string | null | undefined) ?? null
}

/**
 * An organization runs a single "live" tournament at a time: going live finishes
 * the organization's previous live one.
 *
 * Scoped to the tournament's own organization. This ran through the Local API
 * (access control off) with no tenant filter, so one club going live finished
 * every other club's tournament mid-match. Without a known tenant there is no
 * safe scope, so nothing else is touched.
 */
export const singleLiveTournament: CollectionBeforeChangeHook = async ({ data, req, originalDoc }) => {
  if (data?.status !== 'live') return data

  const tenant = idOf(data.tenant ?? originalDoc?.tenant)
  if (tenant == null) return data

  await req.payload.update({
    collection: 'tournaments',
    where: {
      and: [
        { status: { equals: 'live' } },
        { tenant: { equals: tenant } },
        ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
      ],
    },
    data: { status: 'finished' },
    req,
  })
  return data
}
