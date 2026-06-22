'use client'

import { Button } from '@/components/ui/button'

/** Graceful fallback so a DB hiccup degrades instead of hard-crashing the console. */
export default function ConsoleError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-xl font-semibold tracking-tight">Une erreur est survenue</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        La console n’a pas pu charger les données. Réessayez dans un instant.
      </p>
      <Button onClick={reset} className="mt-5">
        Réessayer
      </Button>
    </div>
  )
}
