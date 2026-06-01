import { NextResponse, type NextRequest } from 'next/server'
import type { Payload } from 'payload'
import { getPayloadClient } from '@/lib/payload'
import { TournamentError } from './orchestrator'

/** Returns an authenticated admin/manager Payload client, or null if unauthorized. */
export async function requireManager(
  request: NextRequest,
): Promise<{ payload: Payload } | null> {
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: request.headers })
    if (user?.role === 'admin' || user?.role === 'manager') return { payload }
  } catch {
    // fall through
  }
  return null
}

/** Like {@link requireManager} but restricted to the single tool owner (OWNER_EMAIL). */
export async function requireOwner(request: NextRequest): Promise<{ payload: Payload } | null> {
  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({ headers: request.headers })
    const owner = process.env.OWNER_EMAIL?.trim().toLowerCase()
    if (owner && user?.email && user.email.trim().toLowerCase() === owner) return { payload }
  } catch {
    // fall through
  }
  return null
}

const ERROR_STATUS: Record<string, number> = {
  NOT_FOUND: 404,
  PRECONDITION_FAILED: 409,
  VALIDATION_ERROR: 400,
  DUPLICATE_TEAM_NAME: 409,
  REGISTRATION_CLOSED: 409,
}

/** Map an orchestrator action result/throw to a JSON response with the error contract. */
export async function runAction(fn: () => Promise<unknown>): Promise<NextResponse> {
  try {
    const data = await fn()
    return NextResponse.json({ data })
  } catch (err) {
    if (err instanceof TournamentError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: ERROR_STATUS[err.code] ?? 400 },
      )
    }
    console.error('Tournament action error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'Erreur interne' } },
      { status: 500 },
    )
  }
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Non autorisé' } }, { status: 401 })
}
