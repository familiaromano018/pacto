'use client'

import { useState, type CSSProperties, type FormEvent } from 'react'
import { Logo } from './Logo'
import { supabase } from '@/lib/supabase/client'

/** Tela exibida quando o usuário chega pelo link de "redefinir senha" do e-mail. */
export default function ResetPasswordScreen({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handle(e: FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('A senha precisa ter pelo menos 6 caracteres.'); return }
    if (password !== confirm) { setError('As senhas não conferem.'); return }
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase().auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      setTimeout(onDone, 1300)
    } catch (err: any) {
      setError(err?.message ?? 'Não foi possível redefinir a senha. Tenta de novo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 380, width: '100%', textAlign: 'center' }}>
        <Logo size={80} />
        {done ? (
          <div style={{ marginTop: 28 }}>
            <p style={{ color: 'var(--color-text-heading)', fontSize: 19, fontWeight: 600, margin: '0 0 8px' }}>Senha redefinida ✅</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Entrando no Pacto…</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--color-text-heading)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', margin: '24px 0 6px' }}>
              Criar nova senha
            </p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13, margin: '0 auto 26px', maxWidth: 300, lineHeight: 1.5 }}>
              Escolha uma senha nova pra sua conta do Pacto.
            </p>
            <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input type="password" autoComplete="new-password" placeholder="Nova senha" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
              <input type="password" autoComplete="new-password" placeholder="Repita a nova senha" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle} />
              <button type="submit" disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}>
                {loading ? 'Salvando…' : 'Salvar nova senha'}
              </button>
            </form>
            {error && (
              <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(220, 38, 38, 0.08)', color: 'var(--color-danger)', borderRadius: 10, fontSize: 13, fontWeight: 500 }}>
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const inputStyle: CSSProperties = {
  width: '100%', padding: '13px 15px', background: 'var(--color-bg-card)', color: 'var(--color-text-heading)',
  border: '1.5px solid var(--color-border-default)', borderRadius: 12, fontSize: 15, fontFamily: 'inherit', outline: 'none',
}
const primaryBtn: CSSProperties = {
  width: '100%', padding: '14px 18px', background: 'var(--color-brand)', color: '#fff', border: 'none',
  borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: 'inherit', marginTop: 2,
}
