import { describe, it, expect } from 'vitest'
import { withTournamentLock } from './lock'

const tick = () => new Promise((r) => setTimeout(r, 5))

describe('withTournamentLock', () => {
  it('serializes concurrent calls on the same tournament', async () => {
    const events: string[] = []
    const job = (name: string) => async () => {
      events.push(`${name}:start`)
      await tick()
      events.push(`${name}:end`)
      return name
    }
    // Fired together, as two browser tabs would.
    const [a, b] = await Promise.all([withTournamentLock(1, job('a')), withTournamentLock(1, job('b'))])
    expect([a, b]).toEqual(['a', 'b'])
    // No interleaving: the second starts only after the first finished.
    expect(events).toEqual(['a:start', 'a:end', 'b:start', 'b:end'])
  })

  it('does not serialize different tournaments', async () => {
    const events: string[] = []
    const job = (name: string) => async () => {
      events.push(`${name}:start`)
      await tick()
      events.push(`${name}:end`)
    }
    await Promise.all([withTournamentLock(1, job('a')), withTournamentLock(2, job('b'))])
    // Both started before either finished.
    expect(events.slice(0, 2).sort()).toEqual(['a:start', 'b:start'])
  })

  it('lets the next caller run after one throws', async () => {
    await expect(
      withTournamentLock(3, async () => {
        throw new Error('boom')
      }),
    ).rejects.toThrow('boom')
    await expect(withTournamentLock(3, async () => 'ok')).resolves.toBe('ok')
  })
})
