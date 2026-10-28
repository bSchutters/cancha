import { describe, it, expect, vi } from 'vitest'
import type { Access } from 'payload'
import { preventDeletingScheduledTeam } from './teamDeletion'
import { TournamentTeams } from '../collections/TournamentTeams'

type HookArgs = Parameters<typeof preventDeletingScheduledTeam>[0]

function run(matchCount: number, user: unknown = { id: 1, role: 'manager' }) {
  const count = vi.fn().mockResolvedValue({ totalDocs: matchCount })
  const req = { user, payload: { count } }
  const result = preventDeletingScheduledTeam({ id: 5, req } as unknown as HookArgs)
  return { result, count, req }
}

describe('preventDeletingScheduledTeam', () => {
  it('lets an organizer delete a team that plays no match yet', async () => {
    const { result, count, req } = run(0)
    await expect(result).resolves.toBeUndefined()
    const args = count.mock.calls[0][0]
    expect(args.collection).toBe('tournament-matches')
    expect(args.where).toEqual({ or: [{ home_team: { equals: 5 } }, { away_team: { equals: 5 } }] })
    expect(args.req).toBe(req)
  })

  it('refuses once the team is in a match', async () => {
    await expect(run(3).result).rejects.toMatchObject({ status: 409 })
  })

  it('stays out of the way of server-side cleanups', async () => {
    const { result, count } = run(3, null)
    await expect(result).resolves.toBeUndefined()
    expect(count).not.toHaveBeenCalled()
  })
})

describe('TournamentTeams delete access', () => {
  const del = (user: unknown) =>
    (TournamentTeams.access?.delete as Access)({ req: { user } } as unknown as Parameters<Access>[0])

  it("scopes an organizer to their own organizations' teams", () => {
    expect(del({ id: 2, role: 'manager', tenants: [{ tenant: 1 }, { tenant: { id: 4 } }] })).toEqual({
      tenant: { in: [1, 4] },
    })
  })

  it('lets a super-admin delete any team', () => {
    expect(del({ id: 1, role: 'admin' })).toBe(true)
  })

  it('denies anonymous callers and organizers without an organization', () => {
    expect(del(null)).toBe(false)
    expect(del({ id: 3, role: 'manager', tenants: [] })).toBe(false)
    expect(del({ id: 3, role: 'manager' })).toBe(false)
  })
})
