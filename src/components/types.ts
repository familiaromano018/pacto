export type Scope = 'casal' | 'A' | 'B'
export type PaidBy = 'A' | 'B'
export type ExpenseKind = 'avulso' | 'fixo' | 'parcela'
export type PaymentMethod =
  | 'pix'
  | 'debito'
  | 'credito'
  | 'dinheiro'
  | 'boleto'
  | 'transferencia'

export interface Expense {
  id: string
  desc: string
  amount: number
  paidBy: PaidBy
  scope: Scope
  category: string
  createdAt: number
  monthKey: string
  paymentMethod?: PaymentMethod
  createdBy?: string
  /** 'income' = receita avulsa (entrada). Ausente/'expense' = gasto. */
  type?: 'expense' | 'income'
}

export interface Installment {
  id: string
  desc: string
  totalAmount: number
  totalParcelas: number
  paidParcelas: number
  parcelaMensal: number
  paidBy: PaidBy
  scope: Scope
  category: string
  startedAt: number
  paymentMethod?: PaymentMethod
  dueDay?: number
  createdBy?: string
}

export interface FixedCost {
  id: string
  desc: string
  amount: number
  paidBy: PaidBy
  scope: Scope
  category: string
  active: boolean
  createdAt: number
  paymentMethod?: PaymentMethod
  dueDay?: number
  /** Default 'monthly'. Define a cada quantos meses o custo aparece. */
  frequency?: 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'annual'
  createdBy?: string
}

export interface Goal {
  id: string
  name: string
  target: number
  saved: number
  createdAt: number
}

export interface CustomCategory {
  id: string
  name: string
  emoji: string
  createdAt: number
}

export interface ClosedMonth {
  monthKey: string
  closedAt: number
  totals: {
    casal: number
    personalA: number
    personalB: number
    fixed: number
    installments: number
    balanceA: number
  }
}

export type EditTarget =
  | { kind: 'avulso'; expense: Expense }
  | { kind: 'fixo'; fixed: FixedCost }
  | { kind: 'parcela'; installment: Installment }

export interface FeedEntry {
  id: string
  /** id do registro original (Expense/FixedCost/Installment) — usado pra editar/remover */
  sourceId: string
  kind: ExpenseKind
  desc: string
  amount: number
  paidBy?: PaidBy
  scope: Scope
  category: string
  date: number
  sublabel?: string
  paymentMethod?: PaymentMethod
  createdBy?: string
  /** 'in' = entrada (receita). Ausente/'out' = saída (gasto). */
  flow?: 'in' | 'out'
}

// ── Authorization ──

export type ChangeAction = 'edit' | 'delete'
export type ChangeRequestStatus = 'pending' | 'approved' | 'denied' | 'expired' | 'withdrawn'
export type ChangeTargetTable = 'expenses' | 'fixed_costs' | 'installments'

export interface ChangeRequest {
  id: string
  coupleId: string
  targetTable: ChangeTargetTable
  targetId: string
  requestedBy: string
  requestedTo: string
  action: ChangeAction
  payload: Record<string, any> | null
  status: ChangeRequestStatus
  createdAt: number
  resolvedAt: number | null
  expiresAt: number
}

export interface ChangeHistoryEntry {
  id: string
  coupleId: string
  targetTable: ChangeTargetTable
  targetId: string
  changedBy: string
  prevValue: Record<string, any>
  newValue: Record<string, any>
  isSoft: boolean
  canUndoUntil: number
  undone: boolean
  createdAt: number
}
