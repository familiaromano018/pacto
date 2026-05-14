'use client'

const HOTMART_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL ||
  'https://pay.hotmart.com/'

interface Props {
  daysRemaining: number
  coupleCode: string | null
}

/**
 * Banner discreto no topo do app quando faltam ≤ 5 dias do trial.
 * Some quando faltam mais que 5 dias (não polui a UI cedo demais).
 */
export default function TrialBanner({ daysRemaining, coupleCode }: Props) {
  if (daysRemaining > 5) return null

  function openCheckout() {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams()
    if (coupleCode) params.set('off', coupleCode)
    const url = HOTMART_CHECKOUT_URL.includes('?')
      ? `${HOTMART_CHECKOUT_URL}&${params.toString()}`
      : `${HOTMART_CHECKOUT_URL}?${params.toString()}`
    window.open(url, '_blank', 'noopener')
  }

  const label =
    daysRemaining <= 0
      ? 'Trial termina hoje'
      : daysRemaining === 1
      ? 'Falta 1 dia do trial'
      : `Faltam ${daysRemaining} dias do trial`

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, rgba(91,141,255,0.18) 0%, rgba(91,141,255,0.08) 100%)',
        borderBottom: '1px solid rgba(91,141,255,0.3)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--color-text-heading)',
        }}
      >
        ⏳ {label}
      </span>
      <button
        onClick={openCheckout}
        style={{
          background: '#5b8dff',
          color: '#fff',
          border: 'none',
          padding: '6px 12px',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Assinar agora →
      </button>
    </div>
  )
}
