'use client'

const HOTMART_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL ||
  'https://pay.hotmart.com/'

interface Props {
  daysRemaining: number
  coupleCode: string | null
}

/**
 * Banner sempre visível durante o trial. Muda de tom conforme aproxima do fim:
 *  - > 7 dias: azul calmo (informativo)
 *  - 3 a 7 dias: laranja (atenção)
 *  - 0 a 2 dias: vermelho (urgente)
 */
export default function TrialBanner({ daysRemaining, coupleCode }: Props) {
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

  // Cor variando conforme urgência
  const tone =
    daysRemaining <= 2
      ? { bg: 'rgba(220,38,38,0.18)', bg2: 'rgba(220,38,38,0.06)', border: 'rgba(220,38,38,0.4)', accent: '#dc2626', icon: '⚠️' }
      : daysRemaining <= 7
      ? { bg: 'rgba(245,124,0,0.18)', bg2: 'rgba(245,124,0,0.06)', border: 'rgba(245,124,0,0.4)', accent: '#f57c00', icon: '⏰' }
      : { bg: 'rgba(91,141,255,0.18)', bg2: 'rgba(91,141,255,0.06)', border: 'rgba(91,141,255,0.3)', accent: '#5b8dff', icon: '⏳' }

  return (
    <div
      style={{
        background: `linear-gradient(90deg, ${tone.bg} 0%, ${tone.bg2} 100%)`,
        borderBottom: `1px solid ${tone.border}`,
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
        {tone.icon} {label}
      </span>
      <button
        onClick={openCheckout}
        style={{
          background: tone.accent,
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
