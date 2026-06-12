'use client'

import { useEffect, useRef } from 'react'
import Reveal from './Reveal'

const TARGET = 60

/**
 * Estatística IBGE como gráfico de linha animado pelo scroll: a curva sobe e se
 * desenha (0 → 60%), a área preenche por baixo, e o número conta junto viajando
 * na ponta da linha. Fallback estático em prefers-reduced-motion.
 */
export default function GrowingStat() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<SVGPathElement>(null)
  const clipRef = useRef<SVGRectElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const line = lineRef.current
    if (!wrap || !line) return

    const len = line.getTotalLength()

    const apply = (p: number) => {
      line.style.strokeDashoffset = String(1 - p)
      if (clipRef.current) clipRef.current.setAttribute('width', String(p * 100))
      if (numRef.current) numRef.current.textContent = `${Math.round(TARGET * p)}%`
      if (tipRef.current) {
        const pt = line.getPointAtLength(p * len) // coords em user-units 0–100
        tipRef.current.style.left = `${pt.x}%`
        tipRef.current.style.top = `${pt.y}%`
      }
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      apply(1)
      return
    }

    apply(0)
    let raf = 0
    const update = () => {
      raf = 0
      const r = wrap.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const start = vh * 0.9
      const end = vh * 0.4
      const p = Math.min(1, Math.max(0, (start - r.top) / (start - end)))
      apply(p)
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

  // Curva ascendente em viewBox 0..100 (y pra baixo). Base 0% em y=88, topo em y=12.
  // Ponta em ~y=42 ≈ 60% da escala.
  const LINE = 'M 4 82 C 24 81 36 70 52 60 C 66 51 80 47 96 42'
  const AREA = `${LINE} L 96 88 L 4 88 Z`

  return (
    <section className="pl-stat-section">
      <Reveal style={{ width: '100%', maxWidth: 880, marginLeft: 'auto', marginRight: 'auto' }}>
        <div ref={wrapRef} className="pl-statcard">
          <div className="pl-statcard-rule" />
          <div className="pl-statcard-label">IBGE · Pesquisa Nacional</div>

          <div className="pl-linechart">
            <svg className="pl-linechart-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id="plStatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(201,162,94,0.34)" />
                  <stop offset="100%" stopColor="rgba(201,162,94,0)" />
                </linearGradient>
                <clipPath id="plStatClip" clipPathUnits="userSpaceOnUse">
                  <rect ref={clipRef} x="0" y="0" width="0" height="100" />
                </clipPath>
              </defs>

              {/* eixo base (0%) e alvo (60%) */}
              <line x1="4" y1="88" x2="100" y2="88" stroke="var(--pl-hair-strong)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
              <line x1="4" y1="42" x2="96" y2="42" stroke="rgba(201,162,94,0.35)" strokeWidth="0.5" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />

              {/* área preenchida (revelada pelo clip que cresce) */}
              <path d={AREA} fill="url(#plStatGrad)" clipPath="url(#plStatClip)" />

              {/* linha que se desenha */}
              <path
                ref={lineRef}
                d={LINE}
                fill="none"
                stroke="var(--pl-brass)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
              />
            </svg>

            {/* rótulos da escala */}
            <span className="pl-linechart-axis" style={{ top: '88%' }}>0%</span>
            <span className="pl-linechart-axis is-target" style={{ top: '42%' }}>60%</span>

            {/* ponta: ponto + número que viaja na linha */}
            <div ref={tipRef} className="pl-linechart-tip">
              <span className="pl-linechart-dot" />
              <span ref={numRef} className="pl-linechart-num pl-display">0%</span>
            </div>
          </div>

          <p className="pl-statcard-text pl-display">
            dos divórcios no Brasil têm <span style={{ color: 'var(--pl-brass)', fontStyle: 'italic' }}>dinheiro</span> como motivo principal.
          </p>
        </div>
      </Reveal>
    </section>
  )
}
