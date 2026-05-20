// src/lib/changes/classify.ts
import type { Expense, FixedCost, Installment } from '@/components/types'

export type ChangeRoute = 'soft' | 'strict' | 'no-op'

type Mutable = Partial<Expense> & Partial<FixedCost> & Partial<Installment>

/**
 * Classifica a rota de uma mutação cross-user.
 * - 'no-op'  → nenhum campo material mudou (ignora)
 * - 'soft'   → só campos cosméticos (desc, paymentMethod, amount Δ < 10%)
 * - 'strict' → algum campo material mudou (category, scope, paidBy, monthKey, amount Δ ≥ 10%, ou delete)
 *
 * Para um delete, chamar com next = null → sempre 'strict'.
 */
export function classify(prev: Mutable, next: Mutable | null): ChangeRoute {
  if (next === null) return 'strict'

  let hasMaterial = false
  let hasCosmetic = false

  if (prev.amount !== undefined && next.amount !== undefined && prev.amount !== next.amount) {
    if (prev.amount === 0) {
      hasMaterial = true
    } else {
      const delta = Math.abs(next.amount - prev.amount)
      const ratio = delta / Math.abs(prev.amount)
      if (ratio >= 0.1) hasMaterial = true
      else hasCosmetic = true
    }
  }

  if (next.category !== undefined && next.category !== prev.category) hasMaterial = true
  if (next.scope !== undefined && next.scope !== prev.scope) hasMaterial = true
  if (next.paidBy !== undefined && next.paidBy !== prev.paidBy) hasMaterial = true
  if ((next as Expense).monthKey !== undefined && (next as Expense).monthKey !== (prev as Expense).monthKey) hasMaterial = true

  if (next.desc !== undefined && next.desc !== prev.desc) hasCosmetic = true
  if (next.paymentMethod !== undefined && next.paymentMethod !== prev.paymentMethod) hasCosmetic = true

  if ((next as FixedCost).dueDay !== undefined && (next as FixedCost).dueDay !== (prev as FixedCost).dueDay) hasCosmetic = true
  if ((next as FixedCost).active !== undefined && (next as FixedCost).active !== (prev as FixedCost).active) hasMaterial = true

  if (hasMaterial) return 'strict'
  if (hasCosmetic) return 'soft'
  return 'no-op'
}
