'use client'

import { useEffect, useState } from 'react'
import { tokens } from '@/lib/tokens'
import { trackPixel } from './MetaPixel'
import { trackGA } from './GoogleAnalytics'

const HOTMART_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL ||
  'https://pay.hotmart.com/'

interface Props {
  daysRemaining: number
  coupleId: string | null
  coupleCode: string | null
}

/**
 * Modal de boas-vindas do trial. Aparece 1x por coupleId no início do app
 * (após o Splash), fica parado até o user clicar "Continuar". Diferente do
 * TrialBanner (que é persistente no topo), este é bloqueante de entrada.
 */
export default function TrialWelcomeModal({ daysRemaining, coupleId, coupleCode }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!coupleId) return
    const key = `pacto:trial-welcome-seen:${coupleId}`
    const seen = localStorage.getItem(key) === '1'
    if (seen) return
    // Pequeno delay pra não competir com o splash/transição inicial
    const t = window.setTimeout(() => setOpen(true), 600)
    return () => window.clearTimeout(t)
  }, [coupleId])

  function dismiss() {
    if (coupleId) {
      try { localStorage.setItem(`pacto:trial-welcome-seen:${coupleId}`, '1') } catch {}
    }
    setOpen(false)
  }

  function openCheckout() {
    if (typeof window === 'undefined') return
    trackPixel('InitiateCheckout', { value: 29.90, currency: 'BRL', content_name: 'Pacto Mensal' })
    trackGA('begin_checkout', { value: 29.90, currency: 'BRL', source: 'welcome_modal' })
    const params = new URLSearchParams()
    if (coupleCode) params.set('off', coupleCode)
    const url = HOTMART_CHECKOUT_URL.includes('?')
      ? `${HOTMART_CHECKOUT_URL}&${params.toString()}`
      : `${HOTMART_CHECKOUT_URL}?${params.toString()}`
    window.open(url, '_blank', 'noopener')
  }

  if (!open) return null

  const headline =
    daysRemaining <= 0
      ? 'Seu trial termina hoje'
      : daysRemaining === 1
      ? 'Falta 1 dia do seu trial'
      : `Você tem ${daysRemaining} dias grátis`

  const isUrgent = daysRemaining <= 2
  const accent = isUrgent ? '#dc2626' : daysRemaining <= 7 ? '#f57c00' : '#5b8dff'

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9991,
        padding: 20,
        animation: 'cna-fade-in 200ms ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: tokens.color.bg_card,
          borderRadius: 22,
          padding: '36px 26px 24px',
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
            color: accent,
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          {isUrgent ? '⚠️ Atenção' : '🎉 Bem-vindo'}
        </div>

        <div
          style={{
            fontSize: 56,
            lineHeight: 1,
            marginBottom: 18,
          }}
        >
          {isUrgent ? '⏳' : '🤝'}
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: tokens.color.text_heading,
            letterSpacing: '-0.01em',
            marginBottom: 12,
            lineHeight: 1.25,
          }}
        >
          {headline}
        </div>

        <div
          style={{
            fontSize: 14.5,
            color: tokens.color.text_body,
            lineHeight: 1.6,
            marginBottom: 26,
            padding: '0 4px',
          }}
        >
          {isUrgent
            ? 'Seu período de teste tá no fim. Assina agora pra continuar registrando os gastos e fechando o mês em paz.'
            : 'Aproveita pra cadastrar seus fixos, adicionar alguns gastos e fechar um mês pra sentir como o Pacto funciona pra valer.'}
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
            fontSize: 15,
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: 'inherit',
            letterSpacing: '0.02em',
            boxShadow: '0 8px 22px rgba(91,141,255,0.35)',
            marginBottom: 10,
          }}
        >
          Continuar
        </button>

        <button
          onClick={() => { openCheckout(); dismiss() }}
          style={{
            width: '100%',
            background: 'transparent',
            color: accent,
            border: 'none',
            padding: '10px 0',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Assinar agora →
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
