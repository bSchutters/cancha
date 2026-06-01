import { NextResponse, type NextRequest } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getSessionUser, getUserTenantId, isSuperAdmin } from '@/lib/tournament/session'
import { BASE_COLORS, RADIUS_PRESETS, FONTS, safeColor } from '@/lib/tournament/theme'

const FONT_VALUES = new Set(FONTS.map((f) => f.value))

/** PATCH /api/org/theme - a manager updates their own organization's theme. */
export async function PATCH(request: NextRequest) {
  const payload = await getPayloadClient()
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Non autorisé' } }, { status: 401 })
  }

  // The org to edit: a manager's own tenant, or an explicit id for the super-admin.
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const tenantId = getUserTenantId(user)
  const orgId = tenantId ?? (isSuperAdmin(user) ? body.org_id : null)
  if (orgId == null) {
    return NextResponse.json(
      { error: { code: 'NO_ORG', message: 'Aucune organisation associée à ce compte.' } },
      { status: 403 },
    )
  }

  // Sanitize every field to a known-safe value (never trust the client).
  const baseColor = typeof body.base_color === 'string' && body.base_color in BASE_COLORS ? body.base_color : undefined
  const radius = typeof body.radius === 'string' && body.radius in RADIUS_PRESETS ? body.radius : undefined
  const accentRaw = typeof body.accent_color === 'string' ? body.accent_color.trim() : ''
  const accent = accentRaw === '' ? null : safeColor(accentRaw)
  const headingFont =
    body.heading_font == null || body.heading_font === ''
      ? null
      : typeof body.heading_font === 'string' && FONT_VALUES.has(body.heading_font)
        ? body.heading_font
        : undefined
  const bodyFont =
    body.body_font == null || body.body_font === ''
      ? null
      : typeof body.body_font === 'string' && FONT_VALUES.has(body.body_font)
        ? body.body_font
        : undefined

  if (accentRaw !== '' && accent === null) {
    return NextResponse.json(
      { error: { code: 'BAD_COLOR', message: "Couleur d'accent invalide (hex ou oklch attendu)." } },
      { status: 400 },
    )
  }

  const data: Record<string, unknown> = { accent_color: accent }
  if (baseColor !== undefined) data.base_color = baseColor
  if (radius !== undefined) data.radius = radius
  if (headingFont !== undefined) data.heading_font = headingFont
  if (bodyFont !== undefined) data.body_font = bodyFont
  // Logo: a freshly uploaded media id, or an explicit removal.
  if (body.logo_remove === true) data.logo = null
  else if (typeof body.logo === 'number') data.logo = body.logo

  try {
    // Access on Organizations is super-admin-only; we enforce ownership ourselves
    // (tenantId === orgId for a manager) then override to perform the write.
    await payload.update({
      collection: 'organizations',
      id: orgId as string | number,
      data,
      overrideAccess: true,
    })
  } catch (err) {
    console.error('Org theme update error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: "Erreur lors de l'enregistrement" } },
      { status: 500 },
    )
  }

  return NextResponse.json({ data: { ok: true } })
}
