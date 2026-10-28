export interface BulkOutcome {
  ok: string[]
  failed: string[]
}

/**
 * Run one request per id and report which ones actually succeeded.
 *
 * Sequential on purpose (a tournament has tens of teams, and each write fires
 * cache-revalidation hooks server-side). A request that throws or answers with a
 * non-2xx status counts as failed, so the caller can tell the organizer instead
 * of announcing a success that did not happen.
 */
export async function runBulk(ids: string[], request: (id: string) => Promise<Response>): Promise<BulkOutcome> {
  const outcome: BulkOutcome = { ok: [], failed: [] }
  for (const id of ids) {
    try {
      const res = await request(id)
      ;(res.ok ? outcome.ok : outcome.failed).push(id)
    } catch {
      outcome.failed.push(id)
    }
  }
  return outcome
}
