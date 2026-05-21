'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import { useSession } from '@/lib/supabase/useSession'

type Variant = 'nav' | 'primary' | 'final' | 'pricing-outlined' | 'pricing-filled'

interface Props {
  variant: Variant
}

const styles: Record<Variant, CSSProperties> = {
  nav: {
    background: '#5b8dff',
    color: '#fff',
    padding: '9px 18px',
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 13,
    textDecoration: 'none',
  },
  primary: {
    background: '#5b8dff',
    color: '#fff',
    padding: '16px 30px',
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 15,
    textDecoration: 'none',
    boxShadow: '0 12px 28px rgba(91,141,255,0.4)',
    letterSpacing: '0.01em',
  },
  final: {
    background: '#5b8dff',
    color: '#fff',
    padding: '18px 36px',
    borderRadius: 14,
    fontWeight: 700,
    fontSize: 16,
    textDecoration: 'none',
    boxShadow: '0 16px 32px rgba(91,141,255,0.45)',
    letterSpacing: '0.01em',
    display: 'inline-block',
  },
  'pricing-outlined': {
    display: 'block',
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    padding: '14px 0',
    borderRadius: 12,
    fontWeight: 600,
    fontSize: 14,
    textDecoration: 'none',
    textAlign: 'center',
    marginTop: 28,
    border: '1px solid rgba(255,255,255,0.1)',
  },
  'pricing-filled': {
    display: 'block',
    background: '#5b8dff',
    color: '#fff',
    padding: '14px 0',
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 14,
    textDecoration: 'none',
    textAlign: 'center',
    marginTop: 28,
    boxShadow: '0 8px 24px rgba(91,141,255,0.35)',
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

  return (
    <Link href="/app" style={styles[variant]}>
      {label}
    </Link>
  )
}
