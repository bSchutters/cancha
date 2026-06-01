'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { validateImageFile } from '@/lib/tournament/upload-media'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const schema = z.object({
  teamName: z.string().trim().min(2, 'Nom d’équipe trop court').max(80),
  email: z.email('Email invalide'),
  phone: z.string().trim().min(6, 'Téléphone invalide').max(40),
  website: z.string().optional(), // honeypot
})

type FormValues = z.infer<typeof schema>

export function RegistrationForm({
  slug,
  payment,
  closed = false,
}: {
  slug: string
  payment: { iban: string | null; amount: number | null; communication: string | null } | null
  closed?: boolean
}) {
  const [submitted, setSubmitted] = useState(false)
  const [waitlisted, setWaitlisted] = useState(false)
  const [logo, setLogo] = useState<File | null>(null)
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
        toast.success(isWaitlist ? 'Ajouté à la liste d’attente.' : 'Inscription envoyée ! Vérifiez votre boîte mail.')
        form.reset()
        setLogo(null)
      } else {
        toast.error(body?.error?.message ?? 'Une erreur est survenue')
      }
    } catch {
      toast.error('Erreur réseau, réessayez')
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/10 p-6 text-center">
        <h3 className="flex items-center justify-center gap-2 text-xl font-bold">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          {waitlisted ? 'Sur liste d’attente' : 'Inscription reçue'}
        </h3>
        <p className="mt-2 text-muted-foreground">
          {waitlisted
            ? 'Le tournoi est complet. Votre équipe est sur la liste d’attente : nous vous contacterons si une place se libère.'
            : 'Votre inscription est en attente de validation. Elle sera confirmée dès réception du paiement.'}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-2xl font-bold">{closed ? 'Liste d’attente' : 'Inscrire mon équipe'}</h2>
      {closed && (
        <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-foreground">
          Le tournoi est <span className="font-semibold">complet</span>. Vous pouvez vous inscrire sur la liste
          d’attente : votre équipe sera repêchée si une place se libère.
        </div>
      )}
      {payment && (payment.amount || payment.iban) && (
        <div className="mt-4 rounded-lg bg-card/50 p-4 text-sm text-foreground">
          <p className="font-semibold text-primary">Frais d’inscription</p>
          {payment.amount && <p>Montant : {payment.amount} €</p>}
          {payment.iban && <p>IBAN : {payment.iban}</p>}
          {payment.communication && <p>Communication : {payment.communication}</p>}
          <p className="mt-1 text-muted-foreground">
            L’inscription est validée manuellement après réception du paiement.
          </p>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <FormField
            control={form.control}
            name="teamName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de l’équipe</FormLabel>
                <FormControl>
                  <Input placeholder="Los Amigos FC" {...field} />
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
                <FormLabel>Email du représentant</FormLabel>
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
                <FormLabel>Téléphone du représentant</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+32 4xx xx xx xx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-2">
            <FormLabel>Logo de l&apos;équipe (optionnel)</FormLabel>
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
              Ne pas remplir
              <input type="text" tabIndex={-1} autoComplete="off" {...form.register('website')} />
            </label>
          </div>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full bg-primary font-bold text-primary-foreground hover:bg-primary/90"
          >
            {form.formState.isSubmitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            {form.formState.isSubmitting ? 'Envoi…' : closed ? 'Rejoindre la liste d’attente' : 'M’inscrire'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
