'use server'

import { getPayloadClient } from '@/lib/payload'
import { getSessionUser } from '@/lib/tournament/session'
import { resolveManageOrgId } from '@/lib/tournament/tenant'
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/i18n/config'

/**
 * Locale the organizer backoffice should open in right after login: the org's
 * configured `default_manage_locale`. Falls back to FR (ambiguous super-admin,
 * no org, or any error). Read server-side because it lives on the org, not the
 * session user. The auth cookie set by /api/users/login is present here.
 */
export async function manageLandingLocale(): Promise<Locale> {
  try {
    const payload = await getPayloadClient()
    const orgId = await resolveManageOrgId(payload, await getSessionUser())
    if (orgId == null) return DEFAULT_LOCALE
    const org = await payload.findByID({ collection: 'organizations', id: orgId, depth: 0, overrideAccess: true })
    const loc = (org as { default_manage_locale?: string }).default_manage_locale
    return isLocale(loc) ? loc : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}
