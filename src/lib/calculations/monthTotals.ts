/**
 * Cálculo do mês no SERVIDOR — espelha exatamente o que o app mostra em TabMes:
 * feed = avulsos do mês + fixos ativos que caem no mês + parcelas ativas.
 * Receita (type='income') nunca entra no rateio nem nos totais de gasto.
 *
 * Puro e server-safe (só importa libs puras). Recebe linhas do banco direto.
 */
import { fixedAppearsInMonth } from '@/lib/fixed'
import { fairShareAByCategory } from '@/lib/split'
import { parseMonthKey } from '@/lib/format'
import type {
  ExpenseRow,
  FixedCostRow,
  InstallmentRow,
  Method,
  CategorySplit,
  PaidBy,
} from '@/lib/supabase/database.types'

export interface MonthInput {
  monthKey: string
  expenses: ExpenseRow[]
  fixedCosts: FixedCostRow[]
  installments: InstallmentRow[]
  incomeA: string
  incomeB: string
  method: Method
  categorySplit: CategorySplit | null
}

export interface MonthTotals {
  totalMes: number
  totalCasal: number
  totalCasalA: number
  totalCasalB: number
  totalPessoalA: number
  totalPessoalB: number
  totalA: number // saiu do bolso de A (casalA + pessoalA)
  totalB: number
  totalEntrou: number
  totalSobrou: number
  byCategory: Record<string, number>
  balanceA: number
  quemDeve: { de: PaidBy; para: PaidBy; valor: number } | null
}

interface OutItem {
  amount: number
  scope: 'casal' | 'A' | 'B'
  paidBy: PaidBy
  category: string
}

function monthsBetween(startTs: number, monthKey: string): number {
  const start = new Date(startTs)
  const { year, month } = parseMonthKey(monthKey)
  return (year - start.getFullYear()) * 12 + (month - 1 - start.getMonth())
}

export function computeMonthTotals(input: MonthInput): MonthTotals {
  const { monthKey, expenses, fixedCosts, installments, method, categorySplit } = input

  const out: OutItem[] = []
  let totalEntrou = 0

  // avulsos do mês (separa receita de gasto)
  for (const e of expenses) {
    if (e.month_key !== monthKey) continue
    if (e.type === 'income') {
      totalEntrou += Number(e.amount)
      continue
    }
    out.push({ amount: Number(e.amount), scope: e.scope, paidBy: e.paid_by, category: e.category })
  }

  // fixos ativos que aparecem no mês
  for (const f of fixedCosts) {
    if (!f.active) continue
    if (!fixedAppearsInMonth(new Date(f.created_at).getTime(), f.frequency ?? undefined, monthKey)) continue
    out.push({ amount: Number(f.amount), scope: f.scope, paidBy: f.paid_by, category: f.category })
  }

  // parcelas ativas que caem no mês
  for (const i of installments) {
    if (i.paid_parcelas >= i.total_parcelas) continue
    const elapsed = monthsBetween(new Date(i.started_at).getTime(), monthKey)
    if (elapsed < 0 || elapsed >= i.total_parcelas) continue
    out.push({ amount: Number(i.parcela_mensal), scope: i.scope, paidBy: i.paid_by, category: i.category })
  }

  const sum = (pred: (o: OutItem) => boolean) => out.filter(pred).reduce((s, o) => s + o.amount, 0)

  const totalMes = out.reduce((s, o) => s + o.amount, 0)
  const totalCasal = sum((o) => o.scope === 'casal')
  const totalCasalA = sum((o) => o.scope === 'casal' && o.paidBy === 'A')
  const totalCasalB = sum((o) => o.scope === 'casal' && o.paidBy === 'B')
  const totalPessoalA = sum((o) => o.scope === 'A')
  const totalPessoalB = sum((o) => o.scope === 'B')

  const byCategory: Record<string, number> = {}
  for (const o of out) byCategory[o.category] = (byCategory[o.category] ?? 0) + o.amount

  // rateio
  const iA = parseFloat(input.incomeA) || 0
  const iB = parseFloat(input.incomeB) || 0
  const casalItems = out.filter((o) => o.scope === 'casal').map((o) => ({ category: o.category, amount: o.amount }))
  const fairShareA =
    method === 'categorias'
      ? fairShareAByCategory(casalItems, categorySplit ?? {})
      : method === '50/50' || iA + iB === 0
        ? totalCasal / 2
        : totalCasal * (iA / (iA + iB))
  const balanceA = method === 'unificada' ? 0 : totalCasalA - fairShareA

  const quemDeve =
    Math.abs(balanceA) < 0.01
      ? null
      : balanceA > 0
        ? { de: 'B' as PaidBy, para: 'A' as PaidBy, valor: balanceA }
        : { de: 'A' as PaidBy, para: 'B' as PaidBy, valor: Math.abs(balanceA) }

  return {
    totalMes,
    totalCasal,
    totalCasalA,
    totalCasalB,
    totalPessoalA,
    totalPessoalB,
    totalA: totalCasalA + totalPessoalA,
    totalB: totalCasalB + totalPessoalB,
    totalEntrou,
    totalSobrou: totalEntrou - totalMes,
    byCategory,
    balanceA,
    quemDeve,
  }
}
