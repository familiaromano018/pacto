'use client'

import { Logo } from './Logo'
import { signOut } from '@/lib/supabase/useSession'
import type { SubscriptionStatus } from '@/lib/subscription/useSubscription'

interface Props {
  status: SubscriptionStatus | null
  coupleCode: string | null
}

const HOTMART_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL ||
  'https://pay.hotmart.com/' // placeholder até produto ser criado

export default function PaywallScreen({ status, coupleCode }: Props) {
  const isTrialExpired = status === 'trial'
  const isPastDue = status === 'past_due'
  const isCanceled = status === 'canceled' || status === 'expired'

  const headline = isPastDue
    ? 'Seu pagamento atrasou'
    : isCanceled
    ? 'Sua assinatura terminou'
    : 'Seu trial terminou'

  const sub = isPastDue
    ? 'Atualiza o pagamento pra continuar usando o Pacto.'
    : isCanceled
    ? 'Renove pra voltar a usar. Seus dados continuam salvos.'
    : 'Esperamos que tenha gostado. Pra continuar usando, assine abaixo.'

  function openCheckout() {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams()
    if (coupleCode) params.set('off', coupleCode)
    const url = HOTMART_CHECKOUT_URL.includes('?')
      ? `${HOTMART_CHECKOUT_URL}&${params.toString()}`
      : `${HOTMART_CHECKOUT_URL}?${params.toString()}`
    window.open(url, '_blank', 'noopener')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-app)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <Logo size={72} />

        <p
          style={{
            color: 'var(--color-text-heading)',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            margin: '28px 0 8px',
            lineHeight: 1.2,
          }}
        >
          {headline}
        </p>
        <p
          style={{
            color: 'var(--color-text-muted)',
            fontSize: 14,
            fontWeight: 400,
            margin: '0 auto 28px',
            maxWidth: 320,
            lineHeight: 1.5,
          }}
        >
          {sub}
        </p>

        <div
          style={{
            background: 'var(--color-bg-card)',
            border: '1.5px solid rgba(91,141,255,0.4)',
            borderRadius: 16,
            padding: '24px 22px',
            marginBottom: 18,
            textAlign: 'left',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#5b8dff',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: 10,
            }}
          >
            Pacto
          </div>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <Bullet>Gastos compartilhados + pessoais separados</Bullet>
            <Bullet>Rateio justo (50/50 ou proporcional à renda)</Bullet>
            <Bullet>Custos fixos e parcelas com lembretes</Bullet>
            <Bullet>Sincronização em tempo real entre vocês dois</Bullet>
            <Bullet>Extrato em PDF do mês inteiro</Bullet>
            <Bullet>Cancele quando quiser</Bullet>
          </ul>
        </div>

        <button
          onClick={openCheckout}
          style={{
            width: '100%',
            padding: '15px 22px',
            background: '#5b8dff',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 10px 24px rgba(91,141,255,0.3)',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          Assinar agora
        </button>

        <button
          onClick={() => signOut()}
          style={{
            marginTop: 14,
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-muted)',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'inherit',
            textDecoration: 'underline',
          }}
        >
          sair
        </button>

        {coupleCode && (
          <p
            style={{
              marginTop: 28,
              color: 'var(--color-text-muted)',
              fontSize: 11,
              lineHeight: 1.55,
              opacity: 0.7,
            }}
          >
            Pacto: {coupleCode}
          </p>
        )}
      </div>
    </div>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        fontSize: 13,
        color: 'var(--color-text-body)',
        lineHeight: 1.5,
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#5b8dff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0, marginTop: 2 }}
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
      <span>{children}</span>
    </li>
  )
}
