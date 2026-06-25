import { NextResponse, type NextRequest } from 'next/server'
import { LOCALES, DEFAULT_LOCALE, type Locale } from '@/i18n/config'

// Everything user-facing lives under a localized segment (/fr, /nl, /en). An
// un-prefixed path — an old bookmark, a shared tournament link (…/summer-cup),
// or /tarifs — would otherwise 404. This redirects it into the resolved locale,
// keeping the path and query intact. The apex root ('/') is left to the root
// page, which does the tenant-aware (org default-public-locale) redirect.
//
// The matcher already excludes /api, /admin (Payload), /console (FR-only, no
// [lang]), /_next and any file with an extension, so this only touches the
// localized app surface.

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

export function middleware(req: NextRequest) {
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
  // Exclude API, Payload admin, the FR-only console, Next internals, and any
  // path that looks like a file (has a dot: favicon.ico, sitemap.xml, …).
  matcher: ['/((?!api|admin|console|_next|.*\\.).*)'],
}
