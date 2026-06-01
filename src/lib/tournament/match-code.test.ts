import { describe, it, expect } from 'vitest'
import { buildMatchCodes, type CodeableMatch } from './match-code'

const m = (over: Partial<CodeableMatch> & { id: string }): CodeableMatch => ({
  phase: 'group',
  groupLabel: null,
  bracketLabel: null,
  round: null,
  court: null,
  scheduledTime: null,
  ...over,
})

describe('buildMatchCodes', () => {
  it('codes group matches as R{round}{pool} (R1A, R2A…)', () => {
    const codes = buildMatchCodes([
      m({ id: 'a2', phase: 'group', groupLabel: 'A', round: 2, scheduledTime: '10:30', court: 1 }),
      m({ id: 'a1', phase: 'group', groupLabel: 'A', round: 1, scheduledTime: '10:00', court: 1 }),
      m({ id: 'b1', phase: 'group', groupLabel: 'B', round: 1, scheduledTime: '10:00', court: 2 }),
    ])
    expect(codes.get('a1')).toBe('R1A')
    expect(codes.get('a2')).toBe('R2A')
    expect(codes.get('b1')).toBe('R1B')
  })

  it('suffixes when a pool plays several matches in the same round (R1A1, R1A2)', () => {
    const codes = buildMatchCodes([
      m({ id: 'x', phase: 'group', groupLabel: 'A', round: 1, scheduledTime: '10:00', court: 1 }),
      m({ id: 'y', phase: 'group', groupLabel: 'A', round: 1, scheduledTime: '10:00', court: 2 }),
    ])
    expect(codes.get('x')).toBe('R1A1')
    expect(codes.get('y')).toBe('R1A2')
  })

  it('abbreviates knockout labels (QF/DF/F/P3) and numbers when several', () => {
    const codes = buildMatchCodes([
      m({ id: 'q1', phase: 'knockout', bracketLabel: 'Quart de finale', scheduledTime: '13:30', court: 1 }),
      m({ id: 'q2', phase: 'knockout', bracketLabel: 'Quart de finale', scheduledTime: '13:30', court: 2 }),
      m({ id: 'd1', phase: 'knockout', bracketLabel: 'Demi-finale', scheduledTime: '14:30', court: 1 }),
      m({ id: 'f', phase: 'knockout', bracketLabel: 'Finale', scheduledTime: '15:30', court: 1 }),
      m({ id: 'p', phase: 'knockout', bracketLabel: 'Petite finale (3e place)', scheduledTime: '15:30', court: 2 }),
    ])
    expect(codes.get('q1')).toBe('QF1')
    expect(codes.get('q2')).toBe('QF2')
    expect(codes.get('d1')).toBe('DF') // single demi in this set → no number
    expect(codes.get('f')).toBe('F')
    expect(codes.get('p')).toBe('P3')
  })

  it('codes classification place matches as PL<lo>', () => {
    const codes = buildMatchCodes([
      m({ id: 'c1', phase: 'classification', bracketLabel: 'Places 9-10', scheduledTime: '14:00' }),
    ])
    expect(codes.get('c1')).toBe('PL9')
  })
})
