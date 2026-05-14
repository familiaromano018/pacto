'use client'

import { useEffect, useState } from 'react'
import { tokens } from '@/lib/tokens'
import { tipForDay, tipSeenKey, type CoupleTip } from '@/lib/tips'

interface Props {
  coupleId: string | null
  /** Atraso em ms antes de aparecer (pra não competir com outros modais) */
  delayMs?: number
}

/**
 * Modal com a dica do dia pra casal. Aparece 1x por dia.
 */
export default function DailyTipModal({ coupleId, delayMs = 14000 }: Props) {
  const [open, setOpen] = useState(false)
  const [tip, setTip] = useState<CoupleTip | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const key = tipSeenKey()
    const seen = localStorage.getItem(key) === '1'
    if (seen) return
    const t = tipForDay(coupleId)
    setTip(t)
    const timer = window.setTimeout(() => setOpen(true), delayMs)
    return () => window.clearTimeout(timer)
  }, [coupleId, delayMs])

  function dismiss() {
    try { localStorage.setItem(tipSeenKey(), '1') } catch {}
    setOpen(false)
  }

  if (!open || !tip) return null

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9990,
        padding: 20,
        animation: 'cna-fade-in 200ms ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: tokens.color.bg_card,
          borderRadius: 22,
          padding: '32px 26px 22px',
          maxWidth: 380,
          width: '100%',
          boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
          border: `1px solid ${tokens.color.border_subtle}`,
          textAlign: 'center',
          animation: 'cna-modal-pop 280ms cubic-bezier(0.4,0,0.2,1)',
          position: 'relative',
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: '#5b8dff',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          ✨ Dica do dia
        </div>

        <div
          style={{
            fontSize: 56,
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          {tip.emoji}
        </div>

        <div
          style={{
            fontSize: 19,
            fontWeight: 800,
            color: tokens.color.text_heading,
            letterSpacing: '-0.01em',
            marginBottom: 10,
            lineHeight: 1.25,
          }}
        >
          {tip.title}
        </div>

        <div
          style={{
            fontSize: 14.5,
            color: tokens.color.text_body,
            lineHeight: 1.6,
            marginBottom: 24,
            padding: '0 4px',
          }}
        >
          {tip.body}
        </div>

        <button
          onClick={dismiss}
          style={{
            width: '100%',
            background: '#5b8dff',
            color: '#fff',
            border: 'none',
            borderRadius: 14,
            padding: '14px 0',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: 'inherit',
            letterSpacing: '0.02em',
            boxShadow: '0 8px 22px rgba(91,141,255,0.35)',
          }}
        >
          Vamos lá
        </button>

        <button
          onClick={dismiss}
          aria-label="Fechar"
          style={{
            position: 'absolute',
            top: 12,
            right: 14,
            background: 'transparent',
            border: 'none',
            color: tokens.color.text_muted,
            fontSize: 22,
            cursor: 'pointer',
            fontFamily: 'inherit',
            lineHeight: 1,
            padding: 4,
          }}
        >
          ×
        </button>
      </div>
    </div>
  )
}
