import { NextResponse, type NextRequest } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { registerTeam } from '@/lib/tournament/register'
import { TournamentError } from '@/lib/tournament/orchestrator'

export const dynamic = 'force-dynamic'

const ERROR_STATUS: Record<string, number> = {
  NOT_FOUND: 404,
  REGISTRATION_CLOSED: 409,
  DUPLICATE_TEAM_NAME: 409,
  VALIDATION_ERROR: 400,
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
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
