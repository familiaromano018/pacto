'use client'

import { useState, type CSSProperties, type FormEvent } from 'react'
import Link from 'next/link'
import { Logo } from './Logo'
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } from '@/lib/supabase/useSession'

function traduzErro(msg?: string): string {
  const m = (msg ?? '').toLowerCase()
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'Esse e-mail já tem conta. Tenta entrar.'
  if (m.includes('password should be at least')) return 'A senha precisa ter pelo menos 6 caracteres.'
  if (m.includes('unable to validate email') || m.includes('invalid email')) return 'E-mail inválido.'
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar (veja sua caixa de entrada).'
  if (m.includes('for security purposes') || m.includes('rate limit')) return 'Muitas tentativas. Espera um minutinho e tenta de novo.'
  return msg ?? 'Algo deu errado. Tenta de novo.'
}

export default function LoginScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  async function handleGoogle() {
    setLoading(true)
    setError(null)
    try {
      const { error } = await signInWithGoogle('/app')
      if (error) throw error
    } catch (err: any) {
      setError(err?.message ?? 'Não foi possível iniciar o login. Tenta de novo.')
      setLoading(false)
    }
  }

  async function handleEmail(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) { setError('Preencha e-mail e senha.'); return }
    if (mode === 'signup' && password.length < 6) { setError('A senha precisa ter pelo menos 6 caracteres.'); return }
    setLoading(true)
    setError(null)
    setInfo(null)
    try {
      if (mode === 'signup') {
        const { data, error } = await signUpWithEmail(email.trim(), password)
        if (error) throw error
        if (!data.session) {
          setInfo('Quase lá! Enviamos um link de confirmação pro seu e-mail. Confirme pra entrar.')
        }
        // se já vier sessão (confirmação desligada), o onAuthStateChange leva pro app
      } else {
        const { error } = await signInWithEmail(email.trim(), password)
        if (error) throw error
      }
    } catch (err: any) {
      setError(traduzErro(err?.message))
    } finally {
      setLoading(false)
    }
  }

  async function handleForgot() {
    if (!email.trim()) { setError('Digite seu e-mail acima pra eu enviar o link.'); return }
    setLoading(true)
    setError(null)
    setInfo(null)
    try {
      const { error } = await resetPassword(email.trim())
      if (error) throw error
      setInfo('Enviamos um link pra redefinir a senha no seu e-mail.')
    } catch (err: any) {
      setError(traduzErro(err?.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 380, width: '100%', textAlign: 'center' }}>
        <Logo size={80} />

        <p style={{ color: 'var(--color-text-heading)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', margin: '24px 0 6px', lineHeight: 1.25 }}>
          {mode === 'signup' ? 'Criem a conta do casal.' : 'Bem-vindos de volta.'}
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, margin: '0 auto 28px', maxWidth: 300, lineHeight: 1.5 }}>
          {mode === 'signup' ? 'Comecem grátis — 14 dias, sem cartão.' : 'Entrem pra ver o saldo do mês.'}
        </p>

        {info ? (
          <div style={{ padding: '16px 16px', background: 'rgba(52,211,153,0.10)', color: 'var(--color-text-heading)', borderRadius: 12, fontSize: 14, lineHeight: 1.5, textAlign: 'left' }}>
            ✅ {info}
            <button onClick={() => { setInfo(null) }} style={{ display: 'block', marginTop: 12, background: 'none', border: 'none', color: 'var(--color-brand)', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
              ← Voltar
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
              <input
                type="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
              <button type="submit" disabled={loading} style={{ ...primaryBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}>
                {loading ? 'Um instante…' : mode === 'signup' ? 'Criar conta' : 'Entrar'}
              </button>
            </form>

            {mode === 'signin' && (
              <button onClick={handleForgot} disabled={loading} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 12.5, marginTop: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
                Esqueci a senha
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <span style={{ flex: 1, height: 1, background: 'var(--color-border-default)' }} />
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>ou</span>
              <span style={{ flex: 1, height: 1, background: 'var(--color-border-default)' }} />
            </div>

            <button
              onClick={handleGoogle}
              disabled={loading}
              style={{ ...googleBtn, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.borderColor = 'var(--color-brand)') }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-default)' }}
            >
              <GoogleG />
              Continuar com Google
            </button>

            {error && (
              <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(220, 38, 38, 0.08)', color: 'var(--color-danger)', borderRadius: 10, fontSize: 13, fontWeight: 500 }}>
                {error}
              </div>
            )}

            <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 22 }}>
              {mode === 'signup' ? 'Já têm conta?' : 'Ainda não têm conta?'}{' '}
              <button
                onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(null) }}
                style={{ background: 'none', border: 'none', color: 'var(--color-brand)', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
              >
                {mode === 'signup' ? 'Entrar' : 'Criar conta'}
              </button>
            </p>
          </>
        )}

        <p style={{ color: 'var(--color-text-muted)', fontSize: 11, margin: '28px 0 0', lineHeight: 1.55, opacity: 0.7 }}>
          Ao continuar, você concorda com os termos de uso.<br />
          Os dados ficam só entre vocês dois.
        </p>

        <Link href="/instalar" style={{ display: 'inline-block', marginTop: 18, color: 'var(--color-brand)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
          📲 Instalar o Pacto no celular
        </Link>
      </div>
    </div>
  )
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '13px 15px',
  background: 'var(--color-bg-card)',
  color: 'var(--color-text-heading)',
  border: '1.5px solid var(--color-border-default)',
  borderRadius: 12,
  fontSize: 15,
  fontFamily: 'inherit',
  outline: 'none',
}

const primaryBtn: CSSProperties = {
  width: '100%',
  padding: '14px 18px',
  background: 'var(--color-brand)',
  color: '#fff',
  border: 'none',
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 700,
  fontFamily: 'inherit',
  marginTop: 2,
}

const googleBtn: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  width: '100%',
  padding: '13px 18px',
  background: 'var(--color-bg-card)',
  color: 'var(--color-text-heading)',
  border: '1.5px solid var(--color-border-default)',
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 600,
  fontFamily: 'inherit',
  transition: 'all 0.15s',
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  )
}
