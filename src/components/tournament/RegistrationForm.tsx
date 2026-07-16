'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useT } from '@/i18n/use-t'
import { getSportProfile, DEFAULT_SPORT, type SportId } from '@/lib/sport'
import { validateImageFile } from '@/lib/tournament/upload-media'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

type FormValues = {
  teamName: string
  email: string
  phone: string
  website?: string // honeypot
}

export function RegistrationForm({
  slug,
  payment,
  closed = false,
  sport = DEFAULT_SPORT,
}: {
  slug: string
  payment: { iban: string | null; amount: number | null; communication: string | null } | null
  closed?: boolean
  sport?: SportId
}) {
  const t = useT()
  // Competitor wording adapts to the sport: team / pair (padel) / player.
  const unit = getSportProfile(sport).unit
  const [submitted, setSubmitted] = useState(false)
  const [waitlisted, setWaitlisted] = useState(false)
  const [logo, setLogo] = useState<File | null>(null)
  const schema = useMemo(
    () =>
      z.object({
        teamName: z.string().trim().min(2, t('product.reg.err.teamName')).max(80),
        email: z.email(t('product.reg.err.email')),
        phone: z.string().trim().min(6, t('product.reg.err.phone')).max(40),
        website: z.string().optional(), // honeypot
      }),
    [t],
  )
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { teamName: '', email: '', phone: '', website: '' },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      const fd = new FormData()
      fd.append('teamName', values.teamName)
      fd.append('email', values.email)
      fd.append('phone', values.phone)
      fd.append('website', values.website ?? '')
      if (logo) fd.append('logo', logo)

      const res = await fetch(`/api/tournament/${slug}/register`, { method: 'POST', body: fd })
      const body = await res.json()
      if (res.ok) {
        const isWaitlist = Boolean(body?.data?.waitlisted)
        setWaitlisted(isWaitlist)
        setSubmitted(true)
        toast.success(isWaitlist ? t('product.reg.toast.waitlisted') : t('product.reg.toast.sent'))
        form.reset()
        setLogo(null)
      } else {
        toast.error(body?.error?.message ?? t('product.reg.toast.error'))
      }
    } catch {
      toast.error(t('product.reg.toast.network'))
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/10 p-6 text-center">
        <h3 className="flex items-center justify-center gap-2 text-xl font-bold">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          {waitlisted ? t('product.reg.success.waitlistTitle') : t('product.reg.success.title')}
        </h3>
        <p className="mt-2 text-muted-foreground">
          {waitlisted ? t('product.reg.success.waitlistBody') : t('product.reg.success.body')}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-2xl font-bold">
        {closed ? t('product.reg.waitlistHeading') : t('product.reg.heading')}
      </h2>
      {closed && (
        <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-foreground">
          {t('product.reg.closedBanner')}
        </div>
      )}
      {payment && (payment.amount || payment.iban) && (
        <div className="mt-4 rounded-lg bg-card/50 p-4 text-sm text-foreground">
          <p className="font-semibold text-primary">{t('product.reg.fees')}</p>
          {payment.amount && (
            <p>
              {t('product.reg.amount')} : {payment.amount} €
            </p>
          )}
          {payment.iban && <p>IBAN : {payment.iban}</p>}
          {payment.communication && (
            <p>
              {t('product.reg.communication')} : {payment.communication}
            </p>
          )}
          <p className="mt-1 text-muted-foreground">{t('product.reg.manualValidation')}</p>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <FormField
            control={form.control}
            name="teamName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t(`product.reg.name.${unit}`)}</FormLabel>
                <FormControl>
                  <Input placeholder={t(`product.reg.namePlaceholder.${unit}`)} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('product.reg.email')}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="capitaine@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('product.reg.phone')}</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+32 4xx xx xx xx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-2">
            <FormLabel>{t('product.reg.logo')}</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return setLogo(null)
                const err = validateImageFile(f)
                if (err) {
                  toast.error(err)
                  e.target.value = ''
                  return setLogo(null)
                }
                setLogo(f)
              }}
            />
          </div>
          {/* Honeypot - hidden from humans, off-screen and aria-hidden. */}
          <div aria-hidden className="absolute left-[-9999px]" tabIndex={-1}>
            <label>
              {t('product.reg.honeypot')}
              <input type="text" tabIndex={-1} autoComplete="off" {...form.register('website')} />
            </label>
          </div>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full bg-primary font-bold text-primary-foreground hover:bg-primary/90"
          >
            {form.formState.isSubmitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            {form.formState.isSubmitting
              ? t('product.reg.submitting')
              : closed
                ? t('product.reg.submitWaitlist')
                : t('product.reg.submit')}
          </Button>
        </form>
      </Form>
    </div>
  )
}
