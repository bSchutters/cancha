import { NextResponse, type NextRequest } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { registerTeam } from '@/lib/tournament/register'
import { TournamentError } from '@/lib/tournament/orchestrator'
import { rateLimited, clientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const ERROR_STATUS: Record<string, number> = {
  NOT_FOUND: 404,
  REGISTRATION_CLOSED: 409,
  DUPLICATE_TEAM_NAME: 409,
  VALIDATION_ERROR: 400,
}

/** Biggest team logo accepted, in bytes. Generous for a crest, small enough that
 *  the upload cannot be used to burn blob storage. */
const MAX_LOGO_BYTES = 2 * 1024 * 1024

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // Public endpoint that both writes rows and sends an email on every call, so
  // it is the natural target for a script: cap it per client.
  if (rateLimited('register', clientIp(request), 10)) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMITED', message: 'Trop de tentatives, réessayez dans une minute.' } },
      { status: 429 },
    )
  }
  try {
    const payload = await getPayloadClient()
    const contentType = request.headers.get('content-type') ?? ''

    let raw: unknown
    let logoId: number | null = null

    if (contentType.includes('multipart/form-data')) {
      const fd = await request.formData()
      raw = {
        teamName: fd.get('teamName'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        website: fd.get('website'),
      }
      const file = fd.get('logo')
      if (file instanceof File && file.size > MAX_LOGO_BYTES) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Logo trop volumineux (2 Mo maximum).' } },
          { status: 400 },
        )
      }
      // `file.type` is client-declared and trivially spoofed, so it is a filter,
      // not a guarantee; the size cap above is what bounds the damage.
      if (file instanceof File && file.size > 0 && file.type.startsWith('image/')) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const media = await payload.create({
          collection: 'media',
          overrideAccess: true, // public registration uploads its own logo
          data: { alt: String(fd.get('teamName') ?? 'logo') },
          file: { data: buffer, mimetype: file.type, name: file.name, size: file.size },
        })
        logoId = media.id as number
      }
    } else {
      raw = await request.json()
    }

    const result = await registerTeam(payload, slug, raw, logoId)
    return NextResponse.json({ data: result })
  } catch (err) {
    if (err instanceof TournamentError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: ERROR_STATUS[err.code] ?? 400 },
      )
    }
    console.error('Registration error:', err)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Erreur interne' } }, { status: 500 })
  }
}
