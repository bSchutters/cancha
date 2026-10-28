import { describe, it, expect } from 'vitest'
import { runBulk } from './bulk'

const respond = (status: number) => new Response(null, { status })

describe('runBulk', () => {
  it('reports each id as ok or failed from the response status', async () => {
    const outcome = await runBulk(['1', '2', '3'], async (id) => respond(id === '2' ? 403 : 200))
    expect(outcome).toEqual({ ok: ['1', '3'], failed: ['2'] })
  })

  it('counts a network error as a failure and keeps going', async () => {
    const outcome = await runBulk(['1', '2'], async (id) => {
      if (id === '1') throw new TypeError('Failed to fetch')
      return respond(204)
    })
    expect(outcome).toEqual({ ok: ['2'], failed: ['1'] })
  })

  it('runs the requests one after the other, in order', async () => {
    const seen: string[] = []
    let inFlight = 0
    await runBulk(['a', 'b', 'c'], async (id) => {
      inFlight++
      expect(inFlight).toBe(1)
      await new Promise((r) => setTimeout(r, 1))
      seen.push(id)
      inFlight--
      return respond(200)
    })
    expect(seen).toEqual(['a', 'b', 'c'])
  })
})
