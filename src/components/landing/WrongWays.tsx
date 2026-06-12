'use client'

import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react'
import Image from 'next/image'
import Reveal from './Reveal'

// Paleta da "sessão creme" + vermelho (jeitos errados)
const CREAM = '#efe6d4'
const CARD = '#f8f1e3'
const INK = '#1a2138'
const BODY = '#4a4f63'
const MUTED = '#6b6f82'
const RED = '#e0492f'
const GREEN = '#4e9d6b'
const HAIR = 'rgba(26,33,56,0.12)'
// painel navy da resolução
const NAVY = '#090d1c'
const BRASS = '#c9a25e'
const BRASS_DIM = 'rgba(201,162,94,0.30)'
const INK_LIGHT = '#f3efe6'
const MUTED_LIGHT = '#8b91a8'

const r = (s: ReactNode) => <span style={{ color: RED, fontWeight: 600 }}>{s}</span>

/** Cena (foto) cujos overlays surgem conforme a página rola (--p = 0..1). */
function Scene({ src, alt, position, children }: { src: string; alt: string; position?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const setP = (v: number) => el.style.setProperty('--p', String(v))
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setP(1); return }
    let raf = 0
    const update = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const p = Math.min(1, Math.max(0, (vh * 0.92 - rect.top) / (vh * 0.92 - vh * 0.4)))
      setP(p)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <div ref={ref} className="pl-scene" style={{ ['--p' as string]: 0 } as CSSProperties}>
      <Image src={src} alt={alt} fill sizes="(max-width: 900px) 100vw, 380px" style={{ objectFit: 'cover', objectPosition: position ?? 'center' }} />
      <div className="pl-scene-veil" aria-hidden />
      {children}
    </div>
  )
}

/** posiciona + define o limiar de surgimento (--t) do overlay */
function ov(t: number, style: CSSProperties): CSSProperties {
  return { ...style, ['--t' as string]: t } as CSSProperties
}

export default function WrongWays() {
  return (
    <section id="problema" style={{ padding: '112px 24px', background: CREAM }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        {/* Cabeçalho */}
        <Reveal style={{ textAlign: 'center', maxWidth: 1000, margin: '0 auto' }}>
          <h2 className="pl-display pl-head-1l" style={{ fontSize: 'clamp(25px, 3.8vw, 42px)', fontWeight: 600, color: INK, letterSpacing: '-0.015em', lineHeight: 1.16, margin: 0 }}>
            3 {r('jeitos errados')} de dividir conta de casal.
          </h2>
          <p style={{ fontSize: 18, color: BODY, marginTop: 16, lineHeight: 1.55, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto' }}>
            A maioria dos casais usa um destes três métodos. Os três têm o mesmo problema: criam {r('atrito')} em vez de combinar.
          </p>
        </Reveal>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 22, marginTop: 56 }}>
          {/* ── Card 1 — 50/50 ── */}
          <Reveal delay={0}>
            <div style={cardStyle}>
              <CardHead n="01" title={<>Dividir tudo<br />meio a meio.</>} />
              <p style={descStyle}>
                Parece justo, mas ignora realidades diferentes. Quem ganha menos {r('sangra')}. Quem ganha mais {r('não percebe')}.
              </p>
              <Scene src="/wrong-001.jpg" alt="Casal preocupado conferindo a conta na mesa" position="center 35%">
                <div className="pl-ov pl-panel" style={ov(0.26, { bottom: '8%', left: '50%', transform: 'translateX(-50%)', width: '56%' })}>
                  <div style={{ fontSize: 8.5, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total da conta</div>
                  <div className="pl-display" style={{ fontSize: 17, color: INK, fontWeight: 600, lineHeight: 1.1, marginTop: 1 }}>R$ 600,00</div>
                  <div style={{ display: 'flex', borderTop: `1px solid ${HAIR}`, marginTop: 6, paddingTop: 6 }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 10.5, color: INK, fontWeight: 700 }}>R$ 300,00</div>
                      <div style={{ fontSize: 8, color: RED, fontWeight: 700 }}>50%</div>
                    </div>
                    <div style={{ width: 1, background: HAIR }} />
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 10.5, color: INK, fontWeight: 700 }}>R$ 300,00</div>
                      <div style={{ fontSize: 8, color: RED, fontWeight: 700 }}>50%</div>
                    </div>
                  </div>
                </div>
              </Scene>
            </div>
          </Reveal>

          {/* ── Card 2 — um paga tudo ── */}
          <Reveal delay={110}>
            <div style={cardStyle}>
              <CardHead n="02" title={<>Um paga tudo,<br />o outro nada.</>} />
              <p style={descStyle}>
                Gera {r('dependência, ressentimento e desequilíbrio')}. O dinheiro vira {r('poder')} — e poder não combina com casal.
              </p>
              <Scene src="/wrong-002.jpg" alt="Homem carregando pilha de contas, mulher de braços cruzados" position="center 28%">
                <div className="pl-ov pl-tag-badge" style={ov(0.2, { top: '56%', left: '5%', ['--c' as string]: RED })}>
                  <span className="pl-badge-k">PAGA TUDO</span>
                  <span className="pl-badge-v">R$ 8.496,50</span>
                </div>
                <div className="pl-ov pl-tag-badge" style={ov(0.38, { top: '56%', right: '5%', ['--c' as string]: GREEN })}>
                  <span className="pl-badge-k">NADA</span>
                  <span className="pl-badge-v">R$ 0,00</span>
                </div>
              </Scene>
            </div>
          </Reveal>

          {/* ── Card 3 — cada um paga ── */}
          <Reveal delay={220}>
            <div style={cardStyle}>
              <CardHead n="03" title={<>Cada um paga<br />o que quer.</>} />
              <p style={descStyle}>
                Sem planejamento, só conflitos aumentam. No fim do mês, {r('ninguém sabe quem deve a quem')}.
              </p>
              <Scene src="/wrong-003.jpg" alt="Casal confuso olhando os celulares, recibos espalhados" position="center 26%">
                <Tag t={0.18} color={RED} label="Supermercado" value="R$ 254,40" pos={{ top: '40%', left: '2%' }} />
                <Tag t={0.3} color="#7c83ff" label="Restaurante" value="R$ 187,60" pos={{ top: '62%', left: '2%' }} />
                <Tag t={0.42} color="#e0a52f" label="Combustível" value="R$ 208,90" pos={{ top: '40%', right: '2%' }} />
                <Tag t={0.54} color={GREEN} label="Transferência" value="R$ 250,00" pos={{ top: '62%', right: '2%' }} />
                <span className="pl-ov pl-qmark" style={ov(0.62, { top: '28%', left: '47%' })}>?</span>
                <div className="pl-ov pl-warn" style={ov(0.72, { bottom: '7%', left: '50%', transform: 'translateX(-50%)' })}>
                  <span className="pl-warn-ic">!</span>
                  <span>Saldo do casal <strong>Desconhecido</strong></span>
                </div>
              </Scene>
            </div>
          </Reveal>
        </div>

        {/* Resolução — painel navy de largura cheia */}
        <Reveal delay={140}>
          <div style={{ marginTop: 24, padding: '52px 28px', background: NAVY, border: `1px solid ${BRASS_DIM}`, borderRadius: 4, textAlign: 'center', position: 'relative', boxShadow: '0 30px 64px rgba(9,13,28,0.32)' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 64, height: 2, background: BRASS }} />
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', color: BRASS, textTransform: 'uppercase', marginBottom: 16 }}>
              O jeito certo
            </div>
            <div className="pl-display" style={{ fontSize: 'clamp(27px, 3.6vw, 38px)', color: INK_LIGHT, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.25 }}>
              Combinar uma vez. Registrar tudo.<br />
              Fechar o mês em paz.
            </div>
            <div style={{ fontSize: 17, color: MUTED_LIGHT, marginTop: 14, lineHeight: 1.55 }}>
              É isso que o Pacto faz.
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

const cardStyle: CSSProperties = {
  background: CARD,
  border: `1px solid ${HAIR}`,
  borderRadius: 6,
  padding: 22,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}

const descStyle: CSSProperties = { fontSize: 15, color: BODY, lineHeight: 1.6, margin: '12px 0 20px' }

function CardHead({ n, title }: { n: string; title: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <span style={{ flexShrink: 0, width: 38, height: 38, borderRadius: '50%', background: RED, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
        {n}
      </span>
      <h3 className="pl-display" style={{ fontSize: 21, color: INK, fontWeight: 600, lineHeight: 1.15, letterSpacing: '-0.01em', margin: '4px 0 0' }}>
        {title}
      </h3>
    </div>
  )
}

function Tag({ t, color, label, value, pos }: { t: number; color: string; label: string; value: string; pos: CSSProperties }) {
  return (
    <div className="pl-ov pl-tag" style={ov(t, pos)}>
      <span className="pl-tag-dot" style={{ background: color }} />
      <span className="pl-tag-text">
        <span className="pl-tag-l">{label}</span>
        <span className="pl-tag-v">{value}</span>
      </span>
    </div>
  )
}
