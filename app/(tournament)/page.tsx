import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { DEFAULT_LOCALE, bestAcceptLocale } from '@/i18n/config'
import { getPayloadClient } from '@/lib/payload'
import { resolveTenant } from '@/lib/tournament/tenant'

export const dynamic = 'force-dynamic'

// The locale lives in the path (/fr, /nl, /en). The bare host root redirects to:
//  - on a tenant host (subdomain/custom domain): the org's chosen public locale,
//  - on the apex (no tenant): the visitor's best Accept-Language match, else FR.
// The query string (utm_*, ref…) is carried across so campaign attribution survives.
export default async function RootRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(await searchParams)) {
    if (Array.isArray(value)) value.forEach((v) => qs.append(key, v))
    else if (value != null) qs.set(key, value)
  }
  const suffix = qs.toString() ? `?${qs}` : ''

  const org = await resolveTenant(await getPayloadClient())
  if (org) redirect(`/${org.defaultPublicLocale}${suffix}`)

  const accept = (await headers()).get('accept-language') ?? ''
  redirect(`/${bestAcceptLocale(accept) ?? DEFAULT_LOCALE}${suffix}`)
}
