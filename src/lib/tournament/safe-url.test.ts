import { describe, it, expect } from 'vitest'
import { safeExternalUrl } from './safe-url'

describe('safeExternalUrl', () => {
  it('keeps ordinary web links', () => {
    expect(safeExternalUrl('https://maps.google.com/?q=x')).toBe('https://maps.google.com/?q=x')
    expect(safeExternalUrl('http://club.be')).toBe('http://club.be')
    expect(safeExternalUrl('//cdn.example.com/x')).toBe('//cdn.example.com/x')
    // No scheme at all: nothing to abuse.
    expect(safeExternalUrl('club.be/sponsors')).toBe('club.be/sponsors')
    expect(safeExternalUrl('/local/page')).toBe('/local/page')
  })

  it('rejects script-bearing schemes', () => {
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull()
    expect(safeExternalUrl('JavaScript:alert(1)')).toBeNull()
    expect(safeExternalUrl('  javascript:alert(1)  ')).toBeNull()
    expect(safeExternalUrl('vbscript:msgbox(1)')).toBeNull()
    expect(safeExternalUrl('data:text/html;base64,PHNjcmlwdD4=')).toBeNull()
    expect(safeExternalUrl('file:///etc/passwd')).toBeNull()
  })

  it('passes through empty values unchanged', () => {
    expect(safeExternalUrl(null)).toBeNull()
    expect(safeExternalUrl(undefined)).toBeNull()
    expect(safeExternalUrl('')).toBeNull()
    expect(safeExternalUrl('   ')).toBeNull()
  })
})
