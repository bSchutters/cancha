/**
 * Sanitize a user-supplied URL before it reaches an `href`.
 *
 * Venue and sponsor links are free-text fields filled in by organizers. Rendered
 * as-is, `javascript:alert(1)` in a sponsor link would run for every visitor of
 * that public page. Only http(s) and protocol-relative links survive; anything
 * else (javascript:, data:, vbscript:, file:…) becomes null so the caller renders
 * plain text instead of a link.
 *
 * Applied in the view-model rather than in a component, so every consumer — the
 * public page, the TV screen, a future export — is covered by construction.
 */
export function safeExternalUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  const url = raw.trim()
  if (!url) return null
  // Protocol-relative ("//example.com") inherits the page scheme: safe.
  if (url.startsWith('//')) return url
  // A bare domain or path has no scheme to abuse.
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) return url
  return /^https?:$/i.test(url.slice(0, url.indexOf(':') + 1)) ? url : null
}
