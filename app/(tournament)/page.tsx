import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { LOCALES, DEFAULT_LOCALE, type Locale } from '@/i18n/config'
import { getPayloadClient } from '@/lib/payload'
import { resolveTenant } from '@/lib/tournament/tenant'

export const dynamic = 'force-dynamic'

// The locale lives in the path (/fr, /nl, /en). The bare host root redirects to:
//  - on a tenant host (subdomain/custom domain): the org's chosen public locale,
//  - on the apex (no tenant): the visitor's best Accept-Language match, else FR.
export default async function RootRedirect() {
  const org = await resolveTenant(await getPayloadClient())
  if (org) redirect(`/${org.defaultPublicLocale}`)

  const accept = (await headers()).get('accept-language') ?? ''
  const preferred = accept
    .split(',')
    .map((p) => p.split(';')[0]?.trim().slice(0, 2).toLowerCase())
  const match = preferred.find((p) => (LOCALES as readonly string[]).includes(p ?? '')) as
    | Locale
    | undefined
  redirect(`/${match ?? DEFAULT_LOCALE}`)
}
