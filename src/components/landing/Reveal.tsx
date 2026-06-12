'use client'

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** atraso em ms (para escalonar elementos de uma mesma zona) */
  delay?: number
  /** tag a renderizar (default div) */
  as?: ElementType
  className?: string
  style?: React.CSSProperties
}

/**
 * Revela o conteúdo com fade + leve subida quando entra na viewport — uma vez só.
 * Respeita prefers-reduced-motion (o CSS .pl-reveal zera o movimento).
 */
export default function Reveal({ children, delay = 0, as, className = '', style }: Props) {
  const Tag = (as ?? 'div') as ElementType
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true)
            io.disconnect()
            break
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`pl-reveal ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={{ ...style, ['--pl-delay' as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
