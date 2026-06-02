import { ImageResponse } from 'next/og'
import { getPayloadClient } from '@/lib/payload'
import { resolveTenant } from '@/lib/tournament/tenant'
import { getCachedPublicTournament } from '@/lib/tournament/public-view'
import { formatEditionDate } from '@/lib/tournament/format'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Aperçu du tournoi'
// Tenant + tournament are resolved per request (host headers + live data).
export const dynamic = 'force-dynamic'

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const org = await resolveTenant(payload)
  // Shared cached read: same draft-gating as the page (null for draft/unknown,
  // so we never leak a draft's name) and reuses the tournament-${slug} cache.
  const t = await getCachedPublicTournament(payload, slug, org?.id ?? null)

  const siteName = org?.name ?? 'Cup Generator'
  const title = t?.name ?? siteName
  const accent = org?.accentColor ?? '#fed164'
  const dateLabel = formatEditionDate(t?.editionDate)
  // satori fetches <img> at render time; only embed an absolute poster URL
  // (Vercel Blob in prod) - skip relative/local-dev URLs it can't fetch.
  const poster = t?.visualUrl && /^https?:\/\//.test(t.visualUrl) ? t.visualUrl : null

  if (poster) {
    return new ImageResponse(
      (
        <div style={{ height: '100%', width: '100%', display: 'flex', position: 'relative' }}>
          <img
            src={poster}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '72px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.1))',
              color: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, color: accent }}>{siteName}</div>
            <div style={{ display: 'flex', fontSize: 72, fontWeight: 800, lineHeight: 1.05, marginTop: 8 }}>
              {title}
            </div>
            {dateLabel && (
              <div style={{ display: 'flex', fontSize: 34, opacity: 0.85, marginTop: 12 }}>{dateLabel}</div>
            )}
          </div>
        </div>
      ),
      size,
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0b0b0c',
          color: '#ffffff',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: accent }}>{siteName}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 82, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
          {dateLabel && (
            <div style={{ display: 'flex', fontSize: 38, opacity: 0.8, marginTop: 16 }}>{dateLabel}</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 28, opacity: 0.7 }}>
          <div style={{ width: 56, height: 8, background: accent, borderRadius: 4, marginRight: 16 }} />
          Futsal · résultats en direct
        </div>
      </div>
    ),
    size,
  )
}
