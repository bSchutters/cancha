import { describe, it, expect, vi } from 'vitest'
import { setTenantFromTournament } from './tenantFromTournament'
import { userHasTenant } from '../access'

type HookArgs = Parameters<typeof setTenantFromTournament>[0]

const managerOf = (...tenants: number[]) => ({ id: 1, role: 'manager', tenants: tenants.map((tenant) => ({ tenant })) })

/** Tournament 10 belongs to organization 1, tournament 20 to organization 2. */
function run(data: Record<string, unknown>, opts: { user?: unknown; originalDoc?: Record<string, unknown> } = {}) {
  const findByID = vi.fn(async ({ id }: { id: number }) => {
    if (id === 10) return { id, tenant: 1 }
    if (id === 20) return { id, tenant: { id: 2 } }
    throw new Error('not found')
  })
  const req = { user: opts.user ?? null, payload: { findByID } }
  const result = setTenantFromTournament({ data, req, originalDoc: opts.originalDoc } as unknown as HookArgs)
  return { result, findByID }
}

describe('setTenantFromTournament', () => {
  it('derives the tenant from the parent tournament', async () => {
    const { result } = run({ tournament: 20 })
    expect(await result).toMatchObject({ tenant: 2 })
  })

  it("overrides a client-supplied tenant with the tournament's", async () => {
    // Manager of org 1 sending their own tenant on another org's tournament.
    const { result } = run({ tournament: 20, tenant: 1 }, { user: managerOf(1) })
    await expect(result).rejects.toMatchObject({ status: 403 })
  })

  it('lets a member write into their own tournament', async () => {
    const { result } = run({ tournament: 10, tenant: 2 }, { user: managerOf(1) })
    expect(await result).toMatchObject({ tenant: 1 })
  })

  it('re-derives the tenant on a partial update from the stored tournament', async () => {
    const { result } = run({ name: 'Renamed', tenant: 1 }, { user: managerOf(1), originalDoc: { tournament: 20, tenant: 2 } })
    await expect(result).rejects.toMatchObject({ status: 403 })
  })

  it('lets a super-admin write anywhere', async () => {
    const { result } = run({ tournament: 20 }, { user: { id: 9, role: 'admin' } })
    expect(await result).toMatchObject({ tenant: 2 })
  })

  it('checks membership for documents without a tournament (reusable referees)', async () => {
    await expect(run({ name: 'Ref', tenant: 2 }, { user: managerOf(1) }).result).rejects.toMatchObject({ status: 403 })
    expect(await run({ name: 'Ref', tenant: 1 }, { user: managerOf(1) }).result).toMatchObject({ tenant: 1 })
  })

  it('trusts server-side writes that already name their tenant, without a lookup', async () => {
    const { result, findByID } = run({ tournament: 20, tenant: 2 })
    expect(await result).toMatchObject({ tenant: 2 })
    expect(findByID).not.toHaveBeenCalled()
  })

  it('leaves an unknown tournament to the relationship validation', async () => {
    const { result } = run({ tournament: 99 }, { user: managerOf(1) })
    expect(await result).toEqual({ tournament: 99 })
  })
})

describe('userHasTenant', () => {
  it('matches memberships whether ids are numbers, strings or populated docs', () => {
    expect(userHasTenant({ role: 'manager', tenants: [{ tenant: { id: 3 } }] }, 3)).toBe(true)
    expect(userHasTenant({ role: 'manager', tenants: [{ tenant: 3 }] }, '3')).toBe(true)
    expect(userHasTenant({ role: 'manager', tenants: [{ tenant: 3 }] }, { id: 4 })).toBe(false)
  })

  it('never matches without a tenant or without memberships', () => {
    expect(userHasTenant({ role: 'manager', tenants: [] }, 3)).toBe(false)
    expect(userHasTenant({ role: 'manager' }, 3)).toBe(false)
    expect(userHasTenant({ role: 'manager', tenants: [{ tenant: 3 }] }, null)).toBe(false)
    expect(userHasTenant(null, 3)).toBe(false)
  })

  it('always matches for a super-admin', () => {
    expect(userHasTenant({ role: 'admin' }, 42)).toBe(true)
  })
})
