import { describe, it, expect, afterEach, vi } from 'vitest'
import type { Access } from 'payload'
import { Media } from './Media'
import { Users } from './Users'

const admin = { id: 1, role: 'admin', email: 'owner@cancha.be' }
const manager = { id: 2, role: 'manager', email: 'club@example.be' }
const demo = { id: 3, role: 'manager', email: 'demo@cancha.be' }

const call = (access: Access | undefined, user: unknown) =>
  access?.({ req: { user } } as unknown as Parameters<Access>[0])

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('Media access', () => {
  it('lets organizers upload but not edit an existing media', () => {
    // Media is shared across organizations: editing in place would let one club
    // replace another club's logos.
    expect(call(Media.access?.create, manager)).toBe(true)
    expect(call(Media.access?.update, manager)).toBe(false)
    expect(call(Media.access?.update, null)).toBe(false)
    expect(call(Media.access?.update, admin)).toBe(true)
  })
})

describe('Users update access', () => {
  it('scopes a manager to their own account', () => {
    expect(call(Users.access?.update, manager)).toEqual({ id: { equals: 2 } })
    expect(call(Users.access?.update, null)).toBe(false)
    expect(call(Users.access?.update, admin)).toBe(true)
  })

  it('keeps the public demo account from changing its own credentials', () => {
    vi.stubEnv('DEMO_ENABLED', 'true')
    expect(call(Users.access?.update, demo)).toBe(false)
    // Same email casing tricks must not get around it.
    expect(call(Users.access?.update, { ...demo, email: ' Demo@Cancha.be ' })).toBe(false)
  })

  it('treats the demo address as a normal manager when the demo is off', () => {
    vi.stubEnv('DEMO_ENABLED', '')
    expect(call(Users.access?.update, demo)).toEqual({ id: { equals: 3 } })
  })
})
