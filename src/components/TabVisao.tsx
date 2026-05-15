'use client'

import { useMemo } from 'react'
import { tokens } from '@/lib/tokens'
import { formatBRL, parseMonthKey, shiftMonth, monthLabel } from '@/lib/format'
import { fixedAppearsInMonth } from '@/lib/fixed'
import { categoryEmoji } from '@/lib/categories'
import { paymentMethodKey, type PaymentMethodKey } from '@/lib/payment'
import type { Expense, FixedCost, Installment, CustomCategory } from './types'

interface Props {
  nameA: string
  nameB: string
  monthKey: string
  expenses: Expense[]
  fixedCosts: FixedCost[]
  installments: Installment[]
  customCategories: CustomCategory[]
}

const PALETTE = [
  'var(--color-brand)',
  'var(--color-fixed)',
  'var(--color-installment)',
  'var(--color-success)',
  'var(--color-person-b)',
  'var(--color-danger)',
  '#94a3b8',
]

export default function TabVisao({
  nameA, nameB, monthKey, expenses, fixedCosts, installments, customCategories,
}: Props) {
  const monthInfo = parseMonthKey(monthKey)
  const prevMonthKey = shiftMonth(monthKey, -1)

  // ── Soma todas as despesas de UM mês: avulsos + fixos ativos + parcelas ativas
  const computeMonth = (mk: string) => {
    const { year, month } = parseMonthKey(mk)
    const monthExpenses = expenses.filter((e) => e.monthKey === mk)
    const monthFixed = fixedCosts.filter((f) => f.active && fixedAppearsInMonth(f.createdAt, f.frequency, mk))
    const monthInst = installments.filter((i) => {
      const start = new Date(i.startedAt)
      const elapsed = (year - start.getFullYear()) * 12 + (month - 1 - start.getMonth())
      return elapsed >= 0 && elapsed < i.totalParcelas
    })

    const byCategory = new Map<string, number>()
    const byPerson = { A: 0, B: 0, casalA: 0, casalB: 0 }
    const byDay = new Map<number, number>()  // só pros avulsos
    const byMethod = new Map<PaymentMethodKey, number>()
    let total = 0

    monthExpenses.forEach((e) => {
      total += e.amount
      byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount)
      if (e.scope === 'A') byPerson.A += e.amount
      else if (e.scope === 'B') byPerson.B += e.amount
      else if (e.paidBy === 'A') byPerson.casalA += e.amount
      else byPerson.casalB += e.amount
      const day = new Date(e.createdAt).getDate()
      byDay.set(day, (byDay.get(day) ?? 0) + e.amount)
      const pmk = paymentMethodKey(e.paymentMethod)
      byMethod.set(pmk, (byMethod.get(pmk) ?? 0) + e.amount)
    })
    monthFixed.forEach((f) => {
      total += f.amount
      byCategory.set(f.category, (byCategory.get(f.category) ?? 0) + f.amount)
      if (f.scope === 'A') byPerson.A += f.amount
      else if (f.scope === 'B') byPerson.B += f.amount
      else if (f.paidBy === 'A') byPerson.casalA += f.amount
      else byPerson.casalB += f.amount
      byDay.set(1, (byDay.get(1) ?? 0) + f.amount)
      const pmk = paymentMethodKey(f.paymentMethod)
      byMethod.set(pmk, (byMethod.get(pmk) ?? 0) + f.amount)
    })
    monthInst.forEach((i) => {
      total += i.parcelaMensal
      byCategory.set(i.category, (byCategory.get(i.category) ?? 0) + i.parcelaMensal)
      if (i.scope === 'A') byPerson.A += i.parcelaMensal
      else if (i.scope === 'B') byPerson.B += i.parcelaMensal
      else if (i.paidBy === 'A') byPerson.casalA += i.parcelaMensal
      else byPerson.casalB += i.parcelaMensal
      byDay.set(1, (byDay.get(1) ?? 0) + i.parcelaMensal)
      const pmk = paymentMethodKey(i.paymentMethod)
      byMethod.set(pmk, (byMethod.get(pmk) ?? 0) + i.parcelaMensal)
    })

    return { total, byCategory, byPerson, byDay, byMethod }
  }

  const cur = useMemo(() => computeMonth(monthKey), [monthKey, expenses, fixedCosts, installments])
  const prev = useMemo(() => computeMonth(prevMonthKey), [prevMonthKey, expenses, fixedCosts, installments])

  const deltaPct = prev.total > 0 ? ((cur.total - prev.total) / prev.total) * 100 : null
  const deltaSignal = deltaPct == null ? null : deltaPct > 0 ? 'up' : deltaPct < 0 ? 'down' : 'flat'

  // ── Top categorias
  const sortedCategories = useMemo(() => {
    return Array.from(cur.byCategory.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
  }, [cur.byCategory])

  const sortedMethods = useMemo(() => {
    return Array.from(cur.byMethod.entries())
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
  }, [cur.byMethod])

  const totalForChart = sortedCategories.reduce((s, [, v]) => s + v, 0)

  // ── Daily acumulado
  const dailyAccumulated = useMemo(() => {
    const daysInMonth = new Date(monthInfo.year, monthInfo.month, 0).getDate()
    const todayDate = new Date()
    const isCurrentMonth =
      todayDate.getFullYear() === monthInfo.year && todayDate.getMonth() === monthInfo.month - 1
    const maxDay = isCurrentMonth ? todayDate.getDate() : daysInMonth
    const arr: { day: number; total: number; cumulative: number }[] = []
    let cumulative = 0
    for (let d = 1; d <= daysInMonth; d++) {
      const v = cur.byDay.get(d) ?? 0
      if (d <= maxDay) cumulative += v
      arr.push({ day: d, total: v, cumulative })
    }
    return { arr, maxDay, daysInMonth }
  }, [cur.byDay, monthInfo.year, monthInfo.month])

  const isEmpty = cur.total === 0

  return (
    <>
      {/* ── Header total + delta ── */}
      <div
        style={{
          marginBottom: 18,
          padding: '20px 22px',
          background: tokens.color.bg_card,
          border: `1px solid ${tokens.color.border_subtle}`,
          borderRadius: 18,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: tokens.color.text_muted,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 600,
          }}
        >
          Total · {monthLabel(monthKey, true)}
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: tokens.color.text_heading,
            letterSpacing: '-0.02em',
            marginTop: 6,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatBRL(cur.total)}
        </div>
        {deltaPct != null && (
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color:
                deltaSignal === 'up'
                  ? tokens.color.danger
                  : deltaSignal === 'down'
                    ? tokens.color.success
                    : tokens.color.text_muted,
              fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <DeltaIcon dir={deltaSignal} />
            <span>
              <strong style={{ fontWeight: 700 }}>{Math.abs(deltaPct).toFixed(0)}%</strong>{' '}
              {deltaSignal === 'up' ? 'a mais' : deltaSignal === 'down' ? 'a menos' : 'igual'} que {monthLabel(prevMonthKey, true)}
            </span>
          </div>
        )}
      </div>

      {isEmpty ? (
        <EmptyVisao />
      ) : (
        <>
          {/* ── Donut categorias ── */}
          <ChartCard title="Por categoria">
            <DonutChart
              data={sortedCategories.map(([cat, val], i) => ({
                label: cat,
                value: val,
                color: PALETTE[i % PALETTE.length],
                icon: categoryEmoji(cat, customCategories),
              }))}
              total={totalForChart}
            />
          </ChartCard>

          {/* ── Barras A vs B ── */}
          <ChartCard title="Por pessoa">
            <BarsChart
              total={cur.total}
              segments={[
                { label: `${nameA} (compartilhado)`, value: cur.byPerson.casalA, color: tokens.color.personA },
                { label: `${nameA} (pessoal)`,        value: cur.byPerson.A,      color: 'rgba(91,141,255,0.55)' },
                { label: `${nameB} (compartilhado)`, value: cur.byPerson.casalB, color: tokens.color.personB },
                { label: `${nameB} (pessoal)`,        value: cur.byPerson.B,      color: 'rgba(77,212,207,0.55)' },
              ]}
            />
          </ChartCard>

          {/* ── Linha do tempo ── */}
          <ChartCard title="Acumulado no mês">
            <LineChart
              data={dailyAccumulated.arr}
              maxDay={dailyAccumulated.maxDay}
            />
          </ChartCard>

          {/* ── Compare com mês anterior por categoria ── */}
          <ChartCard title={`Variação vs ${monthLabel(prevMonthKey, true)}`}>
            <CompareList
              current={cur.byCategory}
              previous={prev.byCategory}
              customCategories={customCategories}
            />
          </ChartCard>
        </>
      )}
    </>
  )
}

// ───────────────────────────────────────────────────────────────── components ──

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: tokens.color.bg_card,
        border: `1px solid ${tokens.color.border_subtle}`,
        borderRadius: 18,
        padding: '18px 20px',
        marginBottom: 14,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: tokens.color.text_muted,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

function DonutChart({
  data, total, centerLabel,
}: {
  data: { label: string; value: number; color: string; icon: React.ReactNode }[]
  total: number
  centerLabel?: string
}) {
  const size = 140
  const stroke = 22
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r

  let offset = 0
  const segments = data.map((d) => {
    const pct = d.value / total
    const length = circumference * pct
    const seg = { ...d, pct, length, offset }
    offset += length
    return seg
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border-subtle)"
          strokeWidth={stroke}
        />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${s.length} ${circumference}`}
            strokeDashoffset={-s.offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            strokeLinecap="butt"
          />
        ))}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontSize: 18,
            fontWeight: 700,
            fill: tokens.color.text_heading,
            fontFamily: tokens.primitive.fontFamily.sans,
          }}
        >
          {data.length}
        </text>
        <text
          x="50%"
          y="62%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontSize: 9,
            fill: tokens.color.text_muted,
            fontFamily: tokens.primitive.fontFamily.sans,
            letterSpacing: '0.1em',
          }}
        >
          {centerLabel ?? 'CATEGORIAS'}
        </text>
      </svg>

      <div style={{ flex: 1, minWidth: 0 }}>
        {data.map((d, i) => (
          <div
            key={d.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 0',
              borderBottom: i < data.length - 1 ? `1px solid ${tokens.color.border_subtle}` : 'none',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 8, height: 8,
                borderRadius: 2,
                background: d.color,
                flexShrink: 0,
              }}
            />
            <span
              aria-hidden
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 16,
                height: 16,
                color: d.color,
                flexShrink: 0,
              }}
            >
              {d.icon}
            </span>
            <span
              style={{
                fontSize: 12,
                color: tokens.color.text_body,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
              }}
            >
              {d.label}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: tokens.color.text_heading,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {((d.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BarsChart({
  total, segments,
}: {
  total: number
  segments: { label: string; value: number; color: string }[]
}) {
  const max = Math.max(...segments.map((s) => s.value))
  return (
    <div>
      {/* Stacked bar */}
      <div
        style={{
          display: 'flex',
          height: 10,
          background: tokens.color.border_subtle,
          borderRadius: 999,
          overflow: 'hidden',
          marginBottom: 18,
        }}
      >
        {segments.map((s, i) => (
          <div
            key={i}
            title={`${s.label}: ${formatBRL(s.value)}`}
            style={{
              flex: s.value,
              background: s.color,
              transition: 'flex 280ms cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        ))}
      </div>
      {segments.map((s) => (
        <div
          key={s.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '7px 0',
            borderBottom: `1px solid ${tokens.color.border_subtle}`,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 8, height: 8,
              borderRadius: 2,
              background: s.color,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 13,
              color: tokens.color.text_body,
              flex: 1,
              minWidth: 0,
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {s.label}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: tokens.color.text_heading,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatBRL(s.value)}
          </span>
        </div>
      ))}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: 10,
          paddingTop: 10,
          borderTop: `1px solid ${tokens.color.border_default}`,
        }}
      >
        <span
          style={{
            flex: 1,
            fontSize: 12,
            color: tokens.color.text_muted,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 600,
          }}
        >
          Total
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: tokens.color.text_heading,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatBRL(total)}
        </span>
      </div>
    </div>
  )
}

function LineChart({
  data, maxDay,
}: {
  data: { day: number; total: number; cumulative: number }[]
  maxDay: number
}) {
  const w = 320
  const h = 110
  const padX = 8
  const padY = 8
  const maxValue = Math.max(...data.map((d) => d.cumulative), 1)

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (w - padX * 2)
    const y = h - padY - (d.cumulative / maxValue) * (h - padY * 2)
    return { x, y, ...d }
  })

  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')
  const areaD = pathD + ` L ${points[points.length - 1].x} ${h - padY} L ${points[0].x} ${h - padY} Z`

  const today = points[Math.min(maxDay - 1, points.length - 1)]

  return (
    <div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="cna-line-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.30" />
            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#cna-line-grad)" />
        <path
          d={pathD}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {today && (
          <g>
            <circle cx={today.x} cy={today.y} r={4.5} fill="var(--color-brand)" stroke="var(--color-bg-card)" strokeWidth={2} />
          </g>
        )}
      </svg>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 4,
          fontSize: 11,
          color: tokens.color.text_muted,
          fontWeight: 500,
        }}
      >
        <span>dia 1</span>
        <span>dia {Math.round(data.length / 2)}</span>
        <span>dia {data.length}</span>
      </div>
      {today && (
        <div
          style={{
            marginTop: 14,
            padding: '10px 12px',
            background: tokens.color.bg_app,
            borderRadius: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 12, color: tokens.color.text_muted, fontWeight: 500 }}>
            Acumulado até hoje (dia {maxDay})
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: tokens.color.text_heading,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatBRL(today.cumulative)}
          </span>
        </div>
      )}
    </div>
  )
}

function CompareList({
  current, previous, customCategories,
}: {
  current: Map<string, number>
  previous: Map<string, number>
  customCategories: CustomCategory[]
}) {
  const catSet = new Set<string>()
  current.forEach((_, k) => catSet.add(k))
  previous.forEach((_, k) => catSet.add(k))
  const allCats = Array.from(catSet)
  const rows = allCats
    .map((cat) => {
      const cur = current.get(cat) ?? 0
      const prev = previous.get(cat) ?? 0
      const delta = cur - prev
      const pct = prev > 0 ? (delta / prev) * 100 : cur > 0 ? null : 0
      return { cat, cur, prev, delta, pct }
    })
    .filter((r) => r.cur > 0 || r.prev > 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 6)

  if (rows.length === 0) {
    return (
      <div style={{ fontSize: 13, color: tokens.color.text_muted, padding: '8px 0' }}>
        Sem comparação possível ainda.
      </div>
    )
  }

  return (
    <div>
      {rows.map((r) => {
        const dir = r.delta > 0 ? 'up' : r.delta < 0 ? 'down' : 'flat'
        const color = dir === 'up' ? tokens.color.danger : dir === 'down' ? tokens.color.success : tokens.color.text_muted
        return (
          <div
            key={r.cat}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 0',
              borderBottom: `1px solid ${tokens.color.border_subtle}`,
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{categoryEmoji(r.cat, customCategories)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: tokens.color.text_heading }}>
                {r.cat}
              </div>
              <div style={{ fontSize: 11, color: tokens.color.text_muted, marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>
                {formatBRL(r.prev)} → {formatBRL(r.cur)}
              </div>
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <DeltaIcon dir={dir} />
              {r.pct == null ? 'novo' : `${Math.abs(r.pct).toFixed(0)}%`}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DeltaIcon({ dir }: { dir: 'up' | 'down' | 'flat' | null }) {
  if (dir === 'flat' || dir == null) {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M5 12h14" />
      </svg>
    )
  }
  if (dir === 'up') {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 14l5-5 5 5" />
      </svg>
    )
  }
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10l5 5 5-5" />
    </svg>
  )
}

function EmptyVisao() {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '60px 20px',
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 18,
          color: tokens.color.text_heading,
          letterSpacing: '-0.01em',
        }}
      >
        Sem dados pra este mês
      </div>
      <div
        style={{
          fontSize: 14,
          color: tokens.color.text_muted,
          marginTop: 4,
        }}
      >
        Adicione gastos pra ver os gráficos
      </div>
    </div>
  )
}
