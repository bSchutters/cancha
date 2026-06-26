'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useT } from '@/i18n/use-t'
import { LOCALES, LOCALE_LABELS, type Locale } from '@/i18n/config'

export function SettingsForm({
  orgId,
  initialManageLocale,
  initialPublicLocale,
}: {
  orgId: string | number
  initialManageLocale: Locale
  initialPublicLocale: Locale
}) {
  const t = useT()
  const router = useRouter()
  const [manageLocale, setManageLocale] = useState<Locale>(initialManageLocale)
  const [publicLocale, setPublicLocale] = useState<Locale>(initialPublicLocale)
  const [saving, setSaving] = useState(false)

  const dirty = manageLocale !== initialManageLocale || publicLocale !== initialPublicLocale

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/org/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: orgId,
          default_manage_locale: manageLocale,
          default_public_locale: publicLocale,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error?.message ?? t('product.toast.saveError'))
        return
      }
      toast.success(t('product.settings.saved'))
      router.refresh()
    } catch {
      toast.error(t('product.toast.network'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-md space-y-5">
      <div className="space-y-1.5">
        <Label>{t('product.settings.manageLocale')}</Label>
        <Select value={manageLocale} onValueChange={(v) => setManageLocale(v as Locale)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOCALES.map((l) => (
              <SelectItem key={l} value={l}>
                {LOCALE_LABELS[l]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{t('product.settings.manageLocaleHint')}</p>
      </div>

      <div className="space-y-1.5">
        <Label>{t('product.settings.publicLocale')}</Label>
        <Select value={publicLocale} onValueChange={(v) => setPublicLocale(v as Locale)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOCALES.map((l) => (
              <SelectItem key={l} value={l}>
                {LOCALE_LABELS[l]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{t('product.settings.publicLocaleHint')}</p>
      </div>

      <Button onClick={save} disabled={saving || !dirty}>
        {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
        {saving ? t('product.appearance.saving') : t('product.action.save')}
      </Button>
    </div>
  )
}
