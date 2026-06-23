'use client'

import { useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { LocaleLink } from '@/components/locale-link'
import { useT } from '@/i18n/use-t'

/** Site-wide launch-offer bar (dismissible). */
export function AnnouncementBar() {
  const [show, setShow] = useState(true)
  const t = useT()
  if (!show) return null

  return (
    <div className="relative bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-10 py-2 text-center text-sm">
        <Sparkles className="size-4 shrink-0" />
        <p>
          {t('announcement.prefix')} <strong className="font-semibold">{t('announcement.discount')}</strong>{' '}
          {t('announcement.suffix')}{' '}
          <LocaleLink href="/tarifs" className="underline underline-offset-2 hover:no-underline">
            {t('announcement.cta')}
          </LocaleLink>
        </p>
        <button
          type="button"
          onClick={() => setShow(false)}
          aria-label={t('announcement.close')}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-sm p-1 opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
