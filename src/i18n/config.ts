// Supported locales. FR is canonical (the product's home market); NL covers
// Flanders, EN for international/expats. Console stays FR-only (owner tool).
export const LOCALES = ['fr', 'nl', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'fr'

// Labels shown in the language switcher.
export const LOCALE_LABELS: Record<Locale, string> = {
  fr: 'Français',
  nl: 'Nederlands',
  en: 'English',
}

// BCP-47 tags for <html lang> / hreflang (FR anchored to Belgium).
export const LOCALE_HREFLANG: Record<Locale, string> = {
  fr: 'fr-BE',
  nl: 'nl-BE',
  en: 'en',
}

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value)
}

// Best supported locale from an Accept-Language header, honoring q-values (a
// lower-priority tag must not win just because it appears first in the header).
// Pure string work, safe in the edge runtime — shared by the root redirect and
// the middleware so the two entry points can't drift.
export function bestAcceptLocale(accept: string): Locale | undefined {
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
