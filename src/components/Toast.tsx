'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { tokens } from '@/lib/tokens'

type ToastVariant = 'success' | 'info' | 'error'
interface ToastItem { id: string; text: string; variant: ToastVariant }

interface Ctx {
  show: (text: string, variant?: ToastVariant) => void
}

const ToastCtx = createContext<Ctx | null>(null)

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const show = useCallback((text: string, variant: ToastVariant = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setItems((prev) => [...prev, { id, text, variant }])
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, 2400)
  }, [])

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: 'env(safe-area-inset-top, 16px)',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          zIndex: tokens.primitive.zIndex.toast,
          pointerEvents: 'none',
          paddingTop: 16,
        }}
      >
        {items.map((t) => (
          <ToastView key={t.id} item={t} />
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

function ToastView({ item }: { item: ToastItem }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const tm = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(tm)
  }, [])

  const meta: Record<ToastVariant, { bg: string; fg: string; icon: string }> = {
    success: { bg: tokens.color.success_bg, fg: tokens.color.success, icon: '✓' },
    info:    { bg: tokens.color.bg_card,    fg: tokens.color.text_heading, icon: 'ℹ️' },
    error:   { bg: tokens.color.danger_bg,  fg: tokens.color.danger, icon: '⚠️' },
  }
  const m = meta[item.variant]

  return (
    <div
      style={{
        background: m.bg,
        color: m.fg,
        border: `1.5px solid ${m.fg}33`,
        borderRadius: tokens.primitive.radius.lg,
        padding: `${tokens.primitive.space[5]} ${tokens.primitive.space[8]}`,
        fontSize: tokens.primitive.fontSize.md,
        fontWeight: tokens.primitive.fontWeight.bold,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: tokens.primitive.space[4],
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-12px)',
        transition: 'opacity 200ms cubic-bezier(0.4,0,0.2,1), transform 200ms cubic-bezier(0.4,0,0.2,1)',
        pointerEvents: 'auto',
        maxWidth: 440,
      }}
    >
      <span style={{ fontSize: 18 }}>{m.icon}</span>
      <span>{item.text}</span>
    </div>
  )
}
