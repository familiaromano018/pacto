'use client'

import { useState, useEffect, type CSSProperties } from 'react'
import { tokens } from '@/lib/tokens'
import { formatBRL, monthLabel } from '@/lib/format'
import { Avatar, Card, Inp, Lbl } from './ui'
import { getTheme, setTheme, type Theme } from '@/lib/theme'
import { allCategoryNames, categoryEmoji } from '@/lib/categories'
import InstallPrompt from './InstallPrompt'
import PendingRequestsCard from './PendingRequestsCard'
import WhatsappCard from './WhatsappCard'
import type { ClosedMonth, CustomCategory } from './types'

interface Props {
  nameA: string
  nameB: string
  incomeA: string
  incomeB: string
  method: '50/50' | 'proporcional' | 'unificada' | 'categorias'
  mesada: string
  categorySplit: Record<string, 'A' | 'B' | 'ambos'>
  categoryBudgets: Record<string, number>
  closedMonths: ClosedMonth[]
  customCategories: CustomCategory[]
  coupleCode: string | null
  partnerJoined: boolean
  coupleId: string | null
  currentUserId: string
  onUpdate: (patch: {
    nameA?: string; nameB?: string
    incomeA?: string; incomeB?: string
    method?: '50/50' | 'proporcional' | 'unificada' | 'categorias'; mesada?: string
    categorySplit?: Record<string, 'A' | 'B' | 'ambos'>
    categoryBudgets?: Record<string, number>
  }) => void
  onSignOut: () => void
  onExportMonth: (monthKey: string) => void
  onRemoveCategory: (id: string) => void
}

export default function TabConfig({
  nameA, nameB, incomeA, incomeB, method, mesada, categorySplit, categoryBudgets, closedMonths, customCategories,
  coupleCode, partnerJoined, coupleId, currentUserId,
  onUpdate, onSignOut, onExportMonth, onRemoveCategory,
}: Props) {
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [theme, setThemeState] = useState<Theme>('dark')
  const [budgetDraft, setBudgetDraft] = useState<Record<string, string>>({})
  useEffect(() => { setThemeState(getTheme()) }, [])
  function chooseTheme(t: Theme) { setTheme(t); setThemeState(t) }

  function copyCode() {
    if (!coupleCode) return
    navigator.clipboard?.writeText(coupleCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  function shareCode() {
    if (!coupleCode) return
    if (navigator.share) {
      navigator.share({
        title: 'Convite Pacto',
        text: `Vamos organizar nossas contas no Pacto. Meu código: ${coupleCode}`,
      }).catch(() => {})
    } else {
      copyCode()
    }
  }

  return (
    <>
      {coupleId && (
        <PendingRequestsCard
          coupleId={coupleId}
          currentUserId={currentUserId}
          partnerName="Parceiro(a)"
        />
      )}

      {/* Instalar como app (esconde se já tá instalado ou não suportado) */}
      <InstallPrompt />

      {/* Identidade */}
      <Card>
        <h3
          style={{
            fontFamily: tokens.primitive.fontFamily.display,
            fontWeight: tokens.primitive.fontWeight.extrabold,
            fontSize: tokens.primitive.fontSize.xl,
            color: tokens.color.text_heading,
            marginBottom: tokens.primitive.space[8],
          }}
        >
          O casal
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.primitive.space[6] }}>
          <div>
            <Lbl text="Pessoa A" />
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.primitive.space[4] }}>
              <Avatar name={nameA || 'A'} color={tokens.color.personA} size={32} />
              <Inp placeholder="Nome" value={nameA} onChange={(v) => onUpdate({ nameA: v })} />
            </div>
          </div>
          <div>
            <Lbl text="Pessoa B" />
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.primitive.space[4] }}>
              <Avatar name={nameB || 'B'} color={tokens.color.personB} size={32} />
              <Inp placeholder="Nome" value={nameB} onChange={(v) => onUpdate({ nameB: v })} />
            </div>
          </div>
          <div>
            <Lbl text={`Renda ${nameA}`} />
            <Inp placeholder="0,00" value={incomeA} onChange={(v) => onUpdate({ incomeA: v })} type="number" />
          </div>
          <div>
            <Lbl text={`Renda ${nameB}`} />
            <Inp placeholder="0,00" value={incomeB} onChange={(v) => onUpdate({ incomeB: v })} type="number" />
          </div>
        </div>
      </Card>

      {/* Integração WhatsApp */}
      <WhatsappCard />

      {/* Aparência — tema claro/escuro */}
      <Card>
        <h3
          style={{
            fontFamily: tokens.primitive.fontFamily.display,
            fontWeight: tokens.primitive.fontWeight.extrabold,
            fontSize: tokens.primitive.fontSize.xl,
            color: tokens.color.text_heading,
            marginBottom: tokens.primitive.space[5],
          }}
        >
          Aparência
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            padding: 4,
            background: tokens.color.bg_app,
            borderRadius: tokens.primitive.radius.lg,
          }}
        >
          {([
            { v: 'light' as const, l: '☀️ Claro' },
            { v: 'dark' as const, l: '🌙 Escuro' },
          ]).map((o) => {
            const active = theme === o.v
            return (
              <button
                key={o.v}
                onClick={() => chooseTheme(o.v)}
                style={{
                  background: active ? tokens.color.brand : 'transparent',
                  color: active ? tokens.color.text_onBrand : tokens.color.text_secondary,
                  border: 'none',
                  borderRadius: tokens.primitive.radius.md,
                  padding: `${tokens.primitive.space[5]} 0`,
                  fontSize: tokens.primitive.fontSize.lg,
                  fontWeight: tokens.primitive.fontWeight.bold,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: tokens.motion.interaction,
                }}
              >
                {o.l}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Método de divisão */}
      <Card>
        <h3
          style={{
            fontFamily: tokens.primitive.fontFamily.display,
            fontWeight: tokens.primitive.fontWeight.extrabold,
            fontSize: tokens.primitive.fontSize.xl,
            color: tokens.color.text_heading,
            marginBottom: tokens.primitive.space[5],
          }}
        >
          Como dividir as contas do casal
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.primitive.space[5] }}>
          {([
            { id: '50/50' as const, emoji: '⚖️', title: '50/50 fixo', sub: 'Cada um paga metade' },
            { id: 'proporcional' as const, emoji: '📐', title: 'Proporcional à renda', sub: 'Quem ganha mais, contribui mais' },
            { id: 'unificada' as const, emoji: '🤝', title: 'Conta 100% unificada', sub: 'Tudo de uma conta conjunta · sem acerto' },
            { id: 'categorias' as const, emoji: '🗂️', title: 'Divisão por categorias', sub: 'Cada um assume certas categorias' },
          ]).map((m) => {
            const active = method === m.id
            return (
              <button
                key={m.id}
                onClick={() => onUpdate({ method: m.id })}
                style={{
                  textAlign: 'left',
                  background: active ? tokens.color.brand + '11' : tokens.color.bg_card,
                  border: `2px solid ${active ? tokens.color.brand : tokens.color.border_default}`,
                  borderRadius: tokens.primitive.radius.lg,
                  padding: `${tokens.primitive.space[7]} ${tokens.primitive.space[8]}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.primitive.space[6],
                  fontFamily: 'inherit',
                  transition: tokens.motion.interaction,
                }}
              >
                <span style={{ fontSize: 28 }}>{m.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: tokens.primitive.fontWeight.bold,
                      fontSize: tokens.primitive.fontSize.lg,
                      color: tokens.color.text_heading,
                    }}
                  >
                    {m.title}
                  </div>
                  <div
                    style={{
                      color: tokens.color.text_muted,
                      fontSize: tokens.primitive.fontSize.base,
                      marginTop: 2,
                    }}
                  >
                    {m.sub}
                  </div>
                </div>
                {active && (
                  <span style={{ color: tokens.color.brand, fontSize: 22, fontWeight: 900 }}>✓</span>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Atribuição de categorias — só no método 'categorias' */}
      {method === 'categorias' && (
        <Card>
          <h3
            style={{
              fontFamily: tokens.primitive.fontFamily.display,
              fontWeight: tokens.primitive.fontWeight.extrabold,
              fontSize: tokens.primitive.fontSize.xl,
              color: tokens.color.text_heading,
              marginBottom: tokens.primitive.space[2],
            }}
          >
            Quem assume cada categoria
          </h3>
          <p
            style={{
              fontSize: tokens.primitive.fontSize.sm,
              color: tokens.color.text_muted,
              marginBottom: tokens.primitive.space[6],
              lineHeight: 1.5,
            }}
          >
            Defina o responsável por cada categoria das contas do casal.
            <strong> Ambos</strong> divide 50/50.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.primitive.space[4] }}>
            {allCategoryNames(customCategories).map((cat) => {
              const owner = categorySplit[cat] ?? 'ambos'
              return (
                <div
                  key={cat}
                  style={{ display: 'flex', alignItems: 'center', gap: tokens.primitive.space[4] }}
                >
                  <span style={{ flex: 1, fontSize: tokens.primitive.fontSize.base, color: tokens.color.text_body, minWidth: 0 }}>
                    {categoryEmoji(cat, customCategories)} {cat}
                  </span>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {([
                      { v: 'A' as const, l: nameA || 'A', c: tokens.color.personA },
                      { v: 'ambos' as const, l: 'Ambos', c: tokens.color.brand },
                      { v: 'B' as const, l: nameB || 'B', c: tokens.color.personB },
                    ]).map((o) => {
                      const active = owner === o.v
                      return (
                        <button
                          key={o.v}
                          onClick={() => onUpdate({ categorySplit: { ...categorySplit, [cat]: o.v } })}
                          style={{
                            background: active ? o.c : tokens.color.bg_card,
                            color: active ? '#fff' : tokens.color.text_secondary,
                            border: `1.5px solid ${active ? o.c : tokens.color.border_default}`,
                            borderRadius: tokens.primitive.radius.pill,
                            padding: '5px 10px',
                            fontSize: tokens.primitive.fontSize.sm,
                            fontWeight: tokens.primitive.fontWeight.semibold,
                            fontFamily: 'inherit',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            maxWidth: 90,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {o.l}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Orçamento por categoria */}
      <Card>
        <h3
          style={{
            fontFamily: tokens.primitive.fontFamily.display,
            fontWeight: tokens.primitive.fontWeight.extrabold,
            fontSize: tokens.primitive.fontSize.xl,
            color: tokens.color.text_heading,
            marginBottom: tokens.primitive.space[2],
          }}
        >
          Orçamento mensal por categoria
        </h3>
        <p
          style={{
            fontSize: tokens.primitive.fontSize.sm,
            color: tokens.color.text_muted,
            marginBottom: tokens.primitive.space[6],
            lineHeight: 1.5,
          }}
        >
          Defina um limite por categoria. Na aba <strong>Visão</strong> aparece a barra de
          progresso e o app avisa quando vocês passam de 80% e quando estouram. Vazio = sem limite.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.primitive.space[4] }}>
          {allCategoryNames(customCategories).map((cat) => {
            const saved = categoryBudgets[cat]
            const value = budgetDraft[cat] ?? (saved ? String(saved) : '')
            const commit = (raw: string) => {
              const n = Math.max(0, parseFloat(raw.replace(',', '.')) || 0)
              const next = { ...categoryBudgets }
              if (n > 0) next[cat] = n
              else delete next[cat]
              onUpdate({ categoryBudgets: next })
            }
            return (
              <div
                key={cat}
                style={{ display: 'flex', alignItems: 'center', gap: tokens.primitive.space[4] }}
              >
                <span style={{ flex: 1, fontSize: tokens.primitive.fontSize.base, color: tokens.color.text_body, minWidth: 0 }}>
                  {categoryEmoji(cat, customCategories)} {cat}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: tokens.primitive.fontSize.sm, color: tokens.color.text_muted }}>R$</span>
                  <input
                    inputMode="decimal"
                    placeholder="0"
                    value={value}
                    onChange={(e) => setBudgetDraft((d) => ({ ...d, [cat]: e.target.value }))}
                    onBlur={(e) => commit(e.target.value)}
                    style={{
                      width: 96,
                      background: tokens.color.bg_card,
                      color: tokens.color.text_body,
                      border: `1.5px solid ${tokens.color.border_default}`,
                      borderRadius: 10,
                      padding: '6px 10px',
                      fontSize: tokens.primitive.fontSize.sm,
                      fontFamily: 'inherit',
                      textAlign: 'right',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Mesada */}
      <Card>
        <h3
          style={{
            fontFamily: tokens.primitive.fontFamily.display,
            fontWeight: tokens.primitive.fontWeight.extrabold,
            fontSize: tokens.primitive.fontSize.xl,
            color: tokens.color.text_heading,
            marginBottom: tokens.primitive.space[2],
          }}
        >
          Mesada de cada um
        </h3>
        <p
          style={{
            fontSize: tokens.primitive.fontSize.sm,
            color: tokens.color.text_muted,
            marginBottom: tokens.primitive.space[6],
            lineHeight: 1.5,
          }}
        >
          Valor igual por mês que cada um gasta livre, sem cobrança. Deixe em
          branco ou 0 se não usam mesada.
        </p>
        <div>
          <Lbl text="Mesada mensal (cada um)" />
          <Inp placeholder="0,00" value={mesada} onChange={(v) => onUpdate({ mesada: v })} type="number" />
        </div>
      </Card>

      {/* Convite */}
      <Card>
        <h3
          style={{
            fontFamily: tokens.primitive.fontFamily.display,
            fontWeight: tokens.primitive.fontWeight.extrabold,
            fontSize: tokens.primitive.fontSize.xl,
            color: tokens.color.text_heading,
            marginBottom: tokens.primitive.space[2],
          }}
        >
          Convite
        </h3>
        <p
          style={{
            fontSize: tokens.primitive.fontSize.sm,
            color: tokens.color.text_muted,
            marginBottom: tokens.primitive.space[6],
            lineHeight: 1.5,
          }}
        >
          {partnerJoined
            ? 'Seu parceiro já entrou. Tudo aqui sincroniza entre os dois em tempo real.'
            : 'Compartilhe esse código pro seu parceiro entrar no mesmo casal.'}
        </p>
        {coupleCode ? (
          <>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: `${tokens.primitive.space[6]} ${tokens.primitive.space[5]}`,
                gap: tokens.primitive.space[3],
                background: tokens.color.bg_app,
                borderRadius: tokens.primitive.radius.md,
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: tokens.color.text_heading,
                  fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                }}
              >
                {coupleCode}
              </div>
              {partnerJoined && (
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: tokens.color.brand,
                  }}
                >
                  ✓ Parceiro conectado
                </div>
              )}
            </div>
            {!partnerJoined && (
              <div style={{ display: 'flex', gap: 8, marginTop: tokens.primitive.space[5] }}>
                <button onClick={copyCode} style={inviteBtnStyle(copied)}>
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
                <button onClick={shareCode} style={inviteBtnStyle(false)}>
                  Compartilhar
                </button>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              padding: tokens.primitive.space[6],
              color: tokens.color.text_muted,
              fontSize: tokens.primitive.fontSize.sm,
              textAlign: 'center',
            }}
          >
            Carregando código…
          </div>
        )}
      </Card>

      {/* Histórico de meses fechados */}
      <Card>
        <h3
          style={{
            fontFamily: tokens.primitive.fontFamily.display,
            fontWeight: tokens.primitive.fontWeight.extrabold,
            fontSize: tokens.primitive.fontSize.xl,
            color: tokens.color.text_heading,
            marginBottom: tokens.primitive.space[5],
          }}
        >
          Meses fechados
        </h3>
        {closedMonths.length === 0 ? (
          <div
            style={{
              color: tokens.color.text_muted,
              fontSize: tokens.primitive.fontSize.md,
              padding: `${tokens.primitive.space[5]} 0`,
            }}
          >
            Nenhum mês fechado ainda. Quando fechar um mês, ele aparece aqui.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.primitive.space[4] }}>
            {[...closedMonths].sort((a, b) => b.monthKey.localeCompare(a.monthKey)).map((m) => (
              <div
                key={m.monthKey}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: `${tokens.primitive.space[5]} ${tokens.primitive.space[6]}`,
                  background: tokens.color.bg_app,
                  borderRadius: tokens.primitive.radius.md,
                  gap: 10,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: tokens.primitive.fontWeight.bold,
                      fontSize: tokens.primitive.fontSize.md,
                      color: tokens.color.text_heading,
                      textTransform: 'capitalize',
                    }}
                  >
                    {monthLabel(m.monthKey)}
                  </div>
                  <div style={{ fontSize: tokens.primitive.fontSize.xs, color: tokens.color.text_muted, marginTop: 1 }}>
                    Casal {formatBRL(m.totals.casal)} • {nameA} {formatBRL(m.totals.personalA)} • {nameB} {formatBRL(m.totals.personalB)}
                  </div>
                </div>
                <button
                  onClick={() => onExportMonth(m.monthKey)}
                  aria-label={`Exportar PDF de ${monthLabel(m.monthKey)}`}
                  style={{
                    background: tokens.color.bg_card,
                    border: `1px solid ${tokens.color.border_subtle}`,
                    color: tokens.color.text_secondary,
                    cursor: 'pointer',
                    padding: 8,
                    borderRadius: 8,
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Categorias custom */}
      <Card>
        <h3
          style={{
            fontFamily: tokens.primitive.fontFamily.display,
            fontWeight: tokens.primitive.fontWeight.extrabold,
            fontSize: tokens.primitive.fontSize.xl,
            color: tokens.color.text_heading,
            marginBottom: tokens.primitive.space[2],
          }}
        >
          Categorias personalizadas
        </h3>
        <p
          style={{
            fontSize: tokens.primitive.fontSize.sm,
            color: tokens.color.text_muted,
            marginBottom: tokens.primitive.space[6],
          }}
        >
          Crie novas no botão "+" ao adicionar um gasto.
        </p>
        {customCategories.length === 0 ? (
          <div
            style={{
              color: tokens.color.text_muted,
              fontSize: tokens.primitive.fontSize.md,
              padding: `${tokens.primitive.space[5]} 0`,
            }}
          >
            Nenhuma categoria personalizada ainda.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {customCategories.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  background: tokens.color.bg_app,
                  borderRadius: tokens.primitive.radius.md,
                }}
              >
                <span style={{ fontSize: 20 }}>{c.emoji}</span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: 600,
                    color: tokens.color.text_heading,
                  }}
                >
                  {c.name}
                </span>
                <button
                  onClick={() => onRemoveCategory(c.id)}
                  aria-label={`Remover ${c.name}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: tokens.color.text_disabled,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    padding: 4,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Ajuda */}
      <Card>
        <h3
          style={{
            fontFamily: tokens.primitive.fontFamily.display,
            fontWeight: tokens.primitive.fontWeight.extrabold,
            fontSize: tokens.primitive.fontSize.xl,
            color: tokens.color.text_heading,
            marginBottom: tokens.primitive.space[4],
          }}
        >
          Ajuda
        </h3>
        <a
          href="/ajuda"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'transparent',
            color: '#5b8dff',
            border: `1.5px solid #5b8dff33`,
            borderRadius: tokens.primitive.radius.md,
            padding: `${tokens.primitive.space[5]} ${tokens.primitive.space[8]}`,
            fontWeight: tokens.primitive.fontWeight.bold,
            fontSize: tokens.primitive.fontSize.md,
            textDecoration: 'none',
            fontFamily: 'inherit',
          }}
        >
          <span>Centro de ajuda</span>
          <span style={{ fontSize: 18 }}>→</span>
        </a>
      </Card>

      {/* Sair */}
      <Card style={{ border: `1.5px solid ${tokens.color.danger}33` }}>
        <h3
          style={{
            fontFamily: tokens.primitive.fontFamily.display,
            fontWeight: tokens.primitive.fontWeight.extrabold,
            fontSize: tokens.primitive.fontSize.xl,
            color: tokens.color.danger,
            marginBottom: tokens.primitive.space[4],
          }}
        >
          Sair
        </h3>
        {!showSignOutConfirm ? (
          <button
            onClick={() => setShowSignOutConfirm(true)}
            style={{
              background: 'transparent',
              color: tokens.color.danger,
              border: `1.5px solid ${tokens.color.danger}33`,
              borderRadius: tokens.primitive.radius.md,
              padding: `${tokens.primitive.space[5]} ${tokens.primitive.space[8]}`,
              fontWeight: tokens.primitive.fontWeight.bold,
              fontSize: tokens.primitive.fontSize.md,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            Sair desta conta
          </button>
        ) : (
          <div>
            <div
              style={{
                color: tokens.color.text_body,
                fontSize: tokens.primitive.fontSize.md,
                marginBottom: tokens.primitive.space[6],
              }}
            >
              Você vai sair deste dispositivo. Seus dados ficam salvos na nuvem — basta entrar de novo com o Google.
            </div>
            <div style={{ display: 'flex', gap: tokens.primitive.space[4] }}>
              <button
                onClick={() => setShowSignOutConfirm(false)}
                style={{
                  background: 'transparent',
                  color: tokens.color.text_secondary,
                  border: `1.5px solid ${tokens.color.border_default}`,
                  borderRadius: tokens.primitive.radius.md,
                  padding: `${tokens.primitive.space[5]} ${tokens.primitive.space[8]}`,
                  fontWeight: tokens.primitive.fontWeight.bold,
                  fontSize: tokens.primitive.fontSize.md,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => { setShowSignOutConfirm(false); onSignOut() }}
                style={{
                  background: tokens.color.danger,
                  color: tokens.color.text_onBrand,
                  border: 'none',
                  borderRadius: tokens.primitive.radius.md,
                  padding: `${tokens.primitive.space[5]} ${tokens.primitive.space[8]}`,
                  fontWeight: tokens.primitive.fontWeight.extrabold,
                  fontSize: tokens.primitive.fontSize.md,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                Sair
              </button>
            </div>
          </div>
        )}
      </Card>
    </>
  )
}

function inviteBtnStyle(active: boolean): CSSProperties {
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
