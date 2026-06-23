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
