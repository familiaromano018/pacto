'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  ScreenDivisao,
  ScreenLancar,
  ScreenSaldo,
  ScreenVisao,
  ScreenMetas,
} from './appScreens'

const BRASS = '#c9a25e'
const INK = '#f3efe6'
const MUTED = '#8b91a8'
const HAIR = 'rgba(214,201,178,0.16)'
const YELLOW = '#f4c544'

// passo + callout (anchor na tela e caixa ao lado, em coords do palco 940x627)
const STEPS = [
  { n: '01', title: 'Combinem a divisão', caption: '50/50, proporcional, conta única ou por categorias.', screen: <ScreenDivisao />, ax: 540, ay: 165, bx: 600, by: 120, side: 'right' as const },
  { n: '02', title: 'Lancem cada gasto', caption: 'Valor, categoria, quem pagou e como — em 5 segundos.', screen: <ScreenLancar />, ax: 392, ay: 235, bx: 25, by: 195, side: 'left' as const },
  { n: '03', title: 'Quem deve quanto', caption: 'No fim do mês, um número claro. Não uma discussão.', screen: <ScreenSaldo />, ax: 540, ay: 295, bx: 600, by: 270, side: 'right' as const },
  { n: '04', title: 'Acompanhem o mês', caption: 'Donut por categoria, entrou/saiu/sobrou e PDF.', screen: <ScreenVisao />, ax: 395, ay: 365, bx: 25, by: 340, side: 'left' as const },
  { n: '05', title: 'Construam a dois', caption: 'Metas em comum — viagem, reserva, o apê.', screen: <ScreenMetas />, ax: 540, ay: 430, bx: 600, by: 400, side: 'right' as const },
]

const N = STEPS.length
const STEP_VH = 0.62 // quanto de scroll cada tela "segura"
const STAGE_W = 940
const STAGE_H = 626.67
const SCREEN_W = 248
const SCREEN_H = 510
const BOX_W = 210
const MATRIX = 'matrix3d(0.736991, 0, 0, 0, 0, 0.786081, 0, 0, 0, 0, 1, 0, 376.165234, 102.784961, 0, 1)'

export default function PhoneScene() {
  const [i, setI] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.8)

  // scroll → índice da tela (seção pinada)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const sec = sectionRef.current
      if (!sec) return
      const vh = window.innerHeight || 1
      const total = sec.offsetHeight - vh
      const scrolled = Math.min(Math.max(-sec.getBoundingClientRect().top, 0), total)
      const p = total > 0 ? scrolled / total : 0
      setI(Math.min(N - 1, Math.floor(p * N)))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])

  // escala o palco pra COBRIR a seção inteira (full-bleed)
  useEffect(() => {
    const measure = () => {
      const el = wrapRef.current
      const w = el?.clientWidth || window.innerWidth
      const h = el?.clientHeight || window.innerHeight
      setScale(Math.max(w / STAGE_W, h / STAGE_H))
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    if (wrapRef.current) ro.observe(wrapRef.current)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [])

  return (
    <section ref={sectionRef} style={{ position: 'relative', background: '#090d1c', height: `calc(${N * STEP_VH * 100}vh + 100vh)` }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '16px 24px', overflow: 'hidden' }}>
        {/* cabeçalho (sobre o fundo escuro) */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: BRASS, fontWeight: 600 }}>Por dentro do Pacto</div>
          <h2 className="pl-display" style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 500, color: INK, letterSpacing: '-0.015em', margin: '8px 0 0' }}>Do acordo ao fim do mês, em paz.</h2>
        </div>

        {/* quadro ~80% com o palco cobrindo */}
        <div ref={wrapRef} style={{ position: 'relative', width: 'min(92%, 1180px)', height: '70vh', borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,0.5)' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: STAGE_W, height: STAGE_H, transformOrigin: 'center', transform: `translate(-50%, -50%) scale(${scale})` }}>
            <Image src="/scene-desk.jpg" alt="Celular do Pacto sobre a mesa cheia de recibos" fill priority sizes="100vw" style={{ objectFit: 'cover' }} />

            {/* tela do app */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: SCREEN_W, height: SCREEN_H, transformOrigin: '0 0', transform: MATRIX, borderRadius: 30, overflow: 'hidden', background: '#0b0b10' }}>
              {STEPS.map((s, idx) => (
                <div key={s.n} className="pl-tour-layer" aria-hidden={idx !== i} style={{ background: '#0b0b10', opacity: idx === i ? 1 : 0 }}>
                  {s.screen}
                </div>
              ))}
              <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(125deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 34%)' }} />
            </div>

            {/* callouts acumulados (0..i) — não somem */}
            <div className="pl-scene-callouts">
              <svg className="pl-callout-svg" viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} preserveAspectRatio="none">
                {STEPS.slice(0, i + 1).map((s) => {
                  const endX = s.side === 'right' ? s.bx : s.bx + BOX_W
                  return (
                    <g key={`g-${s.n}`}>
                      <circle cx={s.ax} cy={s.ay} r="5.5" fill={YELLOW} />
                      <path className="pl-callout-line" d={`M ${s.ax} ${s.ay} L ${endX} ${s.by + 18}`} stroke={YELLOW} strokeWidth="2" fill="none" pathLength={1} />
                    </g>
                  )
                })}
              </svg>
              {STEPS.slice(0, i + 1).map((s) => (
                <div key={`b-${s.n}`} className="pl-callout-box pl-callout-pop" style={{ left: s.bx, top: s.by, width: BOX_W }}>
                  <div className="num pl-display">{s.n}</div>
                  <div className="ttl">{s.title}</div>
                  <div className="cap">{s.caption}</div>
                </div>
              ))}
            </div>
          </div>

          {/* leve vinheta nas bordas do quadro */}
          <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(135% 105% at 50% 50%, transparent 62%, rgba(9,13,28,0.45) 100%)' }} />
        </div>

        {/* legenda mobile + dots (sobre o fundo escuro) */}
        <div style={{ textAlign: 'center', maxWidth: 520, flexShrink: 0 }}>
          <div className="pl-scene-caption">
              <div key={`t-${i}`} className="pl-tour-fade" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 9 }}>
                <span className="pl-display" style={{ fontSize: 22, color: YELLOW, fontWeight: 500, lineHeight: 1 }}>{STEPS[i].n}</span>
                <span className="pl-display" style={{ fontSize: 20, color: INK, fontWeight: 500 }}>{STEPS[i].title}</span>
              </div>
              <p key={`c-${i}`} className="pl-tour-fade" style={{ fontSize: 15, color: INK, lineHeight: 1.5, marginTop: 6 }}>{STEPS[i].caption}</p>
            </div>
            <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginTop: 14 }}>
              {STEPS.map((s, idx) => (
                <span key={s.n} style={{ height: 5, width: idx === i ? 28 : 12, borderRadius: 999, background: idx <= i ? YELLOW : HAIR, transition: 'width 0.35s ease, background 0.35s ease' }} />
              ))}
            </div>
          </div>
        </div>
    </section>
  )
}
