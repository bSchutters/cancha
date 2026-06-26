'use client'

import { useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/use-t'
import { LocaleLink } from '@/components/locale-link'
import { Button } from '@/components/ui/button'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/** Mobile-only sticky demo CTA that appears after the user scrolls past the hero. */
export function StickyCta() {
  const t = useT()
  const [show, setShow] = useState(false)

  useGSAP(() => {
    const st = ScrollTrigger.create({
      start: 640,
      end: 'max',
      onToggle: (self) => setShow(self.isActive),
    })
    return () => st.kill()
  })

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 p-3 backdrop-blur transition-transform duration-300 md:hidden',
        show ? 'translate-y-0' : 'translate-y-full',
      )}
    >
      <Button asChild size="lg" className="w-full shadow-lg">
        <LocaleLink href="/#contact">{t('common.requestDemo')}</LocaleLink>
      </Button>
    </div>
  )
}
