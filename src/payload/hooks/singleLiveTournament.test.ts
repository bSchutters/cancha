import { describe, it, expect, vi } from 'vitest'
import { singleLiveTournament } from './singleLiveTournament'

type HookArgs = Parameters<typeof singleLiveTournament>[0]

function run(data: Record<string, unknown>, originalDoc?: Record<string, unknown>) {
  const update = vi.fn().mockResolvedValue({ docs: [] })
  const req = { payload: { update } }
  const result = singleLiveTournament({ data, originalDoc, req } as unknown as HookArgs)
  return { result, update, req }
}

describe('singleLiveTournament', () => {
  it('only finishes live tournaments of the same organization', async () => {
    const { result, update, req } = run({ status: 'live' }, { id: 7, tenant: 3 })
    await result
    expect(update).toHaveBeenCalledOnce()
    const args = update.mock.calls[0][0]
    expect(args.where.and).toContainEqual({ tenant: { equals: 3 } })
    expect(args.where.and).toContainEqual({ id: { not_equals: 7 } })
    expect(args.data).toEqual({ status: 'finished' })
    // Same transaction as the triggering write.
    expect(args.req).toBe(req)
  })

  it('reads the tenant from a populated relationship or from the incoming data', async () => {
    const populated = run({ status: 'live' }, { id: 7, tenant: { id: 5, name: 'Club' } })
    await populated.result
    expect(populated.update.mock.calls[0][0].where.and).toContainEqual({ tenant: { equals: 5 } })

    const created = run({ status: 'live', tenant: 9 })
    await created.result
    const where = created.update.mock.calls[0][0].where.and
    expect(where).toContainEqual({ tenant: { equals: 9 } })
    expect(where).toHaveLength(2) // no id to exclude on create
  })

  it('touches nothing when the organization is unknown', async () => {
    const { result, update } = run({ status: 'live' }, { id: 7 })
    await result
    expect(update).not.toHaveBeenCalled()
  })

  it('does nothing unless the tournament goes live', async () => {
    const { result, update } = run({ status: 'finished' }, { id: 7, tenant: 3 })
    expect(await result).toEqual({ status: 'finished' })
    expect(update).not.toHaveBeenCalled()
  })
})
