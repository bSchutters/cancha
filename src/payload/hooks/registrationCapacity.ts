import type { CollectionAfterChangeHook } from 'payload'

const ACTIVE = ['pending', 'confirmed']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const idOf = (rel: any): number | null => (rel && typeof rel === 'object' ? rel.id : rel) ?? null

/**
 * Keeps a tournament's registration capacity in check:
 *  - auto-closes registration once the active roster (pending + confirmed) reaches
 *    capacity (num_groups × group_size), even for not-yet-validated teams;
 *  - when a team is refused, the oldest waitlisted team is repêchée (→ pending).
 *
 * Runs only when a team is created or its registration_status changes, so the
 * draw (group_label updates) doesn't trigger it.
 */
export const registrationCapacity: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  const statusChanged = previousDoc?.registration_status !== doc.registration_status
  if (operation !== 'create' && !statusChanged) return doc

  const tournamentId = idOf(doc.tournament)
  if (!tournamentId) return doc

  const t = await req.payload.findByID({ collection: 'tournaments', id: tournamentId, depth: 0 }).catch(() => null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tournament = t as any
  if (!tournament) return doc
  if (tournament.status !== 'registration' && tournament.status !== 'registration_closed') return doc

  const capacity = (tournament.num_groups ?? 0) * (tournament.group_size ?? 0)
  if (capacity <= 0) return doc

  const activeCount = async () => {
    const r = await req.payload.count({
      collection: 'tournament-teams',
      where: {
        and: [{ tournament: { equals: tournamentId } }, { registration_status: { in: ACTIVE } }],
      },
    })
    return r.totalDocs
  }

  // Repêchage: a team was just refused → promote the oldest waitlisted team.
  const becameRejected = previousDoc?.registration_status !== 'rejected' && doc.registration_status === 'rejected'
  if (becameRejected && (await activeCount()) < capacity) {
    const wl = await req.payload.find({
      collection: 'tournament-teams',
      where: {
        and: [{ tournament: { equals: tournamentId } }, { registration_status: { equals: 'waitlist' } }],
      },
      sort: 'createdAt',
      limit: 1,
      depth: 0,
    })
    const next = wl.docs[0]
    if (next) {
      await req.payload.update({
        collection: 'tournament-teams',
        id: next.id,
        overrideAccess: true,
        data: { registration_status: 'pending' },
      })
    }
  }

  // Auto-close once the roster is full.
  if (tournament.status === 'registration' && (await activeCount()) >= capacity) {
    await req.payload.update({
      collection: 'tournaments',
      id: tournamentId,
      overrideAccess: true,
      data: { status: 'registration_closed' },
    })
  }

  return doc
}
