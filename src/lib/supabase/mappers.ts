/**
 * Conversores camelCase (local types) ↔ snake_case (Postgres rows).
 * Cada entidade tem um par toRow / fromRow. `coupleId` é injetado em toRow.
 */
import type {
  Expense, Installment, FixedCost, Goal, ClosedMonth, CustomCategory,
} from '@/components/types'
import type {
  ExpenseRow, InstallmentRow, FixedCostRow, GoalRow, ClosedMonthRow, CustomCategoryRow,
} from './database.types'

const tsToIso = (ts: number) => new Date(ts).toISOString()
const isoToTs = (iso: string) => new Date(iso).getTime()

// ── EXPENSE ────────────────────────────────────────────────────────────────────
export function expenseFromRow(r: ExpenseRow): Expense {
  return {
    id: r.id,
    desc: r.desc_text,
    amount: Number(r.amount),
    paidBy: r.paid_by,
    scope: r.scope,
    category: r.category,
    createdAt: isoToTs(r.created_at),
    monthKey: r.month_key,
    paymentMethod: r.payment_method ?? undefined,
  }
}
export function expenseToRow(
  e: Expense,
  coupleId: string,
  userId: string | null,
): Omit<ExpenseRow, 'updated_at'> {
  return {
    id: e.id,
    couple_id: coupleId,
    created_by: userId,
    desc_text: e.desc,
    amount: e.amount,
    paid_by: e.paidBy,
    scope: e.scope,
    category: e.category,
    payment_method: e.paymentMethod ?? null,
    month_key: e.monthKey,
    created_at: tsToIso(e.createdAt),
  }
}

// ── FIXED COST ─────────────────────────────────────────────────────────────────
export function fixedFromRow(r: FixedCostRow): FixedCost {
  return {
    id: r.id,
    desc: r.desc_text,
    amount: Number(r.amount),
    paidBy: r.paid_by,
    scope: r.scope,
    category: r.category,
    active: r.active,
    createdAt: isoToTs(r.created_at),
    paymentMethod: r.payment_method ?? undefined,
    dueDay: r.due_day ?? undefined,
    frequency: r.frequency ?? 'monthly',
  }
}
export function fixedToRow(
  f: FixedCost,
  coupleId: string,
  userId: string | null,
): Omit<FixedCostRow, 'updated_at'> {
  return {
    id: f.id,
    couple_id: coupleId,
    created_by: userId,
    desc_text: f.desc,
    amount: f.amount,
    paid_by: f.paidBy,
    scope: f.scope,
    category: f.category,
    payment_method: f.paymentMethod ?? null,
    due_day: f.dueDay ?? null,
    active: f.active,
    frequency: f.frequency ?? 'monthly',
    created_at: tsToIso(f.createdAt),
  }
}

// ── INSTALLMENT ────────────────────────────────────────────────────────────────
export function installmentFromRow(r: InstallmentRow): Installment {
  return {
    id: r.id,
    desc: r.desc_text,
    totalAmount: Number(r.total_amount),
    totalParcelas: r.total_parcelas,
    paidParcelas: r.paid_parcelas,
    parcelaMensal: Number(r.parcela_mensal),
    paidBy: r.paid_by,
    scope: r.scope,
    category: r.category,
    startedAt: isoToTs(r.started_at),
    paymentMethod: r.payment_method ?? undefined,
    dueDay: r.due_day ?? undefined,
  }
}
export function installmentToRow(
  i: Installment,
  coupleId: string,
  userId: string | null,
): Omit<InstallmentRow, 'created_at' | 'updated_at'> {
  return {
    id: i.id,
    couple_id: coupleId,
    created_by: userId,
    desc_text: i.desc,
    total_amount: i.totalAmount,
    total_parcelas: i.totalParcelas,
    paid_parcelas: i.paidParcelas,
    parcela_mensal: i.parcelaMensal,
    paid_by: i.paidBy,
    scope: i.scope,
    category: i.category,
    payment_method: i.paymentMethod ?? null,
    due_day: i.dueDay ?? null,
    started_at: tsToIso(i.startedAt),
  }
}

// ── GOAL ───────────────────────────────────────────────────────────────────────
export function goalFromRow(r: GoalRow): Goal {
  return {
    id: r.id,
    name: r.name,
    target: Number(r.target),
    saved: Number(r.saved),
    createdAt: isoToTs(r.created_at),
  }
}
export function goalToRow(
  g: Goal,
  coupleId: string,
  userId: string | null,
): Omit<GoalRow, 'updated_at'> {
  return {
    id: g.id,
    couple_id: coupleId,
    created_by: userId,
    name: g.name,
    target: g.target,
    saved: g.saved,
    created_at: tsToIso(g.createdAt),
  }
}

// ── CLOSED MONTH ───────────────────────────────────────────────────────────────
export function closedMonthFromRow(r: ClosedMonthRow): ClosedMonth {
  return {
    monthKey: r.month_key,
    closedAt: isoToTs(r.closed_at),
    totals: r.totals,
  }
}
export function closedMonthToRow(
  m: ClosedMonth,
  coupleId: string,
): ClosedMonthRow {
  return {
    couple_id: coupleId,
    month_key: m.monthKey,
    closed_at: tsToIso(m.closedAt),
    totals: m.totals,
  }
}

// ── CUSTOM CATEGORY ────────────────────────────────────────────────────────────
export function categoryFromRow(r: CustomCategoryRow): CustomCategory {
  return {
    id: r.id,
    name: r.name,
    emoji: r.emoji,
    createdAt: isoToTs(r.created_at),
  }
}
export function categoryToRow(
  c: CustomCategory,
  coupleId: string,
): Omit<CustomCategoryRow, 'created_at'> & { created_at: string } {
  return {
    id: c.id,
    couple_id: coupleId,
    name: c.name,
    emoji: c.emoji,
    created_at: tsToIso(c.createdAt),
  }
}
