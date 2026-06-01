'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'

type FormFieldsCtx = [Record<string, { value?: unknown }>, unknown]

type Tone = 'idle' | 'ok' | 'error'

const TournamentActions: React.FC = () => {
  const { id } = useDocumentInfo()
  const status = useFormFields(
    ([fields]: FormFieldsCtx) => fields?.status?.value as string | undefined,
  )
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ tone: Tone; text: string }>({ tone: 'idle', text: '' })

  const call = async (action: string, label: string) => {
    if (!id) return
    setLoading(action)
    setMessage({ tone: 'idle', text: '' })
    try {
      const res = await fetch(`/api/tournament/${id}/${action}`, {
        method: 'POST',
        credentials: 'include',
      })
      const body = await res.json()
      if (res.ok) {
        setMessage({ tone: 'ok', text: `${label} : OK` })
        router.refresh()
      } else {
        setMessage({ tone: 'error', text: body?.error?.message ?? `${label} : erreur` })
      }
    } catch (err) {
      setMessage({ tone: 'error', text: err instanceof Error ? err.message : 'Erreur réseau' })
    } finally {
      setLoading(null)
    }
  }

  if (!id) {
    return (
      <div style={boxStyle}>
        <p style={{ margin: 0, opacity: 0.6, fontSize: 13 }}>
          Enregistrez le tournoi pour accéder aux actions (tirage, calendrier, phase finale).
        </p>
      </div>
    )
  }

  return (
    <div style={boxStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Actions du tournoi</h4>
        <span style={{ fontSize: 12, opacity: 0.6 }}>Statut : {status ?? '-'}</span>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <ActionButton label="Tirage des poules" loading={loading === 'draw'} disabled={!!loading} onClick={() => call('draw', 'Tirage')} />
        <ActionButton label="Générer le calendrier" loading={loading === 'generate-schedule'} disabled={!!loading} onClick={() => call('generate-schedule', 'Calendrier')} />
        <ActionButton label="Générer la phase finale" loading={loading === 'generate-knockout'} disabled={!!loading} onClick={() => call('generate-knockout', 'Phase finale')} />
      </div>
      {message.text && (
        <p
          style={{
            marginTop: 12,
            marginBottom: 0,
            fontSize: 12,
            padding: '6px 10px',
            borderRadius: 4,
            background: message.tone === 'error' ? 'rgba(255,107,107,0.15)' : 'rgba(254,209,100,0.15)',
            color: message.tone === 'error' ? '#ff6b6b' : '#fed164',
          }}
        >
          {message.text}
        </p>
      )}
    </div>
  )
}

const boxStyle: React.CSSProperties = {
  marginTop: 8,
  marginBottom: 8,
  padding: '16px 20px',
  background: 'var(--theme-elevation-100)',
  borderRadius: 8,
  border: '1px solid var(--theme-elevation-200)',
}

const ActionButton: React.FC<{ label: string; loading: boolean; disabled: boolean; onClick: () => void }> = ({
  label,
  loading,
  disabled,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: '8px 16px',
      background: disabled ? 'var(--theme-elevation-200)' : '#fed164',
      color: '#122642',
      border: 'none',
      borderRadius: 6,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 13,
      fontWeight: 700,
      opacity: disabled && !loading ? 0.6 : 1,
      whiteSpace: 'nowrap',
    }}
  >
    {loading ? '…' : label}
  </button>
)

export default TournamentActions
