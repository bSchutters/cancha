/**
 * Best-effort, in-memory rate limit keyed by client IP.
 *
 * On serverless this counts per warm instance rather than globally — durable
 * limiting would need a shared store such as Upstash — but it still blunts the
 * bursts that matter here: a script hammering a public endpoint that sends email
 * or writes rows on every call.
 */
const buckets = new Map<string, Map<string, number[]>>()

export function rateLimited(name: string, key: string, max: number, windowMs = 60_000): boolean {
  let hits = buckets.get(name)
  if (!hits) {
    hits = new Map()
    buckets.set(name, hits)
  }
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(key, recent)
  return recent.length > max
}

/** Caller IP from the proxy headers, or a constant when it cannot be determined. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip')?.trim() || 'unknown'
}
