/**
 * Format a tournament edition date for fr-BE display.
 *
 * Date-only values (e.g. "2026-06-12") are parsed as UTC midnight, so we format
 * in UTC to avoid showing the previous day in timezones behind UTC. Returns null
 * for empty or unparseable input.
 */
export function formatEditionDate(value: string | null | undefined): string | null {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('fr-BE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
