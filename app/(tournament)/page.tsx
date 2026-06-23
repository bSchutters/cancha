import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { LOCALES, DEFAULT_LOCALE, type Locale } from '@/i18n/config'

// The locale lives in the path (/fr, /nl, /en). The bare host root redirects to
// the visitor's best matching locale (Accept-Language), defaulting to FR.
export default async function RootRedirect() {
  const accept = (await headers()).get('accept-language') ?? ''
  const preferred = accept
    .split(',')
    .map((p) => p.split(';')[0]?.trim().slice(0, 2).toLowerCase())
  const match = preferred.find((p) => (LOCALES as readonly string[]).includes(p ?? '')) as
    | Locale
    | undefined
  redirect(`/${match ?? DEFAULT_LOCALE}`)
}
