import { NextResponse, type NextRequest } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getSessionUser, getUserTenantId, isSuperAdmin } from '@/lib/tournament/session'
import { isLocale } from '@/i18n/config'

/** PATCH /api/org/settings - a manager updates their org's language defaults. */
export async function PATCH(request: NextRequest) {
  const payload = await getPayloadClient()
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Non autorisé' } }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const tenantId = getUserTenantId(user)
  const orgId = tenantId ?? (isSuperAdmin(user) ? body.org_id : null)
  if (orgId == null) {
    return NextResponse.json(
      { error: { code: 'NO_ORG', message: 'Aucune organisation associée à ce compte.' } },
      { status: 403 },
    )
  }

  // Only accept the two locale fields, each validated against the supported set.
  const data: Record<string, unknown> = {}
  if (typeof body.default_manage_locale === 'string') {
    if (!isLocale(body.default_manage_locale)) {
      return NextResponse.json({ error: { code: 'BAD_LOCALE', message: 'Langue invalide.' } }, { status: 400 })
    }
    data.default_manage_locale = body.default_manage_locale
  }
  if (typeof body.default_public_locale === 'string') {
    if (!isLocale(body.default_public_locale)) {
      return NextResponse.json({ error: { code: 'BAD_LOCALE', message: 'Langue invalide.' } }, { status: 400 })
    }
    data.default_public_locale = body.default_public_locale
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: { code: 'NO_FIELDS', message: 'Rien à enregistrer.' } }, { status: 400 })
  }

  try {
    // Org access is super-admin-only; ownership is enforced above (tenantId === orgId).
    await payload.update({ collection: 'organizations', id: orgId as string | number, data, overrideAccess: true })
  } catch (err) {
    console.error('Org settings update error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: "Erreur lors de l'enregistrement" } },
      { status: 500 },
    )
  }

  return NextResponse.json({ data: { ok: true } })
}
