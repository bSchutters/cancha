'use client'

import { useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { LocaleLink } from '@/components/locale-link'
import { useLocale } from '@/i18n/use-locale'
import { getDictionary } from '@/i18n'

/** Site-wide launch-offer bar (dismissible). */
export function AnnouncementBar() {
  const [show, setShow] = useState(true)
  const t = getDictionary(useLocale()).announcement
  if (!show) return null

  return (
    <div className="relative bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-10 py-2 text-center text-sm">
        <Sparkles className="size-4 shrink-0" />
        <p>
          {t.prefix} <strong className="font-semibold">{t.discount}</strong> {t.suffix}{' '}
          <LocaleLink href="/tarifs" className="underline underline-offset-2 hover:no-underline">
            {t.cta}
          </LocaleLink>
        </p>
        <button
          type="button"
          onClick={() => setShow(false)}
          aria-label={t.close}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-sm p-1 opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
