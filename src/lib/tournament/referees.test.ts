import { describe, it, expect } from 'vitest'
import { refereePoolWhere } from './referees'

describe('refereePoolWhere', () => {
  it("limits reusable referees to the tournament's organization", () => {
    expect(refereePoolWhere(12, 3)).toEqual({
      or: [
        { tournament: { equals: 12 } },
        { and: [{ tournament: { exists: false } }, { tenant: { equals: 3 } }] },
      ],
    })
  })

  it('accepts a populated tenant relationship', () => {
    expect(refereePoolWhere(12, { id: 3, name: 'Club' })).toEqual(refereePoolWhere(12, 3))
  })

  it('never matches other organizations when the tenant is unknown', () => {
    for (const tenant of [null, undefined, {}]) {
      expect(refereePoolWhere(12, tenant)).toEqual({ tournament: { equals: 12 } })
    }
  })
})
