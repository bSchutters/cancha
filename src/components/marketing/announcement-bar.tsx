'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, X } from 'lucide-react'

/** Site-wide launch-offer bar (dismissible). */
export function AnnouncementBar() {
  const [show, setShow] = useState(true)
  if (!show) return null

  return (
    <div className="relative bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-10 py-2 text-center text-sm">
        <Sparkles className="size-4 shrink-0" />
        <p>
          Offre de lancement : <strong className="font-semibold">-30% à vie</strong> pour les premiers
          organisateurs.{' '}
          <Link href="/tarifs" className="underline underline-offset-2 hover:no-underline">
            En profiter
          </Link>
        </p>
        <button
          type="button"
          onClick={() => setShow(false)}
          aria-label="Fermer"
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-sm p-1 opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
