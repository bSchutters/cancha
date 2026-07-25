import { NextResponse, type NextRequest } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { seedDemo } from '@/lib/demo/seed'
import { rateLimited, clientIp } from '@/lib/rate-limit'
import { isDemoEnabled } from '@/lib/demo/config'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/**
 * Rebuild the public demo.
 *
 * Deliberately open to visitors: the whole point is that anyone who finds the
 * playground half-played can restore it. It only ever touches the demo
 * organization (see seedDemo), and it does nothing at all unless the demo is
 * explicitly enabled, so a normal deployment does not expose it.
 *
 * Rebuilding runs the full engine, so it is slow and heavy on the database:
 * capped tightly per caller.
 */
export async function POST(request: NextRequest) {
  if (!isDemoEnabled()) return new NextResponse(null, { status: 404 })
  if (rateLimited('demo-reset', clientIp(request), 3, 5 * 60_000)) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMITED', message: 'Réinitialisation déjà lancée, patientez quelques minutes.' } },
      { status: 429 },
    )
  }
  try {
    const payload = await getPayloadClient()
    const result = await seedDemo(payload)
    return NextResponse.json({ data: result })
  } catch (err) {
    console.error('Demo reset failed:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Réinitialisation impossible' } }, { status: 500 })
  }
}
