import Link from 'next/link'
import { LogoMark } from '@/components/Logo'
import SmartCTA from '@/components/landing/SmartCTA'

// ── Capas dos artigos: gradiente da marca + ícone do tema (sem foto de banco) ──
const COVERS: Record<string, { gradient: string; emoji: string }> = {
  'Dividir contas': { gradient: 'linear-gradient(135deg,#1a1a44 0%,#1a3a8a 100%)', emoji: '⚖️' },
  'Organização': { gradient: 'linear-gradient(135deg,#0f2d44 0%,#155e6a 100%)', emoji: '🗂️' },
  'Relacionamento': { gradient: 'linear-gradient(135deg,#1a1a44 0%,#3a1b5c 100%)', emoji: '💙' },
  'Morar junto': { gradient: 'linear-gradient(135deg,#0f3d2e 0%,#1a7a5e 100%)', emoji: '🏠' },
  'Planejamento': { gradient: 'linear-gradient(135deg,#1a1a44 0%,#5b3a8a 100%)', emoji: '🧭' },
  'Orçamento': { gradient: 'linear-gradient(135deg,#3a2d0f 0%,#1a3a8a 100%)', emoji: '📊' },
  'Reserva': { gradient: 'linear-gradient(135deg,#0f3d2e 0%,#155e6a 100%)', emoji: '🛟' },
  'Metas': { gradient: 'linear-gradient(135deg,#2a1b5c 0%,#1a3a8a 100%)', emoji: '🎯' },
}

export function blogCover(category: string) {
  return COVERS[category] ?? { gradient: 'linear-gradient(135deg,#1a1a44 0%,#2a1b5c 100%)', emoji: '💙' }
}

export function BlogCover({ category, height = 160, radius = 0 }: { category: string; height?: number; radius?: number }) {
  const c = blogCover(category)
  return (
    <div
      aria-hidden
      style={{
        position: 'relative', height, borderRadius: radius, overflow: 'hidden',
        background: c.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <span style={{ fontSize: Math.round(height * 0.4), filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.35))' }}>
        {c.emoji}
      </span>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 28% 22%, rgba(255,255,255,0.14), transparent 60%)' }} />
    </div>
  )
}

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
