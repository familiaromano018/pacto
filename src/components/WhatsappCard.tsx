'use client'

import { useState, useEffect } from 'react'
import { tokens } from '@/lib/tokens'
import { Card } from './ui'
import { getMyWhatsapp, startWhatsappVerification } from '@/lib/supabase/whatsapp'

const BOT_NUMBER = process.env.NEXT_PUBLIC_PACTO_WHATSAPP || '' // dígitos, ex 5511999998888

const headingStyle = {
  fontFamily: tokens.primitive.fontFamily.display,
  fontWeight: tokens.primitive.fontWeight.extrabold,
  fontSize: tokens.primitive.fontSize.xl,
  color: tokens.color.text_heading,
  marginBottom: tokens.primitive.space[2],
} as const

const pStyle = {
  fontSize: tokens.primitive.fontSize.sm,
  color: tokens.color.text_muted,
  marginBottom: tokens.primitive.space[6],
  lineHeight: 1.5,
} as const

function btnStyle(filled: boolean) {
  return {
    width: '100%',
    background: filled ? tokens.color.brand : 'transparent',
    color: filled ? tokens.color.text_onBrand : tokens.color.brand,
    border: `1.5px solid ${tokens.color.brand}${filled ? '' : '55'}`,
    borderRadius: tokens.primitive.radius.md,
    padding: `${tokens.primitive.space[5]} ${tokens.primitive.space[8]}`,
    fontWeight: tokens.primitive.fontWeight.bold,
    fontSize: tokens.primitive.fontSize.md,
    fontFamily: 'inherit',
    cursor: 'pointer',
  } as const
}

export default function WhatsappCard() {
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [phone, setPhone] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function refresh() {
    try {
      const s = await getMyWhatsapp()
      setVerified(!!s?.verified)
      setPhone(s?.phone ?? null)
      if (s?.verified) setCode(null)
    } catch {
      /* silencioso — tabela pode não existir ainda em dev */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function start() {
    setBusy(true)
    setErr(null)
    try {
      const c = await startWhatsappVerification()
      setCode(c)
    } catch (e: any) {
      setErr(e?.message ?? 'Não consegui gerar o código. Tenta de novo.')
    } finally {
      setBusy(false)
    }
  }

  const waLink = code && BOT_NUMBER ? `https://wa.me/${BOT_NUMBER}?text=${encodeURIComponent(code)}` : null

  function fmtPhone(p: string | null) {
    if (!p) return ''
    // 5511999998888 → +55 (11) 99999-8888
    const m = p.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/)
    return m ? `+${m[1]} (${m[2]}) ${m[3]}-${m[4]}` : `+${p}`
  }

  return (
    <Card>
      <h3 style={headingStyle}>WhatsApp</h3>

      {loading ? (
        <p style={{ ...pStyle, marginBottom: 0 }}>Carregando…</p>
      ) : verified ? (
        <>
          <p style={{ ...pStyle, marginBottom: tokens.primitive.space[4] }}>
            Seu WhatsApp está conectado. Em breve você lança gastos por mensagem.
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: `${tokens.primitive.space[5]} ${tokens.primitive.space[6]}`,
              background: tokens.color.bg_app,
              borderRadius: tokens.primitive.radius.md,
            }}
          >
            <span style={{ fontSize: 18 }}>✅</span>
            <span style={{ flex: 1, fontWeight: 600, color: tokens.color.text_heading, fontSize: 14 }}>
              {fmtPhone(phone)}
            </span>
            <button onClick={start} disabled={busy} style={{ ...btnStyle(false), width: 'auto', padding: '6px 12px', fontSize: 12 }}>
              Trocar
            </button>
          </div>
        </>
      ) : code ? (
        <>
          <p style={pStyle}>
            Quase lá! Mande este código pro WhatsApp do Pacto pra confirmar que o número é seu:
          </p>
          <div
            style={{
              textAlign: 'center',
              padding: `${tokens.primitive.space[6]} 0`,
              background: tokens.color.bg_app,
              borderRadius: tokens.primitive.radius.md,
              marginBottom: tokens.primitive.space[5],
            }}
          >
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '0.18em', color: tokens.color.text_heading, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>
              {code}
            </div>
            <div style={{ fontSize: 12, color: tokens.color.text_muted, marginTop: 4 }}>vale por 10 minutos</div>
          </div>
          {waLink ? (
            <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ ...btnStyle(true), display: 'block', textAlign: 'center', textDecoration: 'none', marginBottom: 8 }}>
              Abrir o WhatsApp com o código →
            </a>
          ) : (
            <p style={{ ...pStyle, marginBottom: 8 }}>
              Envie <strong>{code}</strong> para o número do Pacto no WhatsApp.
            </p>
          )}
          <button onClick={refresh} style={btnStyle(false)}>Já enviei — verificar</button>
        </>
      ) : (
        <>
          <p style={pStyle}>
            Conecte seu WhatsApp pra lançar e consultar gastos por mensagem, sem abrir o app.
          </p>
          <button onClick={start} disabled={busy} style={btnStyle(true)}>
            {busy ? 'Gerando…' : 'Conectar meu WhatsApp'}
          </button>
        </>
      )}

      {err && (
        <div style={{ marginTop: 12, padding: '8px 12px', background: tokens.color.danger + '14', color: tokens.color.danger, borderRadius: 8, fontSize: 13 }}>
          {err}
        </div>
      )}
    </Card>
  )
}
