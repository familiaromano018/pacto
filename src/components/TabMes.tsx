'use client'

import { useEffect, useMemo, useState } from 'react'
import { tokens } from '@/lib/tokens'
import { formatBRL, formatRelativeDay, currentMonthKey, parseMonthKey } from '@/lib/format'
import { fixedAppearsInMonth } from '@/lib/fixed'
import { Card } from './ui'
import FeedRow from './FeedRow'
import type { Expense, FixedCost, Installment, FeedEntry, CustomCategory } from './types'
import {
  paymentMethodKey,
  PAYMENT_METHOD_LABEL,
  PAYMENT_METHOD_ORDER,
  type PaymentMethodKey,
} from '@/lib/payment'
import { categoryEmoji } from '@/lib/categories'

interface Props {
  nameA: string
  nameB: string
  incomeA: string
  incomeB: string
  method: '50/50' | 'proporcional'
  monthKey: string
  expenses: Expense[]
  fixedCosts: FixedCost[]
  installments: Installment[]
  customCategories: CustomCategory[]
  onRemoveExpense: (id: string) => void
  onEditExpense: (id: string) => void
  onEditFixed: (id: string) => void
  onEditInstallment: (id: string) => void
  onOpenAdd: () => void
  onCloseMonth: () => void
  onExportPDF: () => void
  isClosed: boolean
}

type FilterId = 'all' | 'casal' | 'A' | 'B'

export default function TabMes({
  nameA, nameB, incomeA, incomeB, method,
  monthKey, expenses, fixedCosts, installments, customCategories,
  onRemoveExpense, onEditExpense, onEditFixed, onEditInstallment, onOpenAdd, onCloseMonth, onExportPDF, isClosed,
}: Props) {
  const [filter, setFilter] = useState<FilterId>('all')
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethodKey | 'all'>('all')

  useEffect(() => {
    setCategoryFilter('all')
    setPaymentFilter('all')
  }, [monthKey])

  const isCurrentMonth = monthKey === currentMonthKey()
  const monthInfo = parseMonthKey(monthKey)
  const isFutureMonth = (() => {
    const now = new Date()
    return monthInfo.year > now.getFullYear() ||
      (monthInfo.year === now.getFullYear() && monthInfo.month > now.getMonth() + 1)
  })()

  // ── Compute feed entries (avulsos + fixos ativos + parcelas ativas)
  const feed = useMemo<FeedEntry[]>(() => {
    if (isFutureMonth) return []

    const entries: FeedEntry[] = []

    expenses.filter((e) => e.monthKey === monthKey).forEach((e) => {
      entries.push({
        id: e.id, sourceId: e.id,
        kind: 'avulso', desc: e.desc, amount: e.amount,
        paidBy: e.paidBy, scope: e.scope, category: e.category,
        date: e.createdAt,
        paymentMethod: e.paymentMethod,
      })
    })

    const daysInMonth = new Date(monthInfo.year, monthInfo.month, 0).getDate()
    const dayFor = (dueDay?: number) =>
      Math.min(Math.max(dueDay ?? 1, 1), daysInMonth)

    fixedCosts
      .filter((f) => f.active && fixedAppearsInMonth(f.createdAt, f.frequency, monthKey))
      .forEach((f) => {
      const day = dayFor(f.dueDay)
      entries.push({
        id: `fixed-${f.id}-${monthKey}`,
        sourceId: f.id,
        kind: 'fixo', desc: f.desc, amount: f.amount,
        paidBy: f.paidBy, scope: f.scope, category: f.category,
        date: new Date(monthInfo.year, monthInfo.month - 1, day).getTime(),
        sublabel: f.dueDay ? `vence dia ${f.dueDay}` : 'recorrente',
        paymentMethod: f.paymentMethod,
      })
    })

    installments.filter((i) => i.paidParcelas < i.totalParcelas).forEach((i) => {
      const elapsed = monthsBetween(i.startedAt, monthKey)
      if (elapsed >= 0 && elapsed < i.totalParcelas) {
        const day = dayFor(i.dueDay)
        entries.push({
          id: `inst-${i.id}-${monthKey}`,
          sourceId: i.id,
          kind: 'parcela', desc: i.desc, amount: i.parcelaMensal,
          paidBy: i.paidBy, scope: i.scope, category: i.category,
          date: new Date(monthInfo.year, monthInfo.month - 1, day).getTime(),
          sublabel: `${elapsed + 1}/${i.totalParcelas}${i.dueDay ? ` · dia ${i.dueDay}` : ''}`,
          paymentMethod: i.paymentMethod,
        })
      }
    })

    return entries.sort((a, b) => b.date - a.date)
  }, [expenses, fixedCosts, installments, monthKey, monthInfo.year, monthInfo.month, isFutureMonth])

  // Base pros dropdowns: feed filtrado SÓ por pessoa + busca (não por cat/pay).
  // Cada dropdown lista o que existe sob os filtros externos a ele,
  // mas não desaparece quando o user escolhe uma opção própria.
  const baseForOptions = useMemo(() => {
    let r = feed
    if (filter !== 'all') {
      r = r.filter((e) => filter === 'casal' ? e.scope === 'casal' : e.scope === filter)
    }
    const q = query.trim().toLowerCase()
    if (q) {
      r = r.filter((e) =>
        e.desc.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q),
      )
    }
    return r
  }, [feed, filter, query])

  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>()
    baseForOptions.forEach((e) => {
      counts.set(e.category, (counts.get(e.category) ?? 0) + 1)
    })
    return Array.from(counts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => a.category.localeCompare(b.category, 'pt-BR'))
  }, [baseForOptions])

  const paymentOptions = useMemo(() => {
    const counts = new Map<PaymentMethodKey, number>()
    baseForOptions.forEach((e) => {
      const k = paymentMethodKey(e.paymentMethod)
      counts.set(k, (counts.get(k) ?? 0) + 1)
    })
    return PAYMENT_METHOD_ORDER
      .filter((k) => (counts.get(k) ?? 0) > 0)
      .map((k) => ({ key: k, count: counts.get(k) ?? 0 }))
  }, [baseForOptions])

  const filtered = useMemo(() => {
    let r = feed
    if (filter !== 'all') {
      r = r.filter((e) => filter === 'casal' ? e.scope === 'casal' : e.scope === filter)
    }
    if (categoryFilter !== 'all') {
      r = r.filter((e) => e.category === categoryFilter)
    }
    if (paymentFilter !== 'all') {
      r = r.filter((e) => paymentMethodKey(e.paymentMethod) === paymentFilter)
    }
    const q = query.trim().toLowerCase()
    if (q) {
      r = r.filter((e) =>
        e.desc.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q),
      )
    }
    return r
  }, [feed, filter, categoryFilter, paymentFilter, query])

  // ── Totais
  const totalMes = feed.reduce((s, e) => s + e.amount, 0)
  const totalCasal = feed.filter(e => e.scope === 'casal').reduce((s, e) => s + e.amount, 0)
  const totalCasalA = feed.filter(e => e.scope === 'casal' && e.paidBy === 'A').reduce((s, e) => s + e.amount, 0)
  const totalCasalB = feed.filter(e => e.scope === 'casal' && e.paidBy === 'B').reduce((s, e) => s + e.amount, 0)
  const totalPessoalA = feed.filter(e => e.scope === 'A').reduce((s, e) => s + e.amount, 0)
  const totalPessoalB = feed.filter(e => e.scope === 'B').reduce((s, e) => s + e.amount, 0)

  // ── Rateio
  const iA = parseFloat(incomeA) || 0
  const iB = parseFloat(incomeB) || 0
  const fairShareA = method === '50/50' || (iA + iB === 0)
    ? totalCasal / 2
    : totalCasal * (iA / (iA + iB))
  const balanceA = totalCasalA - fairShareA

  const quemDeve = Math.abs(balanceA) < 0.01
    ? null
    : balanceA > 0
      ? { de: nameB, para: nameA, valor: balanceA, paraDireita: false }
      : { de: nameA, para: nameB, valor: Math.abs(balanceA), paraDireita: true }

  // ── Comprometimento renda
  const totalA = totalCasalA + totalPessoalA
  const totalB = totalCasalB + totalPessoalB
  const compA = iA > 0 ? (totalA / iA) * 100 : 0
  const compB = iB > 0 ? (totalB / iB) * 100 : 0

  // ── Agrupar por dia
  const grouped = useMemo(() => {
    const map = new Map<string, FeedEntry[]>()
    filtered.forEach((e) => {
      const key = formatRelativeDay(e.date)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    })
    return Array.from(map.entries())
  }, [filtered])

  return (
    <>
      {/* Hero — Quem deve pra quem */}
      {feed.length === 0 ? (
        <Card style={{ marginBottom: tokens.primitive.space[8] }}>
          <EmptyHero onOpenAdd={onOpenAdd} isCurrentMonth={isCurrentMonth} isFutureMonth={isFutureMonth} isClosed={isClosed} />
        </Card>
      ) : quemDeve == null ? (
        <Card style={{ marginBottom: tokens.primitive.space[8] }}>
          <BalancedHero />
        </Card>
      ) : (
        <HeroGradient
          de={quemDeve.de}
          para={quemDeve.para}
          valor={quemDeve.valor}
        />
      )}

      {/* Stats 2×2 */}
      {feed.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: tokens.primitive.space[5],
            marginBottom: tokens.primitive.space[10],
          }}
        >
          <StatTile
            label="Total do mês"
            value={formatBRL(totalMes)}
            accent={tokens.color.brand}
          />
          <StatTile
            label="Conta do casal"
            value={formatBRL(totalCasal)}
            accent={tokens.color.fixed}
          />
          {iA > 0 && (
            <StatTile
              label={`${nameA} comprometeu`}
              value={`${compA.toFixed(0)}%`}
              accent={tokens.color.personA}
              tone={compA > 80 ? 'danger' : compA > 50 ? 'warn' : 'ok'}
            />
          )}
          {iB > 0 && (
            <StatTile
              label={`${nameB} comprometeu`}
              value={`${compB.toFixed(0)}%`}
              accent={tokens.color.personB}
              tone={compB > 80 ? 'danger' : compB > 50 ? 'warn' : 'ok'}
            />
          )}
        </div>
      )}

      {/* Search bar */}
      {feed.length > 0 && (
        <div
          style={{
            position: 'relative',
            marginBottom: tokens.primitive.space[5],
          }}
        >
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: 14, top: '50%', transform: 'translateY(-50%)',
              fontSize: 16,
              opacity: 0.5,
              pointerEvents: 'none',
            }}
          >
            🔍
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar gasto..."
            style={{
              width: '100%',
              border: `1.5px solid ${tokens.color.border_default}`,
              borderRadius: 14,
              padding: '12px 14px 12px 40px',
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none',
              background: tokens.color.bg_card,
              color: tokens.color.text_heading,
              boxSizing: 'border-box',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Limpar"
              style={{
                position: 'absolute',
                right: 10, top: '50%', transform: 'translateY(-50%)',
                background: tokens.color.bg_app,
                border: 'none',
                color: tokens.color.text_secondary,
                width: 24, height: 24,
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: 'inherit',
              }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Filtros chip */}
      {feed.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: tokens.primitive.space[3],
            marginBottom: tokens.primitive.space[8],
            overflowX: 'auto',
            paddingBottom: 2,
          }}
        >
          {([
            { id: 'all', label: 'Tudo', count: feed.length, dot: null },
            { id: 'casal', label: 'Casal', count: feed.filter(e => e.scope === 'casal').length, dot: tokens.color.fixed },
            { id: 'A', label: nameA, count: feed.filter(e => e.scope === 'A').length, dot: tokens.color.personA },
            { id: 'B', label: nameB, count: feed.filter(e => e.scope === 'B').length, dot: tokens.color.personB },
          ] as { id: FilterId; label: string; count: number; dot: string | null }[]).map((chip) => {
            const active = filter === chip.id
            return (
              <button
                key={chip.id}
                onClick={() => setFilter(chip.id)}
                style={{
                  background: active ? tokens.color.bg_elevated : 'transparent',
                  color: active ? tokens.color.text_heading : tokens.color.text_secondary,
                  border: `1px solid ${active ? tokens.color.border_default : tokens.color.border_subtle}`,
                  borderRadius: 999,
                  padding: '8px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: tokens.motion.interaction,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {chip.dot && (
                  <span
                    aria-hidden
                    style={{
                      width: 6, height: 6,
                      borderRadius: '50%',
                      background: chip.dot,
                      display: 'inline-block',
                    }}
                  />
                )}
                {chip.label}
                <span style={{ color: tokens.color.text_muted, fontWeight: 500 }}>{chip.count}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Filtros: categoria + pagamento */}
      {feed.length > 0 && (categoryOptions.length > 0 || paymentOptions.length > 0) && (
        <div
          style={{
            display: 'flex',
            gap: tokens.primitive.space[3],
            marginBottom: tokens.primitive.space[8],
            overflowX: 'auto',
            paddingBottom: 2,
            alignItems: 'center',
          }}
        >
          <FilterSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="📂 Categoria"
            allLabel="Todas as categorias"
            options={categoryOptions.map(({ category, count }) => ({
              value: category,
              label: `${categoryEmoji(category, customCategories)} ${category} (${count})`,
            }))}
            active={categoryFilter !== 'all'}
          />
          <FilterSelect
            value={paymentFilter}
            onChange={(v) => setPaymentFilter(v as PaymentMethodKey | 'all')}
            placeholder="💳 Pagamento"
            allLabel="Todas as formas"
            options={paymentOptions.map(({ key, count }) => ({
              value: key,
              label: `${PAYMENT_METHOD_LABEL[key]} (${count})`,
            }))}
            active={paymentFilter !== 'all'}
          />
          {(categoryFilter !== 'all' || paymentFilter !== 'all') && (
            <button
              onClick={() => { setCategoryFilter('all'); setPaymentFilter('all') }}
              aria-label="Limpar filtros"
              style={{
                background: 'transparent',
                border: `1px solid ${tokens.color.border_subtle}`,
                color: tokens.color.text_secondary,
                borderRadius: 999,
                width: 32,
                height: 32,
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Feed por dia */}
      {filtered.length === 0 && feed.length > 0 && (
        <div
          style={{
            textAlign: 'center',
            color: tokens.color.text_muted,
            padding: `${tokens.primitive.space[16]} 0`,
            fontSize: tokens.primitive.fontSize.md,
          }}
        >
          Nenhum gasto pra esse filtro 🌵
        </div>
      )}

      {grouped.map(([dayLabel, items]) => (
        <div key={dayLabel} style={{ marginBottom: tokens.primitive.space[10] }}>
          <div
            style={{
              fontSize: tokens.primitive.fontSize.sm,
              fontWeight: tokens.primitive.fontWeight.extrabold,
              color: tokens.color.text_muted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: tokens.primitive.space[5],
            }}
          >
            {dayLabel}
          </div>
          {items.map((e) => (
            <FeedRow
              key={e.id}
              entry={e}
              nameA={nameA}
              nameB={nameB}
              customCategories={customCategories}
              onRemove={e.kind === 'avulso' ? () => onRemoveExpense(e.sourceId) : undefined}
              onEdit={
                e.kind === 'avulso' ? () => onEditExpense(e.sourceId)
                : e.kind === 'fixo' ? () => onEditFixed(e.sourceId)
                : e.kind === 'parcela' ? () => onEditInstallment(e.sourceId)
                : undefined
              }
            />
          ))}
        </div>
      ))}

      {/* Ações do mês */}
      {feed.length > 0 && (
        <div
          style={{
            marginTop: tokens.primitive.space[12],
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <button
            onClick={onExportPDF}
            style={{
              background: tokens.color.bg_card,
              color: tokens.color.text_heading,
              border: `1px solid ${tokens.color.border_default}`,
              borderRadius: 10,
              padding: '12px 22px',
              fontWeight: 600,
              fontSize: 14,
              fontFamily: 'inherit',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar extrato (PDF)
          </button>
          {isCurrentMonth && !isClosed && (
            <>
              <button
                onClick={onCloseMonth}
                style={{
                  background: 'transparent',
                  color: tokens.color.text_secondary,
                  border: `1px solid ${tokens.color.border_subtle}`,
                  borderRadius: 10,
                  padding: '12px 22px',
                  fontWeight: 600,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                Fechar este mês
              </button>
              <div
                style={{
                  fontSize: 12,
                  color: tokens.color.text_muted,
                  marginTop: 4,
                  maxWidth: 340,
                  textAlign: 'center',
                }}
              >
                Arquiva os avulsos. Fixos e parcelas continuam no próximo.
              </div>
            </>
          )}
        </div>
      )}
      {isClosed && (
        <div
          style={{
            textAlign: 'center',
            padding: `${tokens.primitive.space[10]} 0`,
            color: tokens.color.text_muted,
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: '0.02em',
          }}
        >
          MÊS ARQUIVADO
        </div>
      )}
    </>
  )
}

function StatTile({
  label, value, accent, tone,
}: {
  label: string; value: string; accent: string
  tone?: 'ok' | 'warn' | 'danger'
}) {
  const toneLabel = tone === 'danger' ? 'alto' : tone === 'warn' ? 'atenção' : tone === 'ok' ? 'ok' : null
  const toneColor = tone === 'danger' ? tokens.color.danger : tone === 'warn' ? tokens.color.installment : tone === 'ok' ? tokens.color.success : null
  return (
    <div
      style={{
        background: tokens.color.bg_card,
        border: `1px solid ${tokens.color.border_subtle}`,
        borderRadius: 14,
        padding: '14px 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 18 }}>
        <span
          aria-hidden
          style={{
            width: 6, height: 6,
            borderRadius: '50%',
            background: accent,
            display: 'inline-block',
          }}
        />
        {toneLabel && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: toneColor ?? undefined,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {toneLabel}
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: 11,
          color: tokens.color.text_secondary,
          marginTop: 10,
          fontWeight: 500,
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: tokens.color.text_heading,
          marginTop: 2,
          letterSpacing: '-0.01em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
    </div>
  )
}

function HeroGradient({
  de, para, valor,
}: {
  de: string; para: string; valor: number
}) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        marginBottom: tokens.primitive.space[8],
        padding: '24px 22px 22px',
        background: 'linear-gradient(135deg, #1a1a44 0%, #2a1b5c 50%, #1a3a8a 100%)',
        color: '#fff',
        borderRadius: 24,
        boxShadow: '0 12px 40px rgba(20, 20, 60, 0.45)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Decorative blob */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: 280, height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(91,141,255,0.25) 0%, rgba(91,141,255,0) 70%)',
          top: -120, right: -100,
        }}
      />

      <div
        style={{
          position: 'relative', zIndex: 2,
          fontSize: 11, fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: 'rgba(255,255,255,0.55)',
        }}
      >
        Saldo a equilibrar
      </div>

      <div
        style={{
          position: 'relative', zIndex: 2,
          fontSize: 36,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1.05,
          marginTop: 10,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {formatBRL(valor)}
      </div>

      <div
        style={{
          position: 'relative', zIndex: 2,
          marginTop: 8,
          fontSize: 14,
          color: 'rgba(255,255,255,0.75)',
          fontWeight: 500,
        }}
      >
        <strong style={{ color: '#fff', fontWeight: 700 }}>{de}</strong> deve pra <strong style={{ color: '#fff', fontWeight: 700 }}>{para}</strong>
      </div>

      {/* Avatares discretos no rodapé */}
      <div
        style={{
          position: 'relative', zIndex: 2,
          marginTop: 22,
          paddingTop: 18,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}
      >
        <PersonInHero name={de} />
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', flex: 1, textAlign: 'center' }}>→</div>
        <PersonInHero name={para} />
      </div>
    </div>
  )
}

function PersonInHero({ name }: { name: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          width: 28, height: 28,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 12,
          border: '1.5px solid rgba(255,255,255,0.2)',
        }}
      >
        {name ? name[0].toUpperCase() : '?'}
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.85)',
        }}
      >
        {name}
      </span>
    </div>
  )
}

function BalancedHero() {
  return (
    <div style={{ textAlign: 'center', padding: `${tokens.primitive.space[6]} 0` }}>
      <div
        style={{
          width: 44, height: 44,
          margin: '0 auto 14px',
          borderRadius: '50%',
          background: tokens.color.success_bg,
          color: tokens.color.success,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 18,
          color: tokens.color.text_heading,
          letterSpacing: '-0.01em',
        }}
      >
        Saldo zerado
      </div>
      <div
        style={{
          fontSize: 14,
          color: tokens.color.text_muted,
          marginTop: 4,
        }}
      >
        Ninguém deve nada esse mês
      </div>
    </div>
  )
}

function EmptyHero({
  onOpenAdd, isCurrentMonth, isFutureMonth, isClosed,
}: {
  onOpenAdd: () => void; isCurrentMonth: boolean; isFutureMonth: boolean; isClosed: boolean
}) {
  const title = isFutureMonth
    ? 'Mês futuro'
    : isClosed
      ? 'Mês fechado'
      : isCurrentMonth ? 'Nenhum gasto ainda' : 'Mês sem registros'
  const sub = isFutureMonth
    ? 'Volta aqui quando o mês começar'
    : isClosed
      ? 'Este mês já foi arquivado'
      : isCurrentMonth ? 'Toque no + para registrar o primeiro' : 'Sem despesas, fixas ou parcelas registradas'

  return (
    <div style={{ textAlign: 'center', padding: `${tokens.primitive.space[10]} 0 ${tokens.primitive.space[6]}` }}>
      <div
        style={{
          fontWeight: 700,
          fontSize: 18,
          color: tokens.color.text_heading,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 14,
          color: tokens.color.text_muted,
          marginTop: 4,
          marginBottom: isCurrentMonth && !isFutureMonth && !isClosed ? tokens.primitive.space[8] : 0,
        }}
      >
        {sub}
      </div>
      {isCurrentMonth && !isFutureMonth && !isClosed && (
        <button
          onClick={onOpenAdd}
          style={{
            background: tokens.color.brand,
            color: tokens.color.text_onBrand,
            border: 'none',
            borderRadius: 10,
            padding: '12px 24px',
            fontWeight: 700,
            fontSize: 14,
            fontFamily: 'inherit',
            cursor: 'pointer',
            letterSpacing: '0.01em',
          }}
        >
          Adicionar gasto
        </button>
      )}
    </div>
  )
}

function FilterSelect({
  value, onChange, placeholder, allLabel, options, active,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  allLabel: string
  options: { value: string; label: string }[]
  active: boolean
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={placeholder}
      style={{
        background: active ? tokens.color.bg_elevated : 'transparent',
        color: active ? tokens.color.text_heading : tokens.color.text_secondary,
        border: `1px solid ${active ? tokens.color.border_default : tokens.color.border_subtle}`,
        borderRadius: 999,
        padding: '8px 28px 8px 14px',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: tokens.motion.interaction,
        appearance: 'none',
        WebkitAppearance: 'none',
        backgroundImage:
          `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${
            active ? '%231b1f24' : '%2364748b'
          }' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        flexShrink: 0,
      }}
    >
      <option value="all">{active ? allLabel : placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

function monthsBetween(startTs: number, targetMonthKey: string): number {
  const start = new Date(startTs)
  const { year, month } = parseMonthKey(targetMonthKey)
  return (year - start.getFullYear()) * 12 + (month - 1 - start.getMonth())
}
