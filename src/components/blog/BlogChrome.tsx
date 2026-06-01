import Link from 'next/link'
import { LogoMark } from '@/components/Logo'
import SmartCTA from '@/components/landing/SmartCTA'

export function BlogHeader() {
  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(11,11,16,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <LogoMark size={26} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.2em', color: '#f4f4f6', lineHeight: 1 }}>PACTO</span>
            <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.18em', color: '#5b8dff', lineHeight: 1 }}>BLOG</span>
          </div>
        </Link>
        <nav style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 22 }}>
          <Link href="/" style={{ color: '#a0a3ad', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>← Voltar ao site</Link>
          <SmartCTA variant="nav" />
        </nav>
      </div>
    </header>
  )
}

export function BlogFooter() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 13, color: '#71747e' }}>
        <Link href="/" style={{ color: '#a0a3ad', textDecoration: 'none' }}>Pacto</Link> · Finanças de casal, sem briga
      </div>
    </footer>
  )
}
