import { APIError, type CollectionBeforeDeleteHook } from 'payload'

/**
 * Refuse to delete a team that already plays matches.
 *
 * Deleting it would leave those matches without a home or away team, which the
 * standings and the bracket cannot recover from. Organizers reject the
 * registration instead, or reset the tournament first. Server-side cleanups
 * (reset, demo seeding) run without a user and delete matches before teams.
 */
export const preventDeletingScheduledTeam: CollectionBeforeDeleteHook = async ({ id, req }) => {
  if (!req.user) return
  const { totalDocs } = await req.payload.count({
    collection: 'tournament-matches',
    where: { or: [{ home_team: { equals: id } }, { away_team: { equals: id } }] },
    req,
  })
  if (totalDocs > 0) {
    throw new APIError(
      'Cette équipe a déjà des matchs : refusez son inscription ou réinitialisez le tournoi pour la supprimer.',
      409,
    )
  }
}
