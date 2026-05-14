import { parseMonthKey } from './format'

export type FixedFrequency =
  | 'monthly'
  | 'bimonthly'
  | 'quarterly'
  | 'semiannual'
  | 'annual'

export const FIXED_FREQUENCY_INTERVAL: Record<FixedFrequency, number> = {
  monthly: 1,
  bimonthly: 2,
  quarterly: 3,
  semiannual: 6,
  annual: 12,
}

export const FIXED_FREQUENCY_LABEL: Record<FixedFrequency, string> = {
  monthly: 'Mensal',
  bimonthly: 'Bimestral',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
}

export const FIXED_FREQUENCY_SHORT: Record<FixedFrequency, string> = {
  monthly: '/ mês',
  bimonthly: '/ 2m',
  quarterly: '/ trim',
  semiannual: '/ 6m',
  annual: '/ ano',
}

/**
 * Retorna true se o custo fixo deve aparecer no mês alvo.
 * - Considera a frequência (mensal/bimestral/.../anual)
 * - O mês inicial é o createdAt (1ª ocorrência) e a partir dali repete a cada N meses
 */
export function fixedAppearsInMonth(
  createdAt: number,
  frequency: FixedFrequency | undefined,
  monthKey: string,
): boolean {
  const freq = frequency ?? 'monthly'
  const interval = FIXED_FREQUENCY_INTERVAL[freq] ?? 1
  const start = new Date(createdAt)
  const startMonths = start.getFullYear() * 12 + start.getMonth()
  const { year, month } = parseMonthKey(monthKey)
  const targetMonths = year * 12 + (month - 1)
  const diff = targetMonths - startMonths
  return diff >= 0 && diff % interval === 0
}
