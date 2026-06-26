import { NextResponse, type NextRequest } from 'next/server'
import { LOCALES, DEFAULT_LOCALE, bestAcceptLocale } from '@/i18n/config'

// Everything user-facing lives under a localized segment (/fr, /nl, /en). An
// un-prefixed path — an old bookmark, a shared tournament link (…/summer-cup),
// or /tarifs — would otherwise 404. This redirects it into the resolved locale,
// keeping the path and query intact. The apex root ('/') is left to the root
// page, which does the tenant-aware (org default-public-locale) redirect.
//
// The matcher already excludes /api, /admin (Payload), /console (FR-only, no
// [lang]), underscore-prefixed Next internals (/_next, /__nextjs…) and any file
// with an extension, so this only touches the localized app surface.
//
// Trade-off: on a tenant host this picks the locale from Accept-Language, not the
// org's defaultPublicLocale — only the root page ('/') can resolve the tenant
// (DB access isn't available in the edge runtime). Deep links favor the visitor's
// language; the canonical entry ('/') still honors the org default.
//
// Next 16 renamed the "middleware" file convention to "proxy" (same request API).

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Root is handled by the tenant-aware root page.
  if (pathname === '/') return NextResponse.next()

  // Already localized — leave it alone.
  const first = pathname.split('/')[1] ?? ''
  if ((LOCALES as readonly string[]).includes(first)) return NextResponse.next()

  const locale = bestAcceptLocale(req.headers.get('accept-language') ?? '') ?? DEFAULT_LOCALE
  const url = req.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  // Exclude — as whole first segments, not mere prefixes, so a real slug like
  // `api-cup` or `console-final` is NOT skipped — the API, Payload admin and the
  // FR-only console; plus underscore-prefixed Next internals (/_next, /__nextjs…)
  // and any path that looks like a file (has a dot: favicon.ico, sitemap.xml, …).
  matcher: ['/((?!(?:api|admin|console)(?:/|$)|_|.*\\.).*)'],
}
