'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { Avatar, Card, Btn, Inp, Lbl } from './ui'
import { Logo } from './Logo'
import { COLORS_A, COLORS_B } from './constants'
import {
  ensureCoupleForCurrentUser,
  joinCoupleWithCode,
  getCoupleRow,
  updateCoupleRow,
  getMyRole,
} from '@/lib/supabase/couple'
import type { CoupleRow } from '@/lib/supabase/database.types'
import { signOut } from '@/lib/supabase/useSession'
import { trackPixel } from './MetaPixel'

export interface SetupResult {
  coupleId: string
  role: 'A' | 'B'
  nameA: string
  nameB: string
  incomeA: string
  incomeB: string
  method: '50/50' | 'proporcional'
}

interface Props {
  /** se o user já é member de algum couple, passa aqui pra pular o passo de "criar/entrar" */
  initialCoupleId: string | null
  onDone: (result: SetupResult) => void
}

type Step = 'choose' | 'creating' | 'created' | 'joining' | 'details'

export default function Setup({ initialCoupleId, onDone }: Props) {
  // Se já tem coupleId, vai direto pra details — caso comum: user já criou couple antes
  const [step, setStep] = useState<Step>(initialCoupleId ? 'details' : 'choose')
  const [coupleId, setCoupleId] = useState<string | null>(initialCoupleId)
  const [coupleRow, setCoupleRow] = useState<CoupleRow | null>(null)
  const [role, setRole] = useState<'A' | 'B' | null>(null)
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // join state
  const [inviteCode, setInviteCode] = useState('')

  // details state
  const [nameA, setNameA] = useState('')
  const [nameB, setNameB] = useState('')
  const [incomeA, setIncomeA] = useState('')
  const [incomeB, setIncomeB] = useState('')
  const [method, setMethod] = useState<'50/50' | 'proporcional' | null>(null)
  const [errors, setErrors] = useState<{ nameA?: boolean; nameB?: boolean; method?: boolean }>({})

  // Carrega couple row + role quando coupleId tá setado e vai pra details
  useEffect(() => {
    if (!coupleId || step !== 'details') return
    let cancelled = false
    ;(async () => {
      try {
        const [row, r] = await Promise.all([getCoupleRow(coupleId), getMyRole(coupleId)])
        if (cancelled) return
        setCoupleRow(row)
        setRole(r)
        if (row) {
          setNameA(row.name_a || '')
          setNameB(row.name_b || '')
          setIncomeA(row.income_a || '')
          setIncomeB(row.income_b || '')
          setMethod((row.method as '50/50' | 'proporcional') || null)
        }
      } catch (err: any) {
        if (!cancelled) setErrorMsg(err?.message ?? 'Não consegui carregar o casal.')
      }
    })()
    return () => { cancelled = true }
  }, [coupleId, step])

  // ── Handlers ─────────────────────────────────────────────────────────────────
  async function handleCreate() {
    setBusy(true)
    setErrorMsg(null)
    try {
      setStep('creating')
      const id = await ensureCoupleForCurrentUser()
      const row = await getCoupleRow(id)
      setCoupleId(id)
      setCoupleRow(row)
      // Cadastro concluído: casal criado (parceiro A / iniciador). É o evento que
      // permite o Meta otimizar por signup real, não por clique acidental no Reels.
      trackPixel('CompleteRegistration', { content_name: 'couple_created', status: 'creator' })
      setStep('created')
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Não foi possível criar o casal.')
      setStep('choose')
    } finally {
      setBusy(false)
    }
  }

  async function handleJoin() {
    if (!inviteCode.trim()) {
      setErrorMsg('Digita o código do convite.')
      return
    }
    setBusy(true)
    setErrorMsg(null)
    try {
      const id = await joinCoupleWithCode(inviteCode.trim())
      setCoupleId(id)
      // Cadastro concluído: parceiro B entrou pelo código de convite.
      trackPixel('CompleteRegistration', { content_name: 'couple_joined', status: 'partner' })
      setStep('details')
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Não consegui entrar no casal.')
    } finally {
      setBusy(false)
    }
  }

  async function handleFinish() {
    const next = {
      nameA: !nameA.trim(),
      nameB: !nameB.trim(),
      method: !method,
    }
    if (next.nameA || next.nameB || next.method) {
      setErrors(next)
      return
    }
    if (!coupleId) {
      setErrorMsg('Couple ID perdido — recarrega a página.')
      return
    }
    setErrors({})
    setBusy(true)
    setErrorMsg(null)
    try {
      await updateCoupleRow(coupleId, {
        name_a: nameA.trim(),
        name_b: nameB.trim(),
        income_a: incomeA,
        income_b: incomeB,
        method: method!,
      })
      onDone({
        coupleId,
        role: role ?? 'A',
        nameA: nameA.trim(),
        nameB: nameB.trim(),
        incomeA,
        incomeB,
        method: method!,
      })
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Não foi possível salvar.')
    } finally {
      setBusy(false)
    }
  }

  function copyCode() {
    if (!coupleRow?.code) return
    navigator.clipboard?.writeText(coupleRow.code).catch(() => {})
  }
  function shareCode() {
    if (!coupleRow?.code) return
    if (navigator.share) {
      navigator.share({
        title: 'Convite Pacto',
        text: `Vamos organizar nossas contas no Pacto. Meu código: ${coupleRow.code}`,
      }).catch(() => {})
    } else {
      copyCode()
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-app)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: 20,
      }}
    >
      <div style={{ maxWidth: 440, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32, color: 'var(--color-text-heading)' }}>
          <Logo size={72} />
        </div>

        {step === 'choose' && (
          <ChooseStep
            onCreate={handleCreate}
            onJoinClick={() => { setErrorMsg(null); setStep('joining') }}
            onLogout={() => signOut()}
            error={errorMsg}
          />
        )}

        {step === 'creating' && (
          <Card>
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Criando casal…
            </div>
          </Card>
        )}

        {step === 'created' && coupleRow && (
          <CreatedStep
            code={coupleRow.code}
            onCopy={copyCode}
            onShare={shareCode}
            onContinue={() => setStep('details')}
          />
        )}

        {step === 'joining' && (
          <JoiningStep
            code={inviteCode}
            onChangeCode={setInviteCode}
            onSubmit={handleJoin}
            onBack={() => { setErrorMsg(null); setStep('choose') }}
            busy={busy}
            error={errorMsg}
          />
        )}

        {step === 'details' && (
          <DetailsStep
            nameA={nameA} setNameA={(v) => { setNameA(v); if (errors.nameA) setErrors((e) => ({ ...e, nameA: false })) }}
            nameB={nameB} setNameB={(v) => { setNameB(v); if (errors.nameB) setErrors((e) => ({ ...e, nameB: false })) }}
            incomeA={incomeA} setIncomeA={setIncomeA}
            incomeB={incomeB} setIncomeB={setIncomeB}
            method={method} setMethod={(m) => { setMethod(m); if (errors.method) setErrors((e) => ({ ...e, method: false })) }}
            errors={errors}
            onSubmit={handleFinish}
            busy={busy}
            error={errorMsg}
            role={role}
            coupleCode={coupleRow?.code ?? null}
          />
        )}
      </div>
    </div>
  )
}

// ── ChooseStep ─────────────────────────────────────────────────────────────────
function ChooseStep({
  onCreate, onJoinClick, onLogout, error,
}: { onCreate: () => void; onJoinClick: () => void; onLogout: () => void; error: string | null }) {
  return (
    <>
      <p
        style={{
          color: 'var(--color-text-heading)',
          fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em',
          textAlign: 'center', margin: '0 0 8px',
        }}
      >
        Vamos começar.
      </p>
      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: 13, textAlign: 'center', margin: '0 0 24px', lineHeight: 1.5,
        }}
      >
        Cria um pacto novo ou entra no do seu parceiro com o código.
      </p>

      <Card>
        <button
          onClick={onCreate}
          style={cardButtonStyle()}
        >
          <div style={{ fontSize: 28 }}>💞</div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-heading)' }}>
              Criar pacto novo
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 12, marginTop: 2 }}>
              Você vai receber um código pra convidar.
            </div>
          </div>
          <Chev />
        </button>

        <div style={{ height: 8 }} />

        <button
          onClick={onJoinClick}
          style={cardButtonStyle()}
        >
          <div style={{ fontSize: 28 }}>🔑</div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-heading)' }}>
              Tenho um convite
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 12, marginTop: 2 }}>
              Digite o código PACTO-XXXX que recebeu.
            </div>
          </div>
          <Chev />
        </button>
      </Card>

      {error && <ErrorBar text={error} />}

      <div style={{ textAlign: 'center', marginTop: 18 }}>
        <button
          onClick={onLogout}
          style={{
            background: 'none', border: 'none',
            color: 'var(--color-text-muted)',
            fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
            textDecoration: 'underline',
          }}
        >
          sair
        </button>
      </div>
    </>
  )
}

// ── CreatedStep ────────────────────────────────────────────────────────────────
function CreatedStep({
  code, onCopy, onShare, onContinue,
}: { code: string; onCopy: () => void; onShare: () => void; onContinue: () => void }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <>
      <p
        style={{
          color: 'var(--color-text-heading)',
          fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em',
          textAlign: 'center', margin: '0 0 6px',
        }}
      >
        Pacto criado ✓
      </p>
      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: 13, textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5,
        }}
      >
        Manda esse código pro seu parceiro entrar no mesmo casal.
      </p>

      <Card>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 12px 8px',
            gap: 6,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
            }}
          >
            Código de convite
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: 'var(--color-text-heading)',
              fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
              padding: '4px 8px',
            }}
          >
            {code}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, width: '100%' }}>
            <button onClick={handleCopy} style={secondaryBtnStyle(copied)}>
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
            <button onClick={onShare} style={secondaryBtnStyle(false)}>
              Compartilhar
            </button>
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
        <Btn label="Continuar →" onClick={onContinue} />
      </div>
    </>
  )
}

// ── JoiningStep ────────────────────────────────────────────────────────────────
function JoiningStep({
  code, onChangeCode, onSubmit, onBack, busy, error,
}: {
  code: string; onChangeCode: (v: string) => void; onSubmit: () => void; onBack: () => void
  busy: boolean; error: string | null
}) {
  return (
    <>
      <p
        style={{
          color: 'var(--color-text-heading)',
          fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em',
          textAlign: 'center', margin: '0 0 6px',
        }}
      >
        Digite o código
      </p>
      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: 13, textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5,
        }}
      >
        O código que seu parceiro te mandou (formato PACTO-XXXX).
      </p>

      <Card>
        <Lbl text="Código" />
        <Inp
          placeholder="PACTO-XXXX"
          value={code}
          onChange={(v) => onChangeCode(v.toUpperCase())}
        />
      </Card>

      {error && <ErrorBar text={error} />}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 6 }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: '1.5px solid var(--color-border-default)',
            color: 'var(--color-text-secondary)',
            borderRadius: 12,
            padding: '12px 22px',
            fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Voltar
        </button>
        <Btn label={busy ? 'Entrando…' : 'Entrar'} onClick={onSubmit} />
      </div>
    </>
  )
}

// ── DetailsStep ────────────────────────────────────────────────────────────────
function DetailsStep({
  nameA, setNameA, nameB, setNameB, incomeA, setIncomeA, incomeB, setIncomeB,
  method, setMethod, errors, onSubmit, busy, error, role, coupleCode,
}: {
  nameA: string; setNameA: (v: string) => void
  nameB: string; setNameB: (v: string) => void
  incomeA: string; setIncomeA: (v: string) => void
  incomeB: string; setIncomeB: (v: string) => void
  method: '50/50' | 'proporcional' | null; setMethod: (m: '50/50' | 'proporcional') => void
  errors: { nameA?: boolean; nameB?: boolean; method?: boolean }
  onSubmit: () => void
  busy: boolean
  error: string | null
  role: 'A' | 'B' | null
  coupleCode: string | null
}) {
  return (
    <>
      {role === 'B' && (
        <p
          style={{
            color: 'var(--color-text-muted)',
            fontSize: 12, textAlign: 'center', margin: '0 0 16px', lineHeight: 1.5,
          }}
        >
          Você entrou no pacto {coupleCode}. Confirma os dados abaixo (você pode editar).
        </p>
      )}

      <Card>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: 'var(--color-text-heading)', letterSpacing: '-0.01em' }}>Quem é quem</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <Lbl text="Pessoa A" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar name={nameA || 'A'} color={COLORS_A} />
              <Inp placeholder="Ex: Ana" value={nameA} onChange={setNameA} />
            </div>
            {errors.nameA && <FieldError text="Coloca o nome da pessoa A" />}
          </div>
          <div>
            <Lbl text="Pessoa B" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar name={nameB || 'B'} color={COLORS_B} />
              <Inp placeholder="Ex: Pedro" value={nameB} onChange={setNameB} />
            </div>
            {errors.nameB && <FieldError text="Coloca o nome da pessoa B" />}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <Lbl text={`Renda de ${nameA || 'A'} (R$)`} />
            <Inp placeholder="0,00" value={incomeA} onChange={setIncomeA} type="number" />
          </div>
          <div>
            <Lbl text={`Renda de ${nameB || 'B'} (R$)`} />
            <Inp placeholder="0,00" value={incomeB} onChange={setIncomeB} type="number" />
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: 'var(--color-text-heading)', letterSpacing: '-0.01em' }}>
          Como dividir as contas do casal
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, margin: '0 0 16px' }}>
          Apenas as despesas compartilhadas entram no cálculo.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { id: '50/50' as const, title: '50/50 fixo', sub: 'Cada um paga metade, independente da renda.' },
            { id: 'proporcional' as const, title: 'Proporcional à renda', sub: 'Quem ganha mais, contribui mais.' },
          ].map((m) => (
            <div
              key={m.id}
              onClick={() => setMethod(m.id)}
              style={{
                border: `1px solid ${method === m.id ? 'var(--color-brand)' : 'var(--color-border-default)'}`,
                borderRadius: 12,
                padding: '14px 16px',
                cursor: 'pointer',
                background: method === m.id ? 'rgba(91,141,255,0.08)' : 'var(--color-bg-card)',
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-heading)' }}>{m.title}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 12, marginTop: 2 }}>{m.sub}</div>
              </div>
              {method === m.id && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
        {errors.method && <FieldError text="Escolha um método de divisão" />}
      </Card>

      {error && <ErrorBar text={error} />}

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Btn label={busy ? 'Salvando…' : 'Começar'} onClick={onSubmit} />
      </div>
    </>
  )
}

// ── Helpers visuais ────────────────────────────────────────────────────────────
function FieldError({ text }: { text: string }) {
  return (
    <div style={{ marginTop: 6, color: 'var(--color-danger)', fontSize: 12, fontWeight: 500 }}>
      {text}
    </div>
  )
}
function ErrorBar({ text }: { text: string }) {
  return (
    <div
      style={{
        margin: '14px 0 4px',
        padding: '10px 14px',
        background: 'rgba(220, 38, 38, 0.08)',
        color: 'var(--color-danger)',
        borderRadius: 10,
        fontSize: 13, fontWeight: 500,
      }}
    >
      {text}
    </div>
  )
}
function cardButtonStyle(): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    padding: '14px 16px',
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 12,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  }
}
function secondaryBtnStyle(active: boolean): CSSProperties {
  return {
    flex: 1,
    padding: '10px 14px',
    background: active ? 'rgba(91,141,255,0.12)' : 'transparent',
    color: active ? 'var(--color-brand)' : 'var(--color-text-heading)',
    border: `1.5px solid ${active ? 'var(--color-brand)' : 'var(--color-border-default)'}`,
    borderRadius: 10,
    fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.15s',
  }
}
function Chev() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}
