import { describe, it, expect } from 'vitest'
import { csvCell } from './csv'

describe('csvCell', () => {
  it('quotes ordinary values and doubles inner quotes', () => {
    expect(csvCell('FC Lions')).toBe('"FC Lions"')
    expect(csvCell('Les "Rouges"')).toBe('"Les ""Rouges"""')
    expect(csvCell('')).toBe('""')
  })

  it('neutralizes values a spreadsheet would run as a formula', () => {
    expect(csvCell('=HYPERLINK("http://evil.example","x")')).toBe('"\'=HYPERLINK(""http://evil.example"",""x"")"')
    expect(csvCell('+32 470 00 00 00')).toBe('"\'+32 470 00 00 00"')
    expect(csvCell('-2+3')).toBe('"\'-2+3"')
    expect(csvCell('@SUM(A1)')).toBe('"\'@SUM(A1)"')
    expect(csvCell('\t=1+1')).toBe('"\'\t=1+1"')
    expect(csvCell('\r=1+1')).toBe('"\'\r=1+1"')
  })

  it('leaves trigger characters alone when they are not leading', () => {
    expect(csvCell('a=b')).toBe('"a=b"')
    expect(csvCell('team@club.be')).toBe('"team@club.be"')
  })
})
