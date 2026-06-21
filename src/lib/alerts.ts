/**
 * Avisos do app (orçamento estourado, conta vencendo, etc.).
 *
 * PURO e reaproveitável: hoje alimenta o banner no app; quando o WhatsApp
 * estiver conectado, as MESMAS funções geram as mensagens enviadas via Evolution.
 */
import type { FixedCost, Installment } from '@/components/types'

export type AlertLevel = 'danger' | 'warn' | 'info'

export interface AppAlert {
  id: string
  level: AlertLevel
  icon: string
  title: string
  detail?: string
}

const BRL = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/** Orçamento por categoria: >=100% = vermelho, >=80% = amarelo. */
export function budgetAlerts(
  byCategory: Record<string, number>,
  budgets: Record<string, number>,
): AppAlert[] {
  const out: AppAlert[] = []
  for (const [cat, limitRaw] of Object.entries(budgets || {})) {
    const limit = Number(limitRaw)
    if (!limit || limit <= 0) continue
    const spent = byCategory[cat] ?? 0
    const pct = spent / limit
    if (pct >= 1) {
      out.push({
        id: `budget-over-${cat}`,
        level: 'danger',
        icon: '🔴',
        title: `Orçamento de ${cat} estourado`,
        detail: `${BRL(spent)} de ${BRL(limit)} (${Math.round(pct * 100)}%)`,
      })
    } else if (pct >= 0.8) {
      out.push({
        id: `budget-near-${cat}`,
        level: 'warn',
        icon: '🟡',
        title: `${cat} perto do limite`,
        detail: `${BRL(spent)} de ${BRL(limit)} (${Math.round(pct * 100)}%)`,
      })
    }
  }
  return out
}

/** Contas fixas / parcelas com vencimento nos próximos `windowDays` dias. */
export function billAlerts(
  fixedCosts: FixedCost[],
  installments: Installment[],
  today: Date = new Date(),
  windowDays = 5,
): AppAlert[] {
  const out: AppAlert[] = []
  const dayNow = today.getDate()

  const checkDue = (
    dueDay: number | undefined,
    desc: string,
    amount: number,
    kind: 'fixo' | 'parcela',
  ) => {
    if (!dueDay) return
    const diff = dueDay - dayNow
    if (diff < 0 || diff > windowDays) return
    const when = diff === 0 ? 'hoje' : diff === 1 ? 'amanhã' : `em ${diff} dias`
    out.push({
      id: `bill-${kind}-${desc}-${dueDay}`,
      level: diff <= 1 ? 'warn' : 'info',
      icon: '📅',
      title: `${desc} vence ${when}`,
      detail: BRL(amount),
    })
  }

  for (const f of fixedCosts) if (f.active) checkDue(f.dueDay, f.desc, f.amount, 'fixo')
  for (const i of installments)
    if (i.paidParcelas < i.totalParcelas) checkDue(i.dueDay, i.desc, i.parcelaMensal, 'parcela')

  return out
}

export function computeAlerts(input: {
  byCategory: Record<string, number>
  categoryBudgets: Record<string, number>
  fixedCosts: FixedCost[]
  installments: Installment[]
  today?: Date
}): AppAlert[] {
  const order: Record<AlertLevel, number> = { danger: 0, warn: 1, info: 2 }
  return [
    ...budgetAlerts(input.byCategory, input.categoryBudgets),
    ...billAlerts(input.fixedCosts, input.installments, input.today),
  ].sort((a, b) => order[a.level] - order[b.level])
}
