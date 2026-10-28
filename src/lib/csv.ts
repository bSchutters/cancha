/**
 * Characters that make a spreadsheet read a cell as a formula. Team names come
 * from the public registration form, so a team called `=HYPERLINK(...)` would
 * otherwise run in the organizer's Excel when they open the export (CSV / formula
 * injection). Tab and carriage return are on the OWASP list too: some apps strip
 * them and then see the formula behind.
 */
const FORMULA_TRIGGERS = /^[=+\-@\t\r]/

/** Escapes a CSV cell: neutralizes formulas, wraps in quotes, doubles inner quotes. */
export function csvCell(v: string): string {
  const safe = FORMULA_TRIGGERS.test(v) ? `'${v}` : v
  return `"${safe.replace(/"/g, '""')}"`
}
