/**
 * Per-organization theming (shadcn-style presets).
 *
 * An organization picks a Base Color (neutral palette), a Theme Color (accent
 * hex), a Radius, and Heading/Body fonts. From those we build a scoped CSS block
 * that overrides the design tokens inside `.tournament-scope` (light) and
 * `.dark .tournament-scope` (dark). The dark selector MUST be more specific than
 * the light one (two classes vs one) so it wins on the same <body> element -
 * otherwise the body's light vars would beat the global `.dark` and break dark
 * mode.
 *
 * This module is pure data + pure functions (no server-only imports) so it can
 * be imported from client components for the live preview.
 */

export type BaseColorKey =
  | 'paper'
  | 'slate'
  | 'gray'
  | 'zinc'
  | 'neutral'
  | 'stone'
  | 'taupe'
  | 'mauve'
  | 'mist'
  | 'olive'

/** The neutral tokens that vary per base color (in oklch). Accent is applied separately. */
export interface Palette {
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  border: string
  input: string
  ring: string
}

export interface BaseColor {
  key: BaseColorKey
  label: string
  /** A representative swatch (hex) for the picker UI. */
  swatch: string
  light: Palette
  dark: Palette
}

/**
 * Build a subtly hue-tinted neutral palette, mirroring the L scale of the
 * canonical shadcn neutrals. Used for the extra base colors (taupe/mauve/…)
 * that aren't shipped as hand-tuned palettes. `intensity` scales the chroma.
 */
function tintedBase(
  key: BaseColorKey,
  label: string,
  swatch: string,
  hue: number,
  intensity = 1,
): BaseColor {
  const c = (base: number) => +(base * intensity).toFixed(4)
  const fgDark = `oklch(0.147 ${c(0.004)} ${hue})` // darkest (light fg / dark bg)
  const onDark = `oklch(0.985 0.001 ${hue})` // lightest (dark fg / light-on-primary)
  const deep = `oklch(0.216 ${c(0.006)} ${hue})` // light primary / dark card
  const subtleL = `oklch(0.97 ${c(0.004)} ${hue})` // light secondary/muted/accent
  const subtleD = `oklch(0.268 ${c(0.007)} ${hue})` // dark secondary/muted/accent
  const borderL = `oklch(0.923 ${c(0.006)} ${hue})`
  const ringL = `oklch(0.709 ${c(0.01)} ${hue})`
  return {
    key,
    label,
    swatch,
    light: {
      background: 'oklch(1 0 0)',
      foreground: fgDark,
      card: 'oklch(1 0 0)',
      cardForeground: fgDark,
      popover: 'oklch(1 0 0)',
      popoverForeground: fgDark,
      primary: deep,
      primaryForeground: onDark,
      secondary: subtleL,
      secondaryForeground: deep,
      muted: subtleL,
      mutedForeground: `oklch(0.553 ${c(0.013)} ${hue})`,
      accent: subtleL,
      accentForeground: deep,
      border: borderL,
      input: borderL,
      ring: ringL,
    },
    dark: {
      background: fgDark,
      foreground: onDark,
      card: deep,
      cardForeground: onDark,
      popover: deep,
      popoverForeground: onDark,
      primary: `oklch(0.923 ${c(0.006)} ${hue})`,
      primaryForeground: deep,
      secondary: subtleD,
      secondaryForeground: onDark,
      muted: subtleD,
      mutedForeground: `oklch(0.709 ${c(0.01)} ${hue})`,
      accent: subtleD,
      accentForeground: onDark,
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: `oklch(0.553 ${c(0.013)} ${hue})`,
    },
  }
}

/** Canonical shadcn/ui base color palettes (light + dark), oklch. */
export const BASE_COLORS: Record<BaseColorKey, BaseColor> = {
  // Cancha house palette: cream paper + ink-blue, matching the marketing
  // landing. This is the default, so a brand-new tournament looks like the site
  // out of the box; a client can still pick any other base color + accent.
  paper: {
    key: 'paper',
    label: 'Papier (Cancha)',
    swatch: '#35527D',
    light: {
      background: '#FAF9F5',
      foreground: '#1A1A18',
      card: '#FFFFFF',
      cardForeground: '#1A1A18',
      popover: '#FFFFFF',
      popoverForeground: '#1A1A18',
      primary: '#35527D',
      primaryForeground: '#FFFFFF',
      secondary: '#F0EDE4',
      secondaryForeground: '#1A1A18',
      muted: '#F0EDE4',
      mutedForeground: '#5F5B54',
      accent: '#ECEAE2',
      accentForeground: '#1A1A18',
      border: '#E6E1D6',
      input: '#E6E1D6',
      ring: '#35527D',
    },
    dark: {
      background: '#1A1A18',
      foreground: '#FAF9F5',
      card: '#232320',
      cardForeground: '#FAF9F5',
      popover: '#232320',
      popoverForeground: '#FAF9F5',
      primary: '#9DB8E0',
      primaryForeground: '#15233B',
      secondary: '#2B2B27',
      secondaryForeground: '#FAF9F5',
      muted: '#2B2B27',
      mutedForeground: '#B4AEA3',
      accent: '#2B2B27',
      accentForeground: '#FAF9F5',
      border: 'oklch(1 0 0 / 12%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: '#9DB8E0',
    },
  },
  neutral: {
    key: 'neutral',
    label: 'Neutral',
    swatch: '#737373',
    light: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.145 0 0)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.145 0 0)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.145 0 0)',
      primary: 'oklch(0.205 0 0)',
      primaryForeground: 'oklch(0.985 0 0)',
      secondary: 'oklch(0.97 0 0)',
      secondaryForeground: 'oklch(0.205 0 0)',
      muted: 'oklch(0.97 0 0)',
      mutedForeground: 'oklch(0.556 0 0)',
      accent: 'oklch(0.97 0 0)',
      accentForeground: 'oklch(0.205 0 0)',
      border: 'oklch(0.922 0 0)',
      input: 'oklch(0.922 0 0)',
      ring: 'oklch(0.708 0 0)',
    },
    dark: {
      background: 'oklch(0.145 0 0)',
      foreground: 'oklch(0.985 0 0)',
      card: 'oklch(0.205 0 0)',
      cardForeground: 'oklch(0.985 0 0)',
      popover: 'oklch(0.205 0 0)',
      popoverForeground: 'oklch(0.985 0 0)',
      primary: 'oklch(0.922 0 0)',
      primaryForeground: 'oklch(0.205 0 0)',
      secondary: 'oklch(0.269 0 0)',
      secondaryForeground: 'oklch(0.985 0 0)',
      muted: 'oklch(0.269 0 0)',
      mutedForeground: 'oklch(0.708 0 0)',
      accent: 'oklch(0.269 0 0)',
      accentForeground: 'oklch(0.985 0 0)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.556 0 0)',
    },
  },
  stone: {
    key: 'stone',
    label: 'Stone',
    swatch: '#78716c',
    light: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.147 0.004 49.25)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.147 0.004 49.25)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.147 0.004 49.25)',
      primary: 'oklch(0.216 0.006 56.043)',
      primaryForeground: 'oklch(0.985 0.001 106.423)',
      secondary: 'oklch(0.97 0.001 106.424)',
      secondaryForeground: 'oklch(0.216 0.006 56.043)',
      muted: 'oklch(0.97 0.001 106.424)',
      mutedForeground: 'oklch(0.553 0.013 58.071)',
      accent: 'oklch(0.97 0.001 106.424)',
      accentForeground: 'oklch(0.216 0.006 56.043)',
      border: 'oklch(0.923 0.003 48.717)',
      input: 'oklch(0.923 0.003 48.717)',
      ring: 'oklch(0.709 0.01 56.259)',
    },
    dark: {
      background: 'oklch(0.147 0.004 49.25)',
      foreground: 'oklch(0.985 0.001 106.423)',
      card: 'oklch(0.216 0.006 56.043)',
      cardForeground: 'oklch(0.985 0.001 106.423)',
      popover: 'oklch(0.216 0.006 56.043)',
      popoverForeground: 'oklch(0.985 0.001 106.423)',
      primary: 'oklch(0.923 0.003 48.717)',
      primaryForeground: 'oklch(0.216 0.006 56.043)',
      secondary: 'oklch(0.268 0.007 34.298)',
      secondaryForeground: 'oklch(0.985 0.001 106.423)',
      muted: 'oklch(0.268 0.007 34.298)',
      mutedForeground: 'oklch(0.709 0.01 56.259)',
      accent: 'oklch(0.268 0.007 34.298)',
      accentForeground: 'oklch(0.985 0.001 106.423)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.553 0.013 58.071)',
    },
  },
  zinc: {
    key: 'zinc',
    label: 'Zinc',
    swatch: '#71717a',
    light: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.141 0.005 285.823)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.141 0.005 285.823)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.141 0.005 285.823)',
      primary: 'oklch(0.21 0.006 285.885)',
      primaryForeground: 'oklch(0.985 0 0)',
      secondary: 'oklch(0.967 0.001 286.375)',
      secondaryForeground: 'oklch(0.21 0.006 285.885)',
      muted: 'oklch(0.967 0.001 286.375)',
      mutedForeground: 'oklch(0.552 0.016 285.938)',
      accent: 'oklch(0.967 0.001 286.375)',
      accentForeground: 'oklch(0.21 0.006 285.885)',
      border: 'oklch(0.92 0.004 286.32)',
      input: 'oklch(0.92 0.004 286.32)',
      ring: 'oklch(0.705 0.015 286.067)',
    },
    dark: {
      background: 'oklch(0.141 0.005 285.823)',
      foreground: 'oklch(0.985 0 0)',
      card: 'oklch(0.21 0.006 285.885)',
      cardForeground: 'oklch(0.985 0 0)',
      popover: 'oklch(0.21 0.006 285.885)',
      popoverForeground: 'oklch(0.985 0 0)',
      primary: 'oklch(0.92 0.004 286.32)',
      primaryForeground: 'oklch(0.21 0.006 285.885)',
      secondary: 'oklch(0.274 0.006 286.033)',
      secondaryForeground: 'oklch(0.985 0 0)',
      muted: 'oklch(0.274 0.006 286.033)',
      mutedForeground: 'oklch(0.705 0.015 286.067)',
      accent: 'oklch(0.274 0.006 286.033)',
      accentForeground: 'oklch(0.985 0 0)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.552 0.016 285.938)',
    },
  },
  gray: {
    key: 'gray',
    label: 'Gray',
    swatch: '#6b7280',
    light: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.13 0.028 261.692)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.13 0.028 261.692)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.13 0.028 261.692)',
      primary: 'oklch(0.21 0.034 264.665)',
      primaryForeground: 'oklch(0.985 0.002 247.839)',
      secondary: 'oklch(0.967 0.003 264.542)',
      secondaryForeground: 'oklch(0.21 0.034 264.665)',
      muted: 'oklch(0.967 0.003 264.542)',
      mutedForeground: 'oklch(0.551 0.027 264.364)',
      accent: 'oklch(0.967 0.003 264.542)',
      accentForeground: 'oklch(0.21 0.034 264.665)',
      border: 'oklch(0.928 0.006 264.531)',
      input: 'oklch(0.928 0.006 264.531)',
      ring: 'oklch(0.707 0.022 261.325)',
    },
    dark: {
      background: 'oklch(0.13 0.028 261.692)',
      foreground: 'oklch(0.985 0.002 247.839)',
      card: 'oklch(0.21 0.034 264.665)',
      cardForeground: 'oklch(0.985 0.002 247.839)',
      popover: 'oklch(0.21 0.034 264.665)',
      popoverForeground: 'oklch(0.985 0.002 247.839)',
      primary: 'oklch(0.928 0.006 264.531)',
      primaryForeground: 'oklch(0.21 0.034 264.665)',
      secondary: 'oklch(0.278 0.033 256.848)',
      secondaryForeground: 'oklch(0.985 0.002 247.839)',
      muted: 'oklch(0.278 0.033 256.848)',
      mutedForeground: 'oklch(0.707 0.022 261.325)',
      accent: 'oklch(0.278 0.033 256.848)',
      accentForeground: 'oklch(0.985 0.002 247.839)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.551 0.027 264.364)',
    },
  },
  slate: {
    key: 'slate',
    label: 'Slate',
    swatch: '#64748b',
    light: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.129 0.042 264.695)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.129 0.042 264.695)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.129 0.042 264.695)',
      primary: 'oklch(0.208 0.042 265.755)',
      primaryForeground: 'oklch(0.984 0.003 247.858)',
      secondary: 'oklch(0.968 0.007 247.896)',
      secondaryForeground: 'oklch(0.208 0.042 265.755)',
      muted: 'oklch(0.968 0.007 247.896)',
      mutedForeground: 'oklch(0.554 0.046 257.417)',
      accent: 'oklch(0.968 0.007 247.896)',
      accentForeground: 'oklch(0.208 0.042 265.755)',
      border: 'oklch(0.929 0.013 255.508)',
      input: 'oklch(0.929 0.013 255.508)',
      ring: 'oklch(0.704 0.04 256.788)',
    },
    dark: {
      background: 'oklch(0.129 0.042 264.695)',
      foreground: 'oklch(0.984 0.003 247.858)',
      card: 'oklch(0.208 0.042 265.755)',
      cardForeground: 'oklch(0.984 0.003 247.858)',
      popover: 'oklch(0.208 0.042 265.755)',
      popoverForeground: 'oklch(0.984 0.003 247.858)',
      primary: 'oklch(0.929 0.013 255.508)',
      primaryForeground: 'oklch(0.208 0.042 265.755)',
      secondary: 'oklch(0.279 0.041 260.031)',
      secondaryForeground: 'oklch(0.984 0.003 247.858)',
      muted: 'oklch(0.279 0.041 260.031)',
      mutedForeground: 'oklch(0.704 0.04 256.788)',
      accent: 'oklch(0.279 0.041 260.031)',
      accentForeground: 'oklch(0.984 0.003 247.858)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.704 0.04 256.788)',
    },
  },
  taupe: tintedBase('taupe', 'Taupe', '#8a8276', 70, 1.3),
  mauve: tintedBase('mauve', 'Mauve', '#8b7e88', 330, 1.3),
  mist: tintedBase('mist', 'Mist', '#7e838d', 240, 1.2),
  olive: tintedBase('olive', 'Olive', '#80857a', 130, 1.2),
}

/** Display order in the picker (matches the shadcn/Tailwind base-color list). */
export const BASE_COLOR_KEYS: BaseColorKey[] = [
  'paper',
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'taupe',
  'mauve',
  'mist',
  'olive',
]
export const DEFAULT_BASE_COLOR: BaseColorKey = 'paper'

/** Named radius presets (shadcn-create style). Stored as the key; mapped to rem. */
export const RADIUS_PRESETS = {
  default: { label: 'Par défaut', rem: '0.625' },
  none: { label: 'Aucun', rem: '0' },
  small: { label: 'Petit', rem: '0.3' },
  medium: { label: 'Moyen', rem: '0.5' },
  large: { label: 'Grand', rem: '1.0' },
} as const
export type RadiusKey = keyof typeof RADIUS_PRESETS
export const RADIUS_KEYS = Object.keys(RADIUS_PRESETS) as RadiusKey[]
export const DEFAULT_RADIUS: RadiusKey = 'default'

/**
 * Predefined accent (Theme Color) presets, shadcn-create style. Stored on the
 * org as the hex `color` (so the schema stays a plain colour). null = use the
 * base color's primary.
 */
export interface AccentPreset {
  key: string
  label: string
  color: string
}

// Tailwind v4 `-400` shades (oklch). 400 is light, so accentForeground() picks
// dark text over them.
export const ACCENT_PRESETS: AccentPreset[] = [
  { key: 'red', label: 'Rouge', color: 'oklch(0.704 0.191 22.216)' },
  { key: 'orange', label: 'Orange', color: 'oklch(0.75 0.183 55.934)' },
  { key: 'amber', label: 'Ambre', color: 'oklch(0.828 0.189 84.429)' },
  { key: 'yellow', label: 'Jaune', color: 'oklch(0.852 0.199 91.936)' },
  { key: 'lime', label: 'Lime', color: 'oklch(0.841 0.238 128.85)' },
  { key: 'green', label: 'Vert', color: 'oklch(0.792 0.209 151.711)' },
  { key: 'emerald', label: 'Émeraude', color: 'oklch(0.765 0.177 163.223)' },
  { key: 'teal', label: 'Sarcelle', color: 'oklch(0.777 0.152 181.912)' },
  { key: 'cyan', label: 'Cyan', color: 'oklch(0.789 0.154 211.53)' },
  { key: 'sky', label: 'Ciel', color: 'oklch(0.746 0.16 232.661)' },
  { key: 'blue', label: 'Bleu', color: 'oklch(0.707 0.165 254.624)' },
  { key: 'indigo', label: 'Indigo', color: 'oklch(0.673 0.182 276.935)' },
  { key: 'violet', label: 'Violet', color: 'oklch(0.702 0.183 293.541)' },
  { key: 'purple', label: 'Pourpre', color: 'oklch(0.714 0.203 305.504)' },
  { key: 'fuchsia', label: 'Fuchsia', color: 'oklch(0.74 0.238 322.16)' },
  { key: 'pink', label: 'Rose', color: 'oklch(0.718 0.202 349.761)' },
  { key: 'rose', label: 'Rose vif', color: 'oklch(0.712 0.194 13.428)' },
]

/** Curated Google Fonts. `value` is the exact Google family name. */
export interface FontOption {
  value: string
  label: string
  /** Generic fallback for the font stack. */
  fallback: 'sans-serif' | 'serif'
}

export const FONTS: FontOption[] = [
  { value: 'Geist', label: 'Geist', fallback: 'sans-serif' },
  { value: 'Inter', label: 'Inter', fallback: 'sans-serif' },
  { value: 'Manrope', label: 'Manrope', fallback: 'sans-serif' },
  { value: 'DM Sans', label: 'DM Sans', fallback: 'sans-serif' },
  { value: 'Outfit', label: 'Outfit', fallback: 'sans-serif' },
  { value: 'Work Sans', label: 'Work Sans', fallback: 'sans-serif' },
  { value: 'Sora', label: 'Sora', fallback: 'sans-serif' },
  { value: 'Space Grotesk', label: 'Space Grotesk', fallback: 'sans-serif' },
  { value: 'Poppins', label: 'Poppins', fallback: 'sans-serif' },
  { value: 'Montserrat', label: 'Montserrat', fallback: 'sans-serif' },
  { value: 'Nunito', label: 'Nunito', fallback: 'sans-serif' },
  { value: 'Roboto', label: 'Roboto', fallback: 'sans-serif' },
  { value: 'Open Sans', label: 'Open Sans', fallback: 'sans-serif' },
  { value: 'Lato', label: 'Lato', fallback: 'sans-serif' },
  { value: 'Raleway', label: 'Raleway', fallback: 'sans-serif' },
  { value: 'Oswald', label: 'Oswald', fallback: 'sans-serif' },
  { value: 'Newsreader', label: 'Newsreader', fallback: 'serif' },
  { value: 'Playfair Display', label: 'Playfair Display', fallback: 'serif' },
  { value: 'Merriweather', label: 'Merriweather', fallback: 'serif' },
]

const FONT_VALUES = new Set(FONTS.map((f) => f.value))

/** Theme settings as stored on an Organization. */
export interface OrgTheme {
  baseColor: BaseColorKey
  accentColor: string | null
  radius: RadiusKey
  headingFont: string | null
  bodyFont: string | null
}

export const DEFAULT_THEME: OrgTheme = {
  baseColor: DEFAULT_BASE_COLOR,
  accentColor: null,
  radius: DEFAULT_RADIUS,
  headingFont: null,
  bodyFont: null,
}

/** Coerce raw stored values into a valid, safe OrgTheme. */
export function normalizeTheme(raw: {
  base_color?: string | null
  accent_color?: string | null
  radius?: string | null
  heading_font?: string | null
  body_font?: string | null
}): OrgTheme {
  const baseColor = (raw.base_color && raw.base_color in BASE_COLORS
    ? raw.base_color
    : DEFAULT_BASE_COLOR) as BaseColorKey
  const radius = (raw.radius && raw.radius in RADIUS_PRESETS
    ? raw.radius
    : DEFAULT_RADIUS) as RadiusKey
  return {
    baseColor,
    accentColor: safeColor(raw.accent_color),
    radius,
    headingFont: raw.heading_font && FONT_VALUES.has(raw.heading_font) ? raw.heading_font : null,
    bodyFont: raw.body_font && FONT_VALUES.has(raw.body_font) ? raw.body_font : null,
  }
}

/** Only allow a valid hex colour to be injected into a <style> tag (no CSS injection). */
export function safeHexColor(value: string | null | undefined): string | null {
  return value && /^#[0-9a-fA-F]{3,8}$/.test(value.trim()) ? value.trim() : null
}

/**
 * Allow a hex OR an `oklch(...)` colour to be injected (no CSS injection). The
 * accent presets are stored as oklch (Tailwind v4), but legacy/free values may
 * still be hex - both are accepted.
 */
export function safeColor(value: string | null | undefined): string | null {
  if (!value) return null
  const v = value.trim()
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return v
  // oklch( L[%] C H [/ A[%]] ) - only digits, dot, %, spaces and a slash.
  if (/^oklch\(\s*[\d.]+%?(\s+[\d.]+){2}(\s*\/\s*[\d.]+%?)?\s*\)$/.test(v)) return v
  return null
}

/**
 * Relative luminance of a hex colour (sRGB). Used to pick a readable foreground
 * (near-black or near-white) over the accent.
 */
function hexLuminance(hex: string): number {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (h.length === 4) h = h.slice(0, 3).split('').map((c) => c + c).join('')
  if (h.length >= 6) h = h.slice(0, 6)
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

const NEAR_WHITE = 'oklch(0.985 0 0)'
const NEAR_BLACK = 'oklch(0.205 0 0)'

/** The L (lightness, 0..1) of an `oklch(L ...)` colour, or null if not oklch. */
function oklchLightness(value: string): number | null {
  const m = /^oklch\(\s*([\d.]+)(%?)/.exec(value.trim())
  if (!m) return null
  const n = parseFloat(m[1])
  return m[2] === '%' ? n / 100 : n
}

/**
 * Pick a readable foreground (near-black / near-white) over the accent. Uses the
 * oklch lightness when available (perceptual), else sRGB luminance for hex.
 */
export function accentForeground(accent: string): string {
  const l = oklchLightness(accent)
  if (l != null) return l > 0.62 ? NEAR_BLACK : NEAR_WHITE
  return hexLuminance(accent) > 0.55 ? NEAR_BLACK : NEAR_WHITE
}

/** Build the `font-family` stack for a chosen font (or null -> empty). */
function fontStack(value: string | null): string | null {
  if (!value) return null
  const f = FONTS.find((o) => o.value === value)
  if (!f) return null
  return `'${f.value}', ${f.fallback}`
}

function paletteVars(p: Palette): string {
  return [
    `--background:${p.background}`,
    `--foreground:${p.foreground}`,
    `--card:${p.card}`,
    `--card-foreground:${p.cardForeground}`,
    `--popover:${p.popover}`,
    `--popover-foreground:${p.popoverForeground}`,
    `--primary:${p.primary}`,
    `--primary-foreground:${p.primaryForeground}`,
    `--secondary:${p.secondary}`,
    `--secondary-foreground:${p.secondaryForeground}`,
    `--muted:${p.muted}`,
    `--muted-foreground:${p.mutedForeground}`,
    `--accent:${p.accent}`,
    `--accent-foreground:${p.accentForeground}`,
    `--border:${p.border}`,
    `--input:${p.input}`,
    `--ring:${p.ring}`,
  ].join(';')
}

/**
 * Build the scoped CSS for an org theme. Returns a string for a <style> tag.
 * Light vars on `scope`; dark vars on `.dark <scope>` (more specific so it wins
 * on the same element). Accent overrides primary + ring in both. `scope`
 * defaults to `.tournament-scope` (the public/TV body); the appearance preview
 * passes its own scope.
 */
export function buildThemeCss(theme: OrgTheme, scope = '.tournament-scope'): string {
  const base = BASE_COLORS[theme.baseColor] ?? BASE_COLORS[DEFAULT_BASE_COLOR]
  const radius = `${(RADIUS_PRESETS[theme.radius] ?? RADIUS_PRESETS[DEFAULT_RADIUS]).rem}rem`
  const accent = safeColor(theme.accentColor)
  const headBody = fontStack(theme.headingFont)
  const bodyFont = fontStack(theme.bodyFont)

  // Accent overrides (same vibrant accent in light and dark - it reads well as a
  // button bg with the auto-contrasted foreground in both).
  const accentVars = accent
    ? `--primary:${accent};--primary-foreground:${accentForeground(accent)};--ring:${accent};`
    : ''

  // Radius + fonts live on the light scope (inherited; no dark variant needed).
  const fontVars = [
    headBody ? `--font-heading:${headBody}` : '',
    bodyFont ? `--font-body:${bodyFont}` : '',
  ]
    .filter(Boolean)
    .join(';')

  // Light mode: for the pure-white shadcn palettes, nudge the page background just
  // below white so white cards/popovers visibly separate from it. Palettes that
  // already ship a tinted background (e.g. the cream "paper" default) are left as
  // is. Dark mode is untouched.
  const lightPalette: Palette =
    base.light.background === 'oklch(1 0 0)'
      ? { ...base.light, background: 'oklch(0.985 0 0)' }
      : base.light

  // When theming the document root, the dark selector is `.dark` (html itself),
  // not `.dark :root` (which would never match). Element scopes nest normally.
  const darkSel = scope === ':root' ? '.dark' : `.dark ${scope}`
  const light = `${scope}{--radius:${radius};${paletteVars(lightPalette)};${
    fontVars ? fontVars + ';' : ''
  }${accentVars}}`
  const dark = `${darkSel}{${paletteVars(base.dark)};${accentVars}}`
  return light + dark
}

/** Build the Google Fonts stylesheet href for the chosen fonts (or null). */
export function googleFontsHref(headingFont: string | null, bodyFont: string | null): string | null {
  const families = Array.from(new Set([headingFont, bodyFont].filter(Boolean) as string[]))
    .filter((f) => FONT_VALUES.has(f))
  if (families.length === 0) return null
  const params = families
    .map((f) => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700;800`)
    .join('&')
  return `https://fonts.googleapis.com/css2?${params}&display=swap`
}
