import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { LOCALES, DEFAULT_LOCALE, type Locale } from '@/i18n/config'
import { getPayloadClient } from '@/lib/payload'
import { resolveTenant } from '@/lib/tournament/tenant'

export const dynamic = 'force-dynamic'

// Best supported locale from an Accept-Language header, honoring q-values (a
// lower-priority tag must not win just because it appears first).
function bestAcceptLocale(accept: string): Locale | undefined {
  return accept
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';')
      const qParam = params.find((p) => p.trim().startsWith('q='))
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1
      return { lang: tag?.trim().slice(0, 2).toLowerCase() ?? '', q: Number.isFinite(q) ? q : 0 }
    })
    .filter((e) => (LOCALES as readonly string[]).includes(e.lang))
    .sort((a, b) => b.q - a.q)[0]?.lang as Locale | undefined
}

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
