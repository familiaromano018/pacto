'use client'

import { useState } from 'react'
import { tokens } from '@/lib/tokens'
import { formatBRL } from '@/lib/format'
import { Card, Tag, ProgressBar } from './ui'
import { categoryEmoji } from '@/lib/categories'
import { FIXED_FREQUENCY_LABEL } from '@/lib/fixed'
import { paymentMethodLabel } from './constants'
import type { FixedCost, Installment, CustomCategory } from './types'

interface Props {
  nameA: string
  nameB: string
  fixedCosts: FixedCost[]
  installments: Installment[]
  customCategories: CustomCategory[]
  setFixedCosts: React.Dispatch<React.SetStateAction<FixedCost[]>>
  setInstallments: React.Dispatch<React.SetStateAction<Installment[]>>
  onOpenAdd: () => void
}

type SubView = 'fixos' | 'parcelados'

export default function TabRecorrentes({
  nameA, nameB, fixedCosts, installments, customCategories,
  setFixedCosts, setInstallments, onOpenAdd,
}: Props) {
  const [sub, setSub] = useState<SubView>('fixos')

  return (
    <>
      {/* Segmented top */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: tokens.primitive.space[3],
          background: tokens.color.bg_card,
          border: `1.5px solid ${tokens.color.border_subtle}`,
          padding: tokens.primitive.space[2],
          borderRadius: tokens.primitive.radius.lg,
          marginBottom: tokens.primitive.space[10],
        }}
      >
        {([
          { id: 'fixos' as const, label: '📌 Fixos', count: fixedCosts.length },
          { id: 'parcelados' as const, label: '💳 Parcelados', count: installments.length },
        ]).map((opt) => {
          const active = sub === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setSub(opt.id)}
              style={{
                background: active ? tokens.color.bg_app : 'transparent',
                color: active ? tokens.color.text_heading : tokens.color.text_secondary,
                border: 'none',
                borderRadius: tokens.primitive.radius.md,
                padding: `${tokens.primitive.space[5]} 0`,
                fontWeight: tokens.primitive.fontWeight.extrabold,
                fontSize: tokens.primitive.fontSize.md,
                fontFamily: 'inherit',
                cursor: 'pointer',
                boxShadow: active ? tokens.shadow.cardSubtle : 'none',
                transition: tokens.motion.interaction,
              }}
            >
              {opt.label} <span style={{ opacity: 0.5, fontWeight: 600 }}>· {opt.count}</span>
            </button>
          )
        })}
      </div>

      {sub === 'fixos' ? (
        <FixosView
          nameA={nameA} nameB={nameB}
          fixedCosts={fixedCosts} setFixedCosts={setFixedCosts}
          customCategories={customCategories}
          onOpenAdd={onOpenAdd}
        />
      ) : (
        <ParcelasView
          nameA={nameA} nameB={nameB}
          installments={installments} setInstallments={setInstallments}
          customCategories={customCategories}
          onOpenAdd={onOpenAdd}
        />
      )}
    </>
  )
}

// ───────────────────────────────────────────────────────────────────────────────

function FixosView({
  nameA, nameB, fixedCosts, setFixedCosts, customCategories, onOpenAdd,
}: {
  nameA: string; nameB: string
  fixedCosts: FixedCost[]
  customCategories: CustomCategory[]
  setFixedCosts: React.Dispatch<React.SetStateAction<FixedCost[]>>
  onOpenAdd: () => void
}) {
  const active = fixedCosts.filter((f) => f.active)
  const paused = fixedCosts.filter((f) => !f.active)
  const totalActive = active.reduce((s, f) => s + f.amount, 0)
  const totalCasal = active.filter((f) => f.scope === 'casal').reduce((s, f) => s + f.amount, 0)
  const totalA = active.filter((f) => f.scope === 'A').reduce((s, f) => s + f.amount, 0)
  const totalB = active.filter((f) => f.scope === 'B').reduce((s, f) => s + f.amount, 0)

  if (fixedCosts.length === 0) {
    return (
      <EmptyState
        emoji="📌"
        title="Nenhum custo fixo ainda"
        sub="Aluguel, Netflix, academia, planos..."
        ctaLabel="Adicionar fixo"
        onClickCta={onOpenAdd}
      />
    )
  }

  return (
    <>
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.primitive.space[5] }}>
          <StatBox label="💑 Casal/mês" value={formatBRL(totalCasal)} color={tokens.color.brand} />
          <StatBox label={`👤 ${nameA}/mês`} value={formatBRL(totalA)} color={tokens.color.personA} />
          <StatBox label={`👤 ${nameB}/mês`} value={formatBRL(totalB)} color={tokens.color.personB} />
          <StatBox label="📌 Total/mês" value={formatBRL(totalActive)} color={tokens.color.fixed} />
        </div>
      </Card>

      {active.length > 0 && (
        <>
          <SectionTitle color={tokens.color.fixed}>Ativos ({active.length})</SectionTitle>
          {active.map((f) => (
            <FixedCard
              key={f.id}
              fixed={f}
              nameA={nameA}
              nameB={nameB}
              customCategories={customCategories}
              onToggle={() => setFixedCosts((prev) => prev.map((x) => x.id === f.id ? { ...x, active: !x.active } : x))}
              onRemove={() => setFixedCosts((prev) => prev.filter((x) => x.id !== f.id))}
              onUpdate={(patch) => setFixedCosts((prev) => prev.map((x) => x.id === f.id ? { ...x, ...patch } : x))}
            />
          ))}
        </>
      )}

      {paused.length > 0 && (
        <>
          <SectionTitle color={tokens.color.text_muted}>Pausados ({paused.length})</SectionTitle>
          {paused.map((f) => (
            <FixedCard
              key={f.id}
              fixed={f}
              nameA={nameA}
              nameB={nameB}
              customCategories={customCategories}
              muted
              onToggle={() => setFixedCosts((prev) => prev.map((x) => x.id === f.id ? { ...x, active: !x.active } : x))}
              onRemove={() => setFixedCosts((prev) => prev.filter((x) => x.id !== f.id))}
              onUpdate={(patch) => setFixedCosts((prev) => prev.map((x) => x.id === f.id ? { ...x, ...patch } : x))}
            />
          ))}
        </>
      )}
    </>
  )
}

function FixedCard({
  fixed, nameA, nameB, customCategories, muted, onToggle, onRemove, onUpdate,
}: {
  fixed: FixedCost; nameA: string; nameB: string
  customCategories: CustomCategory[]
  muted?: boolean
  onToggle: () => void; onRemove: () => void
  onUpdate: (patch: Partial<FixedCost>) => void
}) {
  const [editing, setEditing] = useState(false)
  const [desc, setDesc] = useState(fixed.desc)
  const [amount, setAmount] = useState(String(fixed.amount))

  function startEdit() {
    setDesc(fixed.desc)
    setAmount(String(fixed.amount))
    setEditing(true)
  }
  function save() {
    const v = parseFloat(amount.replace(',', '.'))
    if (!desc.trim() || !(v > 0)) return
    onUpdate({ desc: desc.trim(), amount: v })
    setEditing(false)
  }

  return (
    <div
      style={{
        background: muted ? tokens.color.bg_card_muted : tokens.color.bg_card,
        borderRadius: tokens.radius.cardSm,
        padding: `${tokens.primitive.space[7]} ${tokens.primitive.space[8]}`,
        marginBottom: tokens.primitive.space[5],
        display: 'flex',
        alignItems: 'center',
        gap: tokens.primitive.space[6],
        boxShadow: muted ? 'none' : tokens.shadow.cardSubtle,
        border: `1.5px solid ${editing ? tokens.color.brand : muted ? tokens.color.border_subtle : tokens.color.fixed + '33'}`,
        opacity: muted ? 0.7 : 1,
      }}
    >
      <span style={{ fontSize: 24, filter: muted ? 'grayscale(1)' : 'none' }}>
        {categoryEmoji(fixed.category, customCategories)}
      </span>

      {editing ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: tokens.primitive.space[4] }}>
          <input
            autoFocus
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Descrição"
            style={editInputStyle()}
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Valor"
            style={editInputStyle()}
          />
          <div style={{ display: 'flex', gap: tokens.primitive.space[3] }}>
            <button onClick={save} style={editPrimaryBtn(tokens.color.fixed)}>Salvar</button>
            <button onClick={() => setEditing(false)} style={editSecondaryBtn()}>Cancelar</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: tokens.primitive.fontWeight.bold,
                fontSize: tokens.primitive.fontSize.lg,
                color: muted ? tokens.color.text_muted : tokens.color.text_heading,
                textDecoration: muted ? 'line-through' : 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {fixed.desc}
            </div>
            <div style={{ display: 'flex', gap: tokens.primitive.space[3], marginTop: 4, flexWrap: 'wrap' }}>
              <Tag
                label={fixed.scope === 'casal' ? '💑 Casal' : fixed.scope === 'A' ? `👤 ${nameA}` : `👤 ${nameB}`}
                color={fixed.scope === 'casal' ? tokens.color.brand : fixed.scope === 'A' ? tokens.color.personA : tokens.color.personB}
              />
              {fixed.frequency && fixed.frequency !== 'monthly' && (
                <Tag label={FIXED_FREQUENCY_LABEL[fixed.frequency]} color={tokens.color.fixed} />
              )}
              {fixed.dueDay && (
                <Tag label={`vence dia ${fixed.dueDay}`} color={tokens.color.fixed} />
              )}
              {fixed.paymentMethod && (
                <Tag label={paymentMethodLabel(fixed.paymentMethod) ?? ''} color={tokens.color.text_secondary} />
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div
              style={{
                fontFamily: tokens.primitive.fontFamily.display,
                fontWeight: tokens.primitive.fontWeight.black,
                fontSize: tokens.primitive.fontSize.xl,
                color: muted ? tokens.color.text_muted : tokens.color.fixed,
                whiteSpace: 'nowrap',
              }}
            >
              {formatBRL(fixed.amount)}
            </div>
            <div style={{ display: 'flex', gap: tokens.primitive.space[3], justifyContent: 'flex-end', marginTop: 4 }}>
              <button
                onClick={startEdit}
                style={{
                  background: tokens.color.bg_app,
                  color: tokens.color.text_secondary,
                  border: 'none',
                  borderRadius: tokens.primitive.radius.sm,
                  padding: `${tokens.primitive.space[2]} ${tokens.primitive.space[5]}`,
                  fontSize: tokens.primitive.fontSize.xs,
                  fontWeight: tokens.primitive.fontWeight.extrabold,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                ✏️
              </button>
              <button
                onClick={onToggle}
                style={{
                  background: muted ? tokens.color.fixed + '22' : tokens.color.bg_app,
                  color: muted ? tokens.color.fixed : tokens.color.text_secondary,
                  border: muted ? `1px solid ${tokens.color.fixed}44` : 'none',
                  borderRadius: tokens.primitive.radius.sm,
                  padding: `${tokens.primitive.space[2]} ${tokens.primitive.space[5]}`,
                  fontSize: tokens.primitive.fontSize.xs,
                  fontWeight: tokens.primitive.fontWeight.extrabold,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                {muted ? 'reativar' : 'pausar'}
              </button>
              <button
                onClick={onRemove}
                style={{
                  background: `${tokens.color.danger}14`,
                  border: `1px solid ${tokens.color.danger}55`,
                  color: tokens.color.danger,
                  fontSize: tokens.primitive.fontSize.xs,
                  fontWeight: tokens.primitive.fontWeight.bold,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  padding: '4px 10px',
                  borderRadius: 8,
                  letterSpacing: '0.02em',
                }}
              >
                remover
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ───────────────────────────────────────────────────────────────────────────────

function ParcelasView({
  nameA, nameB, installments, setInstallments, customCategories, onOpenAdd,
}: {
  nameA: string; nameB: string
  installments: Installment[]
  customCategories: CustomCategory[]
  setInstallments: React.Dispatch<React.SetStateAction<Installment[]>>
  onOpenAdd: () => void
}) {
  const active = installments.filter((i) => i.paidParcelas < i.totalParcelas)
  const done = installments.filter((i) => i.paidParcelas >= i.totalParcelas)
  const totalMes = active.reduce((s, i) => s + i.parcelaMensal, 0)
  const totalRestante = active.reduce((s, i) => s + i.parcelaMensal * (i.totalParcelas - i.paidParcelas), 0)

  if (installments.length === 0) {
    return (
      <EmptyState
        emoji="💳"
        title="Nenhum parcelado ainda"
        sub="Geladeira, sofá, viagem, TV..."
        ctaLabel="Adicionar parcelado"
        onClickCta={onOpenAdd}
      />
    )
  }

  function payOne(id: string) {
    setInstallments((prev) =>
      prev.map((i) => i.id === id && i.paidParcelas < i.totalParcelas ? { ...i, paidParcelas: i.paidParcelas + 1 } : i)
    )
  }
  function unpayOne(id: string) {
    setInstallments((prev) =>
      prev.map((i) => i.id === id && i.paidParcelas > 0 ? { ...i, paidParcelas: i.paidParcelas - 1 } : i)
    )
  }
  function remove(id: string) {
    setInstallments((prev) => prev.filter((i) => i.id !== id))
  }

  // Próxima data de quitação total
  const farthestEnd = active.reduce<Date | null>((acc, i) => {
    const start = new Date(i.startedAt)
    const remainingMonths = i.totalParcelas - i.paidParcelas
    const end = new Date(start.getFullYear(), start.getMonth() + remainingMonths, 1)
    if (!acc || end > acc) return end
    return acc
  }, null)
  const liberdadeLabel = farthestEnd
    ? farthestEnd.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '')
    : null

  return (
    <>
      {active.length > 0 && (
        <PurpleHero
          totalMes={totalMes}
          totalRestante={totalRestante}
          countActive={active.length}
          liberdadeLabel={liberdadeLabel}
        />
      )}

      {active.length > 0 && (
        <>
          <SectionTitle color={tokens.color.installment}>Em andamento ({active.length})</SectionTitle>
          {active.map((i) => (
            <InstallmentCard
              key={i.id}
              inst={i}
              nameA={nameA}
              nameB={nameB}
              customCategories={customCategories}
              onPay={() => payOne(i.id)}
              onUnpay={() => unpayOne(i.id)}
              onRemove={() => remove(i.id)}
              onUpdate={(patch) => setInstallments((prev) => prev.map((x) => x.id === i.id ? { ...x, ...patch } : x))}
            />
          ))}
        </>
      )}

      {done.length > 0 && (
        <>
          <SectionTitle color={tokens.color.success}>Quitados ({done.length})</SectionTitle>
          {done.map((i) => (
            <div
              key={i.id}
              style={{
                position: 'relative',
                background: tokens.color.bg_card,
                borderRadius: tokens.radius.cardSm,
                padding: `${tokens.primitive.space[7]} ${tokens.primitive.space[8]}`,
                marginBottom: tokens.primitive.space[5],
                display: 'flex',
                alignItems: 'center',
                gap: tokens.primitive.space[6],
                border: `1.5px solid ${tokens.color.border_subtle}`,
                opacity: 0.7,
                overflow: 'hidden',
              }}
            >
              {/* Stamp QUITADO */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 12, right: -28,
                  background: tokens.color.success,
                  color: '#fff',
                  fontFamily: tokens.primitive.fontFamily.display,
                  fontWeight: 800,
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  padding: '3px 32px',
                  transform: 'rotate(20deg)',
                  boxShadow: '0 2px 6px rgba(34,197,94,0.4)',
                }}
              >
                QUITADO
              </div>

              <span style={{ fontSize: 24, filter: 'grayscale(0.3)' }}>{categoryEmoji(i.category, customCategories)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: tokens.primitive.fontWeight.bold,
                    fontSize: tokens.primitive.fontSize.lg,
                    color: tokens.color.text_secondary,
                    textDecoration: 'line-through',
                  }}
                >
                  {i.desc}
                </div>
                <div
                  style={{
                    fontSize: tokens.primitive.fontSize.sm,
                    color: tokens.color.success,
                    fontWeight: tokens.primitive.fontWeight.semibold,
                    marginTop: 2,
                  }}
                >
                  {i.totalParcelas} parcelas • total {formatBRL(i.totalAmount)}
                </div>
              </div>
              <button
                onClick={() => remove(i.id)}
                style={{
                  background: 'none', border: 'none',
                  color: tokens.color.text_disabled,
                  cursor: 'pointer',
                  fontSize: tokens.primitive.fontSize.sm,
                  fontFamily: 'inherit',
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </>
      )}
    </>
  )
}

function InstallmentCard({
  inst, nameA, nameB, customCategories, onPay, onUnpay, onRemove, onUpdate,
}: {
  inst: Installment; nameA: string; nameB: string
  customCategories: CustomCategory[]
  onPay: () => void; onUnpay: () => void; onRemove: () => void
  onUpdate: (patch: Partial<Installment>) => void
}) {
  const pct = (inst.paidParcelas / inst.totalParcelas) * 100
  const remaining = inst.parcelaMensal * (inst.totalParcelas - inst.paidParcelas)

  const [editing, setEditing] = useState(false)
  const [desc, setDesc] = useState(inst.desc)
  const [totalAmount, setTotalAmount] = useState(String(inst.totalAmount))

  function startEdit() {
    setDesc(inst.desc)
    setTotalAmount(String(inst.totalAmount))
    setEditing(true)
  }
  function save() {
    const v = parseFloat(totalAmount.replace(',', '.'))
    if (!desc.trim() || !(v > 0)) return
    onUpdate({ desc: desc.trim(), totalAmount: v, parcelaMensal: v / inst.totalParcelas })
    setEditing(false)
  }

  return (
    <div
      style={{
        background: tokens.color.bg_card,
        borderRadius: tokens.primitive.radius['2xl'],
        padding: `${tokens.primitive.space[8]} ${tokens.primitive.space[10]}`,
        marginBottom: tokens.primitive.space[6],
        boxShadow: tokens.shadow.cardSubtle,
        border: `1.5px solid ${editing ? tokens.color.brand : tokens.color.installment + '33'}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.primitive.space[5], marginBottom: tokens.primitive.space[6] }}>
        <span style={{ fontSize: 26 }}>{categoryEmoji(inst.category, customCategories)}</span>
        {editing ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: tokens.primitive.space[4] }}>
            <input
              autoFocus
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Descrição"
              style={editInputStyle()}
            />
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Valor total"
              style={editInputStyle()}
            />
            <div style={{ fontSize: tokens.primitive.fontSize.xs, color: tokens.color.text_muted }}>
              {inst.totalParcelas}x de {formatBRL((parseFloat(totalAmount.replace(',', '.')) || 0) / inst.totalParcelas)}
            </div>
            <div style={{ display: 'flex', gap: tokens.primitive.space[3] }}>
              <button onClick={save} style={editPrimaryBtn(tokens.color.installment)}>Salvar</button>
              <button onClick={() => setEditing(false)} style={editSecondaryBtn()}>Cancelar</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: tokens.primitive.fontWeight.bold,
                  fontSize: tokens.primitive.fontSize.lg,
                  color: tokens.color.text_heading,
                }}
              >
                {inst.desc}
              </div>
              <div style={{ display: 'flex', gap: tokens.primitive.space[3], marginTop: 4, flexWrap: 'wrap' }}>
                <Tag
                  label={inst.scope === 'casal' ? '💑 Casal' : inst.scope === 'A' ? `👤 ${nameA}` : `👤 ${nameB}`}
                  color={inst.scope === 'casal' ? tokens.color.brand : inst.scope === 'A' ? tokens.color.personA : tokens.color.personB}
                />
                {inst.dueDay && (
                  <Tag label={`vence dia ${inst.dueDay}`} color={tokens.color.installment} />
                )}
                {inst.paymentMethod && (
                  <Tag label={paymentMethodLabel(inst.paymentMethod) ?? ''} color={tokens.color.text_secondary} />
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div
                style={{
                  fontFamily: tokens.primitive.fontFamily.display,
                  fontWeight: tokens.primitive.fontWeight.black,
                  fontSize: tokens.primitive.fontSize.xl,
                  color: tokens.color.installment,
                }}
              >
                {formatBRL(inst.parcelaMensal)}
              </div>
              <div style={{ fontSize: tokens.primitive.fontSize.xs, color: tokens.color.text_muted }}>
                por mês
              </div>
              <button
                onClick={startEdit}
                style={{
                  marginTop: tokens.primitive.space[3],
                  background: tokens.color.bg_app,
                  color: tokens.color.text_secondary,
                  border: 'none',
                  borderRadius: tokens.primitive.radius.sm,
                  padding: `${tokens.primitive.space[2]} ${tokens.primitive.space[5]}`,
                  fontSize: tokens.primitive.fontSize.xs,
                  fontWeight: tokens.primitive.fontWeight.extrabold,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                ✏️
              </button>
            </div>
          </>
        )}
      </div>

      {editing && null}

      <ProgressDots paid={inst.paidParcelas} total={inst.totalParcelas} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: tokens.primitive.space[3],
          marginTop: tokens.primitive.space[6],
          marginBottom: tokens.primitive.space[6],
        }}
      >
        <MiniStat label="Total" value={formatBRL(inst.totalAmount)} color={tokens.color.text_heading} />
        <MiniStat label="Faltam" value={`${inst.totalParcelas - inst.paidParcelas}x`} color={tokens.color.installment} />
        <MiniStat label="Restante" value={formatBRL(remaining)} color={tokens.color.brand} />
      </div>

      <div style={{ display: 'flex', gap: tokens.primitive.space[3] }}>
        <button
          onClick={onPay}
          style={{
            flex: 1,
            background: tokens.color.installment,
            color: tokens.color.text_onBrand,
            border: 'none',
            borderRadius: tokens.primitive.radius.md,
            padding: `${tokens.primitive.space[5]} 0`,
            fontWeight: tokens.primitive.fontWeight.extrabold,
            fontSize: tokens.primitive.fontSize.base,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          ✓ Pagar {inst.paidParcelas + 1}
        </button>
        {inst.paidParcelas > 0 && (
          <button
            onClick={onUnpay}
            style={{
              background: tokens.color.bg_card,
              color: tokens.color.text_secondary,
              border: `1.5px solid ${tokens.color.border_default}`,
              borderRadius: tokens.primitive.radius.md,
              padding: `${tokens.primitive.space[5]} ${tokens.primitive.space[7]}`,
              fontWeight: tokens.primitive.fontWeight.bold,
              fontSize: tokens.primitive.fontSize.base,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            ↩
          </button>
        )}
        <button
          onClick={onRemove}
          style={{
            background: `${tokens.color.danger}14`,
            color: tokens.color.danger,
            border: `1.5px solid ${tokens.color.danger}55`,
            borderRadius: tokens.primitive.radius.md,
            padding: `${tokens.primitive.space[5]} ${tokens.primitive.space[7]}`,
            fontWeight: tokens.primitive.fontWeight.bold,
            fontSize: tokens.primitive.fontSize.base,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          remover
        </button>
      </div>
    </div>
  )
}

// ───────────────────────────────────────────────────────────────────────────────

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        background: color + '11',
        border: `1.5px solid ${color}33`,
        borderRadius: tokens.primitive.radius.lg,
        padding: tokens.primitive.space[6],
      }}
    >
      <div
        style={{
          fontSize: tokens.primitive.fontSize.xs,
          color: tokens.color.text_secondary,
          marginBottom: tokens.primitive.space[2],
          fontWeight: tokens.primitive.fontWeight.semibold,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: tokens.primitive.fontFamily.display,
          fontWeight: tokens.primitive.fontWeight.black,
          fontSize: tokens.primitive.fontSize['3xl'],
          color,
        }}
      >
        {value}
      </div>
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        background: tokens.color.bg_app,
        borderRadius: tokens.primitive.radius.md,
        padding: tokens.primitive.space[5],
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: tokens.primitive.fontSize['2xs'],
          color: tokens.color.text_muted,
          fontWeight: tokens.primitive.fontWeight.semibold,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontWeight: tokens.primitive.fontWeight.extrabold,
          fontSize: tokens.primitive.fontSize.md,
          color,
          marginTop: 2,
        }}
      >
        {value}
      </div>
    </div>
  )
}

function SectionTitle({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div
      style={{
        fontWeight: tokens.primitive.fontWeight.extrabold,
        fontSize: tokens.primitive.fontSize.md,
        color,
        marginBottom: tokens.primitive.space[5],
        marginTop: tokens.primitive.space[6],
      }}
    >
      {children}
    </div>
  )
}

function ProgressDots({ paid, total }: { paid: number; total: number }) {
  // Compacta se total grande
  const maxDots = 18
  const showCompact = total > maxDots
  const dots = showCompact ? maxDots : total
  const paidDots = showCompact ? Math.round((paid / total) * dots) : paid
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 8,
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 12, color: tokens.color.text_secondary, fontWeight: 600 }}>
          {paid} de {total} parcelas
        </span>
        <span
          style={{
            fontSize: 12,
            color: tokens.color.installment,
            fontWeight: 800,
            fontFamily: tokens.primitive.fontFamily.display,
          }}
        >
          {Math.round((paid / total) * 100)}%
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${dots}, 1fr)`,
          gap: 4,
        }}
      >
        {Array.from({ length: dots }).map((_, i) => {
          const isPaid = i < paidDots
          const isNext = i === paidDots
          return (
            <div
              key={i}
              style={{
                height: 6,
                borderRadius: 999,
                background: isPaid
                  ? tokens.color.success
                  : isNext
                    ? tokens.color.installment
                    : tokens.color.border_subtle,
                transition: 'background 200ms cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          )
        })}
      </div>
      {showCompact && (
        <div style={{ fontSize: 10, color: tokens.color.text_muted, marginTop: 4, textAlign: 'right' }}>
          mostrando {dots} de {total}
        </div>
      )}
    </div>
  )
}

function PurpleHero({
  totalMes, totalRestante, countActive, liberdadeLabel,
}: {
  totalMes: number; totalRestante: number; countActive: number; liberdadeLabel: string | null
}) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 18,
        padding: '22px',
        background: 'linear-gradient(135deg, #2a1b5c 0%, #1a1a44 100%)',
        color: '#fff',
        borderRadius: 22,
        boxShadow: '0 12px 32px rgba(20,20,60,0.4)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: 260, height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(167,139,250,0.20) 0%, rgba(167,139,250,0) 70%)',
          right: -100, top: -120,
        }}
      />
      <div
        style={{
          position: 'relative', zIndex: 2,
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          color: 'rgba(255,255,255,0.55)',
          fontWeight: 600,
        }}
      >
        Em aberto · {countActive} parcelado{countActive === 1 ? '' : 's'}
      </div>
      <div
        style={{
          position: 'relative', zIndex: 2,
          fontSize: 32, fontWeight: 700,
          letterSpacing: '-0.02em',
          marginTop: 10, lineHeight: 1.05,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {formatBRL(totalRestante)}
      </div>
      {liberdadeLabel && (
        <div
          style={{
            position: 'relative', zIndex: 2,
            marginTop: 8,
            fontSize: 13,
            color: 'rgba(255,255,255,0.65)',
          }}
        >
          Quitação total prevista para <span style={{ color: '#fff', fontWeight: 600, textTransform: 'capitalize' }}>{liberdadeLabel}</span>
        </div>
      )}
      <div
        style={{
          position: 'relative', zIndex: 2,
          marginTop: 22,
          paddingTop: 16,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Este mês
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
            {formatBRL(totalMes)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Ativos
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}>
            {countActive}
          </div>
        </div>
      </div>
    </div>
  )
}

function editInputStyle(): React.CSSProperties {
  return {
    width: '100%',
    border: `1.5px solid ${tokens.color.border_default}`,
    borderRadius: tokens.primitive.radius.md,
    padding: `${tokens.primitive.space[5]} ${tokens.primitive.space[6]}`,
    fontSize: tokens.primitive.fontSize.md,
    fontFamily: 'inherit',
    outline: 'none',
    background: tokens.color.bg_card,
    color: tokens.color.text_heading,
    boxSizing: 'border-box',
  }
}

function editPrimaryBtn(color: string): React.CSSProperties {
  return {
    flex: 1,
    background: color,
    color: tokens.color.text_onBrand,
    border: 'none',
    borderRadius: tokens.primitive.radius.md,
    padding: `${tokens.primitive.space[4]} 0`,
    fontWeight: tokens.primitive.fontWeight.extrabold,
    fontSize: tokens.primitive.fontSize.base,
    fontFamily: 'inherit',
    cursor: 'pointer',
  }
}

function editSecondaryBtn(): React.CSSProperties {
  return {
    background: 'transparent',
    color: tokens.color.text_secondary,
    border: `1.5px solid ${tokens.color.border_default}`,
    borderRadius: tokens.primitive.radius.md,
    padding: `${tokens.primitive.space[4]} ${tokens.primitive.space[7]}`,
    fontWeight: tokens.primitive.fontWeight.bold,
    fontSize: tokens.primitive.fontSize.base,
    fontFamily: 'inherit',
    cursor: 'pointer',
  }
}

function EmptyState({
  title, sub, ctaLabel, onClickCta,
}: {
  emoji?: string; title: string; sub: string; ctaLabel: string; onClickCta: () => void
}) {
  return (
    <div style={{ textAlign: 'center', padding: `${tokens.primitive.space[20]} 0` }}>
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
          marginBottom: tokens.primitive.space[8],
        }}
      >
        {sub}
      </div>
      <button
        onClick={onClickCta}
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
        }}
      >
        {ctaLabel}
      </button>
    </div>
  )
}
