'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import { useSession } from '@/lib/supabase/useSession'
import { trackPixel } from '@/components/MetaPixel'
import { trackGA } from '@/components/GoogleAnalytics'

type Variant = 'nav' | 'primary' | 'final' | 'pricing-outlined' | 'pricing-filled'

interface Props {
  variant: Variant
}

const BRASS = '#c9a25e'
const INK = '#0c1226'

const styles: Record<Variant, CSSProperties> = {
  nav: {
    background: BRASS,
    color: INK,
    padding: '9px 18px',
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 13,
    textDecoration: 'none',
  },
  primary: {
    background: BRASS,
    color: INK,
    padding: '16px 32px',
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 15,
    textDecoration: 'none',
    boxShadow: '0 14px 30px rgba(201,162,94,0.28)',
    letterSpacing: '0.01em',
  },
  final: {
    background: BRASS,
    color: INK,
    padding: '18px 40px',
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 16,
    textDecoration: 'none',
    boxShadow: '0 18px 36px rgba(201,162,94,0.32)',
    letterSpacing: '0.01em',
    display: 'inline-block',
  },
  'pricing-outlined': {
    display: 'block',
    background: 'transparent',
    color: '#f3efe6',
    padding: '14px 0',
    borderRadius: 999,
    fontWeight: 600,
    fontSize: 14,
    textDecoration: 'none',
    textAlign: 'center',
    marginTop: 28,
    border: '1px solid rgba(214,201,178,0.22)',
  },
  'pricing-filled': {
    display: 'block',
    background: BRASS,
    color: INK,
    padding: '14px 0',
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 14,
    textDecoration: 'none',
    textAlign: 'center',
    marginTop: 28,
    boxShadow: '0 10px 26px rgba(201,162,94,0.26)',
  },
}

export default function SmartCTA({ variant }: Props) {
  const session = useSession()
  const isAuth = session.status === 'authenticated'

  const label = isAuth
    ? 'Abrir app →'
    : variant === 'nav' || variant === 'pricing-outlined'
      ? 'Começar grátis'
      : variant === 'pricing-filled'
        ? 'Começar agora'
        : 'Começar grátis →'

  function handleClick() {
    if (isAuth) {
      trackGA('open_app', { source: variant })
    } else {
      // Intenção de começar (clicou no CTA da landing). Mede o passo entrada → clique.
      trackPixel('Lead', { content_name: 'CTA Começar grátis' })
      trackGA('cta_comecar', { source: variant })
    }
  }

  return (
    <Link href="/app" className="pl-tap" style={styles[variant]} onClick={handleClick}>
      {label}
    </Link>
  )
}
