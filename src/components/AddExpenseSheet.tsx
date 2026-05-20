'use client'

import { useEffect, useState } from 'react'
import { tokens } from '@/lib/tokens'
import { newId } from '@/lib/id'
import { currentMonthKey } from '@/lib/format'
import { allCategoryNames, categoryEmoji, EMOJI_PICKER_OPTIONS } from '@/lib/categories'
import { PAYMENT_METHODS } from './constants'
import type { Expense, FixedCost, Installment, PaidBy, Scope, ExpenseKind, CustomCategory, PaymentMethod, EditTarget } from './types'
import type { FixedFrequency } from '@/lib/fixed'

interface Props {
  open: boolean
  onClose: () => void
  nameA: string
  nameB: string
  monthKey: string
  customCategories: CustomCategory[]
  /** id do usuário logado — usado pra setar createdBy em novas entidades */
  currentUserId: string
  /** se passado, abre em modo edit. Aceita os 3 tipos. */
  editing?: EditTarget | null
  onAddExpense: (e: Expense) => void
  onAddFixed: (f: FixedCost) => void
  onAddInstallment: (i: Installment) => void
  onAddCategory: (name: string, emoji: string) => CustomCategory
  /** chamado quando o user troca o tipo durante edição (ex: fixo → avulso) */
  onRemoveExpense?: (id: string) => void
  onRemoveFixed?: (id: string) => void
  onRemoveInstallment?: (id: string) => void
}

export default function AddExpenseSheet({
  open, onClose, nameA, nameB, monthKey, customCategories, currentUserId,
  editing,
  onAddExpense, onAddFixed, onAddInstallment, onAddCategory,
  onRemoveExpense, onRemoveFixed, onRemoveInstallment,
}: Props) {
  const isEditing = !!editing
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatEmoji, setNewCatEmoji] = useState('📦')
  const [kind, setKind] = useState<ExpenseKind>('avulso')
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [scope, setScope] = useState<Scope>('casal')
  const [paidBy, setPaidBy] = useState<PaidBy>('A')
  const [category, setCategory] = useState('Mercado')
  const [parcelas, setParcelas] = useState('12')
  const [parcelasPagas, setParcelasPagas] = useState('0')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('')
  const [dueDay, setDueDay] = useState('')
  const [frequency, setFrequency] = useState<FixedFrequency>('monthly')
  const [error, setError] = useState<string | null>(null)
  const [justSavedValue, setJustSavedValue] = useState<number | null>(null)

  useEffect(() => {
    if (open) {
      setError(null)
      if (editing) {
        if (editing.kind === 'avulso') {
          const e = editing.expense
          setKind('avulso')
          setDesc(e.desc); setAmount(String(e.amount).replace('.', ','))
          setScope(e.scope); setPaidBy(e.paidBy); setCategory(e.category)
          setPaymentMethod(e.paymentMethod || '')
          setParcelas('12'); setParcelasPagas('0'); setDueDay('')
          setFrequency('monthly')
        } else if (editing.kind === 'fixo') {
          const f = editing.fixed
          setKind('fixo')
          setDesc(f.desc); setAmount(String(f.amount).replace('.', ','))
          setScope(f.scope); setPaidBy(f.paidBy); setCategory(f.category)
          setPaymentMethod(f.paymentMethod || '')
          setDueDay(f.dueDay ? String(f.dueDay) : '')
          setFrequency(f.frequency ?? 'monthly')
          setParcelas('12'); setParcelasPagas('0')
        } else if (editing.kind === 'parcela') {
          const i = editing.installment
          setKind('parcela')
          setDesc(i.desc); setAmount(String(i.totalAmount).replace('.', ','))
          setScope(i.scope); setPaidBy(i.paidBy); setCategory(i.category)
          setPaymentMethod(i.paymentMethod || '')
          setDueDay(i.dueDay ? String(i.dueDay) : '')
          setParcelas(String(i.totalParcelas))
          setParcelasPagas(String(i.paidParcelas))
          setFrequency('monthly')
        }
      } else {
        setKind('avulso')
        setDesc(''); setAmount('')
        setParcelas('12'); setParcelasPagas('0')
        setPaymentMethod(''); setDueDay(''); setFrequency('monthly')
      }
      setJustSavedValue(null)
      setCreatingCategory(false)
      setNewCatName('')
      setNewCatEmoji('📦')
    }
  }, [open, editing])

  if (!open) return null

  const value = parseFloat(amount.replace(',', '.'))
  const canSubmit = desc.trim().length > 0 && value > 0
  const previewParcela = kind === 'parcela' && value > 0 && parseInt(parcelas) > 0
    ? value / parseInt(parcelas)
    : null

  const editingExpense = editing?.kind === 'avulso' ? editing.expense : null
  const editingFixed = editing?.kind === 'fixo' ? editing.fixed : null
  const editingInstallment = editing?.kind === 'parcela' ? editing.installment : null
  const editingTarget = editingExpense || editingFixed || editingInstallment
  const editingCreatedBy = editingTarget?.createdBy
  const isEditingOther = !!editing && !!editingCreatedBy && editingCreatedBy !== currentUserId

  function submit() {
    if (!desc.trim()) return setError('Falta a descrição')
    if (!(value > 0)) return setError('Valor tem que ser maior que zero')

    const pm = paymentMethod || undefined
    const dd = parseInt(dueDay)
    const dueDayClamped = Number.isFinite(dd) && dd >= 1 && dd <= 31 ? dd : undefined

    // Se mudou de tipo durante edit, deleta o antigo antes de inserir o novo
    const typeChanged = editing && editing.kind !== kind
    if (typeChanged) {
      if (editing!.kind === 'avulso') onRemoveExpense?.(editing!.expense.id)
      else if (editing!.kind === 'fixo') onRemoveFixed?.(editing!.fixed.id)
      else if (editing!.kind === 'parcela') onRemoveInstallment?.(editing!.installment.id)
    }
    // Se manteve tipo, preserva id; senão gera novo
    const sameTypeId =
      editing && editing.kind === kind
        ? editing.kind === 'avulso'
          ? editing.expense.id
          : editing.kind === 'fixo'
          ? editing.fixed.id
          : editing.installment.id
        : null

    if (kind === 'avulso') {
      const preservedCreatedAt = editing?.kind === 'avulso' ? editing.expense.createdAt : Date.now()
      const preservedMonthKey = editing?.kind === 'avulso' ? editing.expense.monthKey : (monthKey || currentMonthKey())
      const preservedCreatedBy = editing?.kind === 'avulso' ? editing.expense.createdBy : currentUserId
      onAddExpense({
        id: sameTypeId ?? newId(),
        desc: desc.trim(), amount: value,
        paidBy, scope, category,
        createdAt: preservedCreatedAt,
        monthKey: preservedMonthKey,
        paymentMethod: pm,
        createdBy: preservedCreatedBy,
      })
    } else if (kind === 'fixo') {
      const preservedCreatedAt = editing?.kind === 'fixo' ? editing.fixed.createdAt : Date.now()
      const preservedActive = editing?.kind === 'fixo' ? editing.fixed.active : true
      const preservedCreatedBy = editing?.kind === 'fixo' ? editing.fixed.createdBy : currentUserId
      onAddFixed({
        id: sameTypeId ?? newId(),
        desc: desc.trim(), amount: value,
        paidBy, scope, category,
        active: preservedActive,
        createdAt: preservedCreatedAt,
        paymentMethod: pm,
        dueDay: dueDayClamped,
        frequency,
        createdBy: preservedCreatedBy,
      })
    } else {
      const total = parseInt(parcelas)
      const paid = Math.min(parseInt(parcelasPagas) || 0, total - 1)
      const preservedStartedAt = editing?.kind === 'parcela' ? editing.installment.startedAt : Date.now()
      const preservedCreatedBy = editing?.kind === 'parcela' ? editing.installment.createdBy : currentUserId
      onAddInstallment({
        id: sameTypeId ?? newId(),
        desc: desc.trim(),
        totalAmount: value,
        totalParcelas: total,
        paidParcelas: paid,
        parcelaMensal: value / total,
        paidBy, scope, category,
        startedAt: preservedStartedAt,
        paymentMethod: pm,
        dueDay: dueDayClamped,
        createdBy: preservedCreatedBy,
      })
    }
    // Pra cross-user edit, parent já mostra toast "Pedido enviado pra aprovação";
    // então fecha direto sem o splash "Adicionado ✓".
    if (isEditingOther) {
      onClose()
      return
    }
    setJustSavedValue(value)
    setTimeout(() => onClose(), 950)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: tokens.color.bg_overlay,
        zIndex: tokens.primitive.zIndex.modal,
        display: 'flex', alignItems: 'flex-end',
        animation: 'cna-sheet-backdrop 200ms cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: tokens.color.bg_card,
          width: '100%',
          maxWidth: 480,
          margin: '0 auto',
          borderTopLeftRadius: tokens.primitive.radius['3xl'],
          borderTopRightRadius: tokens.primitive.radius['3xl'],
          padding: `${tokens.primitive.space[10]} ${tokens.primitive.space[10]} ${tokens.primitive.space[20]}`,
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
          animation: 'cna-sheet-slide-up 280ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          style={{
            width: 40, height: 4, background: tokens.color.border_default,
            borderRadius: tokens.primitive.radius.pill,
            margin: `0 auto ${tokens.primitive.space[10]}`,
          }}
        />

        {isEditingOther && justSavedValue == null && (
          <div style={{
            fontSize: 12,
            color: tokens.color.text_muted,
            padding: '10px 16px',
            background: 'rgba(245,124,0,0.10)',
            borderBottom: `1px solid rgba(245,124,0,0.30)`,
            borderRadius: 8,
            marginBottom: tokens.primitive.space[8],
            lineHeight: 1.4,
          }}>
            ⚠️ Esse gasto foi registrado pelo seu parceiro. Mudanças materiais (valor, categoria, scope, mês) precisam da aprovação dele(a).
          </div>
        )}

        {justSavedValue != null && (
          <div
            style={{
              textAlign: 'center',
              padding: `${tokens.primitive.space[16]} ${tokens.primitive.space[8]}`,
            }}
          >
            <div
              style={{
                width: 64, height: 64,
                margin: '0 auto 18px',
                borderRadius: '50%',
                background: tokens.color.success_bg,
                color: tokens.color.success,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'cna-success-pop 520ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: tokens.color.text_heading,
                letterSpacing: '-0.01em',
              }}
            >
              Adicionado
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 14,
                color: tokens.color.text_muted,
              }}
            >
              {kind === 'avulso' && 'Gasto registrado'}
              {kind === 'fixo' && 'Fixo cadastrado'}
              {kind === 'parcela' && 'Parcelado cadastrado'}
              {' • '}
              <span
                style={{
                  color: tokens.color.text_body,
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(justSavedValue)}
              </span>
            </div>
          </div>
        )}

        {justSavedValue == null && (
        <>
        <h2
          style={{
            ...tokens.text.h1,
            color: tokens.color.text_heading,
            marginBottom: tokens.primitive.space[10],
          }}
        >
          Novo gasto
        </h2>

        {/* Valor — hero */}
        <div style={{ textAlign: 'center', marginBottom: tokens.primitive.space[10] }}>
          <div
            style={{
              ...tokens.text.label,
              color: tokens.color.text_muted,
              marginBottom: tokens.primitive.space[4],
            }}
          >
            Valor
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <span
              style={{
                fontFamily: tokens.primitive.fontFamily.display,
                fontSize: tokens.primitive.fontSize['5xl'],
                fontWeight: tokens.primitive.fontWeight.bold,
                color: tokens.color.text_muted,
              }}
            >
              R$
            </span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(null) }}
              autoFocus
              style={{
                fontFamily: tokens.primitive.fontFamily.display,
                fontSize: tokens.primitive.fontSize.display,
                fontWeight: tokens.primitive.fontWeight.black,
                color: tokens.color.brand,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: 200,
                textAlign: 'center',
              }}
            />
          </div>
          {previewParcela != null && (
            <div
              style={{
                marginTop: tokens.primitive.space[4],
                fontSize: tokens.primitive.fontSize.base,
                color: tokens.color.installment,
                fontWeight: tokens.primitive.fontWeight.bold,
              }}
            >
              💡 {parcelas}x de R$ {previewParcela.toFixed(2).replace('.', ',')}
            </div>
          )}
        </div>

        {/* Descrição */}
        <input
          placeholder="O que foi?"
          value={desc}
          onChange={(e) => { setDesc(e.target.value); setError(null) }}
          style={{
            width: '100%',
            border: `${tokens.component.input.borderWidth} solid ${tokens.color.border_default}`,
            borderRadius: tokens.component.input.radius,
            padding: `${tokens.component.input.paddingY} ${tokens.component.input.paddingX}`,
            fontSize: tokens.primitive.fontSize.lg,
            fontFamily: 'inherit',
            outline: 'none',
            marginBottom: tokens.primitive.space[8],
            background: tokens.color.bg_card,
            color: tokens.color.text_heading,
            boxSizing: 'border-box',
          }}
        />

        {/* Tipo segmented */}
        <SegmentedField
          label="Tipo"
          value={kind}
          onChange={(v) => setKind(v as ExpenseKind)}
          options={[
            { v: 'avulso', l: '💸 Avulso' },
            { v: 'fixo', l: '📌 Fixo' },
            { v: 'parcela', l: '💳 Parcela' },
          ]}
        />

        {/* Escopo */}
        <SegmentedField
          label="É de quem?"
          value={scope}
          onChange={(v) => setScope(v as Scope)}
          options={[
            { v: 'casal', l: '💑 Casal' },
            { v: 'A', l: `👤 ${nameA}` },
            { v: 'B', l: `👤 ${nameB}` },
          ]}
        />

        {/* Quem pagou (só se for casal — escopo pessoal já implica pagador) */}
        {scope === 'casal' && (
          <SegmentedField
            label="Quem pagou?"
            value={paidBy}
            onChange={(v) => setPaidBy(v as PaidBy)}
            options={[
              { v: 'A', l: nameA },
              { v: 'B', l: nameB },
            ]}
          />
        )}

        {/* Parcelas extra fields */}
        {kind === 'parcela' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.primitive.space[5], marginBottom: tokens.primitive.space[8] }}>
            <div>
              <FieldLabel text="Nº parcelas" />
              <NumInput value={parcelas} onChange={setParcelas} />
            </div>
            <div>
              <FieldLabel text="Já pagas" />
              <NumInput value={parcelasPagas} onChange={setParcelasPagas} />
            </div>
          </div>
        )}

        {/* Forma de pagamento */}
        <FieldLabel text="Forma de pagamento" />
        <div
          style={{
            display: 'flex',
            gap: tokens.primitive.space[3],
            flexWrap: 'wrap',
            marginBottom: tokens.primitive.space[8],
          }}
        >
          {PAYMENT_METHODS.map((m) => {
            const active = paymentMethod === m.id
            return (
              <button
                key={m.id}
                onClick={() => setPaymentMethod(active ? '' : m.id)}
                style={{
                  background: active ? tokens.color.brand : tokens.color.bg_card,
                  color: active ? tokens.color.text_onBrand : tokens.color.text_body,
                  border: `1.5px solid ${active ? tokens.color.brand : tokens.color.border_default}`,
                  borderRadius: tokens.primitive.radius.pill,
                  padding: `${tokens.primitive.space[3]} ${tokens.primitive.space[6]}`,
                  fontSize: tokens.primitive.fontSize.base,
                  fontWeight: tokens.primitive.fontWeight.semibold,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: tokens.motion.interaction,
                }}
              >
                {m.emoji} {m.label}
              </button>
            )
          })}
        </div>

        {/* Frequência (apenas fixo) */}
        {kind === 'fixo' && (
          <div style={{ marginBottom: tokens.primitive.space[8] }}>
            <FieldLabel text="Frequência" />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {([
                { id: 'monthly', label: 'Mensal' },
                { id: 'bimonthly', label: 'Bimestral' },
                { id: 'quarterly', label: 'Trimestral' },
                { id: 'semiannual', label: 'Semestral' },
                { id: 'annual', label: 'Anual' },
              ] as { id: FixedFrequency; label: string }[]).map((f) => {
                const active = frequency === f.id
                return (
                  <button
                    key={f.id}
                    onClick={() => setFrequency(f.id)}
                    style={{
                      background: active ? tokens.color.brand : tokens.color.bg_card,
                      color: active ? tokens.color.text_onBrand : tokens.color.text_body,
                      border: `1.5px solid ${active ? tokens.color.brand : tokens.color.border_default}`,
                      borderRadius: tokens.primitive.radius.pill,
                      padding: `${tokens.primitive.space[3]} ${tokens.primitive.space[6]}`,
                      fontSize: tokens.primitive.fontSize.base,
                      fontWeight: tokens.primitive.fontWeight.semibold,
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                    }}
                  >
                    {f.label}
                  </button>
                )
              })}
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: tokens.color.text_muted }}>
              Tipo Netflix mensal → Mensal. Tipo iCloud anual → Anual.
            </div>
          </div>
        )}

        {/* Dia de vencimento (apenas fixo/parcela) */}
        {(kind === 'fixo' || kind === 'parcela') && (
          <div style={{ marginBottom: tokens.primitive.space[8] }}>
            <FieldLabel text="Dia do vencimento" />
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.primitive.space[5] }}>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={31}
                placeholder="ex: 5"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                style={{
                  width: 110,
                  border: `1.5px solid ${tokens.color.border_default}`,
                  borderRadius: tokens.primitive.radius.md,
                  padding: '10px 12px',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                  background: tokens.color.bg_card,
                  color: tokens.color.text_heading,
                  boxSizing: 'border-box',
                  textAlign: 'center',
                }}
              />
              <span style={{ fontSize: 13, color: tokens.color.text_muted }}>
                dia do mês (1-31). Deixe vazio se não tem data fixa.
              </span>
            </div>
          </div>
        )}

        {/* Categoria */}
        <FieldLabel text="Categoria" />
        <div
          style={{
            display: 'flex', gap: tokens.primitive.space[4], flexWrap: 'wrap',
            marginBottom: tokens.primitive.space[10],
          }}
        >
          {allCategoryNames(customCategories).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{
                background: category === c ? tokens.color.brand : tokens.color.bg_card,
                color: category === c ? tokens.color.text_onBrand : tokens.color.text_body,
                border: `1.5px solid ${category === c ? tokens.color.brand : tokens.color.border_default}`,
                borderRadius: tokens.primitive.radius.pill,
                padding: `${tokens.primitive.space[3]} ${tokens.primitive.space[6]}`,
                fontSize: tokens.primitive.fontSize.base,
                fontWeight: tokens.primitive.fontWeight.semibold,
                fontFamily: 'inherit',
                cursor: 'pointer',
                transition: tokens.motion.interaction,
              }}
            >
              {categoryEmoji(c, customCategories)} {c}
            </button>
          ))}
          <button
            onClick={() => setCreatingCategory(true)}
            style={{
              background: 'transparent',
              color: tokens.color.text_secondary,
              border: `1.5px dashed ${tokens.color.border_default}`,
              borderRadius: tokens.primitive.radius.pill,
              padding: `${tokens.primitive.space[3]} ${tokens.primitive.space[6]}`,
              fontSize: tokens.primitive.fontSize.base,
              fontWeight: tokens.primitive.fontWeight.semibold,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            + Nova
          </button>
        </div>

        {creatingCategory && (
          <div
            style={{
              marginBottom: tokens.primitive.space[10],
              padding: tokens.primitive.space[8],
              background: tokens.color.bg_app,
              borderRadius: tokens.primitive.radius.lg,
              border: `1px solid ${tokens.color.border_subtle}`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: tokens.color.text_heading,
                marginBottom: 10,
              }}
            >
              Nova categoria
            </div>
            <input
              autoFocus
              placeholder="Nome (ex: Pet, Hobby...)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              style={{
                width: '100%',
                border: `1.5px solid ${tokens.color.border_default}`,
                borderRadius: tokens.primitive.radius.md,
                padding: '10px 12px',
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
                background: tokens.color.bg_card,
                color: tokens.color.text_heading,
                boxSizing: 'border-box',
                marginBottom: 10,
              }}
            />
            <div
              style={{
                fontSize: 11,
                color: tokens.color.text_muted,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8,
              }}
            >
              Escolha um ícone
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: 6,
                marginBottom: 12,
              }}
            >
              {EMOJI_PICKER_OPTIONS.map((e) => {
                const active = newCatEmoji === e
                return (
                  <button
                    key={e}
                    onClick={() => setNewCatEmoji(e)}
                    style={{
                      background: active ? tokens.color.brand : tokens.color.bg_card,
                      border: `1.5px solid ${active ? tokens.color.brand : tokens.color.border_subtle}`,
                      borderRadius: 8,
                      padding: '6px 0',
                      fontSize: 18,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {e}
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  const name = newCatName.trim()
                  if (!name) return
                  const cat = onAddCategory(name, newCatEmoji)
                  setCategory(cat.name)
                  setCreatingCategory(false)
                  setNewCatName('')
                  setNewCatEmoji('📦')
                }}
                disabled={!newCatName.trim()}
                style={{
                  flex: 1,
                  background: newCatName.trim() ? tokens.color.brand : tokens.color.border_default,
                  color: tokens.color.text_onBrand,
                  border: 'none',
                  borderRadius: tokens.primitive.radius.md,
                  padding: '10px 0',
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  cursor: newCatName.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Criar
              </button>
              <button
                onClick={() => {
                  setCreatingCategory(false)
                  setNewCatName('')
                  setNewCatEmoji('📦')
                }}
                style={{
                  background: 'transparent',
                  color: tokens.color.text_secondary,
                  border: `1.5px solid ${tokens.color.border_default}`,
                  borderRadius: tokens.primitive.radius.md,
                  padding: '10px 16px',
                  fontWeight: 600,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              background: tokens.color.danger_bg,
              color: tokens.color.danger,
              border: `1.5px solid ${tokens.color.danger}33`,
              borderRadius: tokens.primitive.radius.md,
              padding: tokens.primitive.space[6],
              marginBottom: tokens.primitive.space[6],
              fontSize: tokens.primitive.fontSize.md,
              fontWeight: tokens.primitive.fontWeight.semibold,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: tokens.primitive.space[6] }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: 'transparent',
              color: tokens.color.text_secondary,
              border: `1.5px solid ${tokens.color.border_default}`,
              borderRadius: tokens.component.button.radius.md,
              padding: `${tokens.primitive.space[6]} 0`,
              fontWeight: tokens.primitive.fontWeight.bold,
              fontSize: tokens.primitive.fontSize.lg,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          {isEditing && editing && (
            <button
              onClick={() => {
                const confirmMsg = isEditingOther
                  ? 'Pedir remoção desse lançamento ao parceiro?'
                  : 'Excluir este lançamento?'
                if (typeof window !== 'undefined' && !window.confirm(confirmMsg)) return
                if (editing.kind === 'avulso') onRemoveExpense?.(editing.expense.id)
                else if (editing.kind === 'fixo') onRemoveFixed?.(editing.fixed.id)
                else if (editing.kind === 'parcela') onRemoveInstallment?.(editing.installment.id)
                onClose()
              }}
              style={{
                flex: 1,
                background: isEditingOther ? 'rgba(245,124,0,0.14)' : `${tokens.color.danger}14`,
                color: isEditingOther ? '#f57c00' : tokens.color.danger,
                border: `1.5px solid ${isEditingOther ? 'rgba(245,124,0,0.55)' : `${tokens.color.danger}55`}`,
                borderRadius: tokens.component.button.radius.md,
                padding: `${tokens.primitive.space[6]} 0`,
                fontWeight: tokens.primitive.fontWeight.extrabold,
                fontSize: tokens.primitive.fontSize.lg,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              {isEditingOther ? 'Pedir remover' : 'Excluir'}
            </button>
          )}
          <button
            onClick={submit}
            disabled={!canSubmit}
            style={{
              flex: 2,
              background: canSubmit ? tokens.color.brand : tokens.color.border_default,
              color: tokens.color.text_onBrand,
              border: 'none',
              borderRadius: tokens.component.button.radius.md,
              padding: `${tokens.primitive.space[6]} 0`,
              fontWeight: tokens.primitive.fontWeight.extrabold,
              fontSize: tokens.primitive.fontSize.lg,
              fontFamily: 'inherit',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: tokens.motion.interaction,
            }}
          >
            {isEditingOther ? 'Pedir alteração' : isEditing ? 'Salvar ✓' : 'Adicionar ✓'}
          </button>
        </div>
        </>
        )}
      </div>
    </div>
  )
}

function FieldLabel({ text }: { text: string }) {
  return (
    <div
      style={{
        ...tokens.text.label,
        color: tokens.color.text_muted,
        marginBottom: tokens.primitive.space[4],
      }}
    >
      {text}
    </div>
  )
}

function SegmentedField({
  label, value, onChange, options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { v: string; l: string }[]
}) {
  return (
    <div style={{ marginBottom: tokens.primitive.space[8] }}>
      <FieldLabel text={label} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${options.length}, 1fr)`,
          gap: tokens.primitive.space[3],
          background: tokens.color.bg_app,
          padding: tokens.primitive.space[2],
          borderRadius: tokens.primitive.radius.md,
        }}
      >
        {options.map((o) => {
          const active = value === o.v
          return (
            <button
              key={o.v}
              onClick={() => onChange(o.v)}
              style={{
                background: active ? tokens.color.bg_card : 'transparent',
                color: active ? tokens.color.text_heading : tokens.color.text_secondary,
                border: 'none',
                borderRadius: tokens.primitive.radius.sm,
                padding: `${tokens.primitive.space[5]} 0`,
                fontWeight: active ? tokens.primitive.fontWeight.extrabold : tokens.primitive.fontWeight.semibold,
                fontSize: tokens.primitive.fontSize.md,
                fontFamily: 'inherit',
                cursor: 'pointer',
                boxShadow: active ? tokens.shadow.cardSubtle : 'none',
                transition: tokens.motion.interaction,
              }}
            >
              {o.l}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function NumInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        border: `${tokens.component.input.borderWidth} solid ${tokens.color.border_default}`,
        borderRadius: tokens.component.input.radius,
        padding: `${tokens.component.input.paddingY} ${tokens.component.input.paddingX}`,
        fontSize: tokens.component.input.fontSize,
        fontFamily: 'inherit',
        outline: 'none',
        background: tokens.color.bg_card,
        color: tokens.color.text_heading,
        boxSizing: 'border-box',
      }}
    />
  )
}
