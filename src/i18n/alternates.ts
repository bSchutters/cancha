import { LOCALES, LOCALE_HREFLANG, DEFAULT_LOCALE, isLocale } from './config'

/**
 * On-page hreflang block for a path (locale-prefix excluded, e.g. '/tarifs' or
 * '' for the home). Returns a Next.js `alternates` object: the canonical for the
 * current locale, the full per-locale `languages` map (fr-BE / nl-BE / en) and
 * an `x-default` pointing at the default locale. Crawlers weight on-page
 * hreflang heavily — the sitemap alone is under-trusted.
 */
export function localizedAlternates(lang: string, path = '') {
  const current = isLocale(lang) ? lang : DEFAULT_LOCALE
  const languages: Record<string, string> = Object.fromEntries(
    LOCALES.map((l) => [LOCALE_HREFLANG[l], `/${l}${path}`]),
  )
  languages['x-default'] = `/${DEFAULT_LOCALE}${path}`
  return { canonical: `/${current}${path}`, languages }
}
