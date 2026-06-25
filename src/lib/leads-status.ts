// Single source of truth for lead statuses (collection options, console board,
// dashboard badges) so labels never drift across the three.
export const LEAD_STATUSES = [
  { value: 'new', label: 'Nouveau' },
  { value: 'contacted', label: 'Contacté' },
  { value: 'converted', label: 'Converti' },
  { value: 'lost', label: 'Perdu' },
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]['value']

export const LEAD_STATUS_VALUES: readonly string[] = LEAD_STATUSES.map((s) => s.value)

export const LEAD_STATUS_LABEL: Record<string, string> = Object.fromEntries(
  LEAD_STATUSES.map((s) => [s.value, s.label]),
)
