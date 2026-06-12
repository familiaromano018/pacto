'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

/**
 * Fundo do hero com zoom-in sutil conforme rola a página (scale 1 → 1.1 na
 * primeira dobra). JS puro (Safari/iOS), respeita prefers-reduced-motion.
 */
export default function HeroBg() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const update = () => {
      raf = 0
      const h = window.innerHeight || 1
      const p = Math.min(1, Math.max(0, window.scrollY / h))
      el.style.transform = `scale(${1 + p * 0.1})`
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
    <div ref={ref} className="pl-hero-bg" style={{ willChange: 'transform' }}>
      <Image
        src="/hero-couple.jpg"
        alt="Casal no sofá conferindo as contas, sincronizadas em tempo real"
        fill
        priority
        sizes="100vw"
      />
    </div>
  )
}
