'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { uploadMedia, validateImageFile } from '@/lib/tournament/upload-media'
import { useT } from '@/i18n/use-t'
import {
  BASE_COLORS,
  BASE_COLOR_KEYS,
  RADIUS_PRESETS,
  RADIUS_KEYS,
  ACCENT_PRESETS,
  FONTS,
  buildThemeCss,
  googleFontsHref,
  type BaseColorKey,
  type OrgTheme,
  type RadiusKey,
} from '@/lib/tournament/theme'

const PREVIEW_SCOPE = '.appearance-preview'

/** A shadcn-create style row: label + current value + an indicator, opens a menu. */
function SettingRow({
  label,
  value,
  indicator,
  children,
}: {
  label: string
  value: string
  indicator: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <span className="min-w-0">
            <span className="block text-[11px] font-medium text-muted-foreground">{label}</span>
            <span className="block truncate text-sm font-semibold">{value}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">{indicator}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-72 w-(--radix-dropdown-menu-trigger-width) overflow-y-auto"
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppearanceForm({
  initial,
  orgId,
  initialLogoUrl,
}: {
  initial: OrgTheme
  orgId: string | number
  initialLogoUrl: string | null
}) {
  const t = useT()
  const router = useRouter()
  const [baseColor, setBaseColor] = useState<BaseColorKey>(initial.baseColor)
  const [accent, setAccent] = useState(initial.accentColor ?? '')
  const [radius, setRadius] = useState<RadiusKey>(initial.radius)
  const [headingFont, setHeadingFont] = useState(initial.headingFont ?? '')
  const [bodyFont, setBodyFont] = useState(initial.bodyFont ?? '')
  const [saving, setSaving] = useState(false)

  // Logo: keep the saved URL, an optional newly-picked file, and a preview URL.
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(initialLogoUrl)
  const [removeLogo, setRemoveLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  function pickLogo(file: File | null | undefined) {
    if (!file) return
    const err = validateImageFile(file)
    if (err) {
      toast.error(err)
      return
    }
    setLogoFile(file)
    setRemoveLogo(false)
    setLogoPreview(URL.createObjectURL(file))
  }

  function clearLogo() {
    setLogoFile(null)
    setRemoveLogo(true)
    setLogoPreview(null)
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  const theme: OrgTheme = useMemo(
    () => ({
      baseColor,
      accentColor: accent.trim() || null,
      radius,
      headingFont: headingFont || null,
      bodyFont: bodyFont || null,
    }),
    [baseColor, accent, radius, headingFont, bodyFont],
  )

  const previewCss = useMemo(() => buildThemeCss(theme, PREVIEW_SCOPE), [theme])

  // Current accent display (preset label, "Personnalisé", or "Défaut").
  const accentPreset = ACCENT_PRESETS.find((p) => p.color.toLowerCase() === accent.trim().toLowerCase())
  const accentLabel = accent.trim() ? (accentPreset?.label ?? t('product.appearance.custom')) : t('product.appearance.default')

  // Load the chosen Google fonts so the live preview renders with them.
  useEffect(() => {
    const href = googleFontsHref(headingFont || null, bodyFont || null)
    if (!href) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [headingFont, bodyFont])

  async function save() {
    setSaving(true)
    try {
      // Upload a freshly picked logo first; reuse the same media flow as sponsors.
      let logoId: number | null = null
      if (logoFile) {
        logoId = await uploadMedia(logoFile, 'logo')
        if (logoId == null) {
          toast.error(t('product.sponsors.uploadFailed'))
          return
        }
      }

      const res = await fetch('/api/org/theme', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: orgId,
          base_color: baseColor,
          accent_color: accent.trim(),
          radius,
          heading_font: headingFont || null,
          body_font: bodyFont || null,
          ...(logoId != null ? { logo: logoId } : {}),
          ...(removeLogo && !logoFile ? { logo_remove: true } : {}),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error?.message ?? t('product.toast.saveError'))
        return
      }
      setLogoFile(null)
      setRemoveLogo(false)
      toast.success(t('product.appearance.saved'))
      // Refresh so the themed header/logo updates immediately.
      router.refresh()
    } catch {
      toast.error(t('product.toast.network'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
      {/* Controls - shadcn-create style rows */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>{t('product.field.logo')}</Label>
          <div className="flex items-center gap-3">
            <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
              {logoPreview ? (
                <Image src={logoPreview} alt={t('product.field.logo')} fill sizes="56px" unoptimized className="object-contain p-1" />
              ) : (
                <span className="text-[10px] text-muted-foreground">{t('product.appearance.none')}</span>
              )}
            </span>
            <div className="flex flex-col gap-2">
              <Input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => pickLogo(e.target.files?.[0])}
                className="text-xs"
              />
              {logoPreview && (
                <button
                  type="button"
                  onClick={clearLogo}
                  className="self-start text-xs text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
                >
                  {t('product.appearance.removeLogo')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Couleur de base */}
        <SettingRow
          label={t('product.appearance.baseColor')}
          value={BASE_COLORS[baseColor].label}
          indicator={
            <span className="size-4 rounded-full" style={{ background: BASE_COLORS[baseColor].swatch }} />
          }
        >
          {BASE_COLOR_KEYS.map((k) => (
            <DropdownMenuItem key={k} onClick={() => setBaseColor(k)} className="gap-2">
              <span className="size-4 rounded-full" style={{ background: BASE_COLORS[k].swatch }} />
              <span className="flex-1">{BASE_COLORS[k].label}</span>
              {baseColor === k && <Check className="size-4" />}
            </DropdownMenuItem>
          ))}
        </SettingRow>

        {/* Couleur d'accent */}
        <SettingRow
          label={t('product.appearance.accentColor')}
          value={accentLabel}
          indicator={
            accent.trim() ? (
              <span className="size-4 rounded-full border border-border" style={{ background: accent }} />
            ) : (
              <span className="size-4 rounded-full border border-dashed border-muted-foreground" />
            )
          }
        >
          <DropdownMenuItem onClick={() => setAccent('')} className="gap-2">
            <span className="size-4 rounded-full border border-dashed border-muted-foreground" />
            <span className="flex-1">{t('product.appearance.default')}</span>
            {!accent.trim() && <Check className="size-4" />}
          </DropdownMenuItem>
          {ACCENT_PRESETS.map((p) => (
            <DropdownMenuItem key={p.key} onClick={() => setAccent(p.color)} className="gap-2">
              <span className="size-4 rounded-full border border-border" style={{ background: p.color }} />
              <span className="flex-1">{p.label}</span>
              {accent.trim().toLowerCase() === p.color.toLowerCase() && <Check className="size-4" />}
            </DropdownMenuItem>
          ))}
        </SettingRow>

        {/* Arrondi */}
        <SettingRow
          label={t('product.appearance.radius')}
          value={RADIUS_PRESETS[radius].label}
          indicator={<ChevronDown className="size-4" />}
        >
          {RADIUS_KEYS.map((k) => (
            <DropdownMenuItem key={k} onClick={() => setRadius(k)} className="gap-2">
              <span className="flex-1">{RADIUS_PRESETS[k].label}</span>
              {radius === k && <Check className="size-4" />}
            </DropdownMenuItem>
          ))}
        </SettingRow>

        {/* Police des titres */}
        <SettingRow
          label={t('product.appearance.headingFont')}
          value={headingFont || t('product.appearance.fontDefault')}
          indicator={
            <span className="text-base leading-none" style={{ fontFamily: headingFont ? `'${headingFont}'` : undefined }}>
              Aa
            </span>
          }
        >
          <DropdownMenuItem onClick={() => setHeadingFont('')} className="gap-2">
            <span className="flex-1">{t('product.appearance.fontDefault')}</span>
            {!headingFont && <Check className="size-4" />}
          </DropdownMenuItem>
          {FONTS.map((f) => (
            <DropdownMenuItem key={f.value} onClick={() => setHeadingFont(f.value)} className="gap-2">
              <span className="flex-1" style={{ fontFamily: `'${f.value}', ${f.fallback}` }}>
                {f.label}
              </span>
              {headingFont === f.value && <Check className="size-4" />}
            </DropdownMenuItem>
          ))}
        </SettingRow>

        {/* Police du texte */}
        <SettingRow
          label={t('product.appearance.bodyFont')}
          value={bodyFont || t('product.appearance.fontDefault')}
          indicator={
            <span className="text-base leading-none" style={{ fontFamily: bodyFont ? `'${bodyFont}'` : undefined }}>
              Aa
            </span>
          }
        >
          <DropdownMenuItem onClick={() => setBodyFont('')} className="gap-2">
            <span className="flex-1">{t('product.appearance.fontDefault')}</span>
            {!bodyFont && <Check className="size-4" />}
          </DropdownMenuItem>
          {FONTS.map((f) => (
            <DropdownMenuItem key={f.value} onClick={() => setBodyFont(f.value)} className="gap-2">
              <span className="flex-1" style={{ fontFamily: `'${f.value}', ${f.fallback}` }}>
                {f.label}
              </span>
              {bodyFont === f.value && <Check className="size-4" />}
            </DropdownMenuItem>
          ))}
        </SettingRow>

        <Button onClick={save} disabled={saving} className="mt-2 w-full">
          {saving ? t('product.appearance.saving') : t('product.action.save')}
        </Button>
      </div>

      {/* Live preview */}
      <div>
        <style>{previewCss}</style>
        <p className="mb-2 text-xs text-muted-foreground">{t('product.appearance.previewNote')}</p>
        <div
          className="appearance-preview rounded-xl border border-border bg-background p-6 text-foreground"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('product.appearance.previewTitle')}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('product.appearance.previewDesc')}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button>{t('product.appearance.btnPrimary')}</Button>
            <Button variant="secondary">{t('product.appearance.btnSecondary')}</Button>
            <Button variant="outline">{t('product.appearance.btnOutline')}</Button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
              <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                {t('product.appearance.card')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{t('product.appearance.cardContent')}</p>
            </div>
            <div className="space-y-2 rounded-lg border border-border bg-card p-4">
              <Label className="text-xs">{t('product.appearance.field')}</Label>
              <Input placeholder={t('product.appearance.fieldPlaceholder')} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              {t('product.appearance.accent')}
            </span>
            <a href="#" className="text-sm text-primary underline-offset-4 hover:underline">
              {t('product.appearance.sampleLink')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
