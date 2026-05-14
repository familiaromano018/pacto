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

export interface FeedEntry {
  id: string
  kind: ExpenseKind
  desc: string
  amount: number
  paidBy?: PaidBy
  scope: Scope
  category: string
  date: number
  sublabel?: string
  paymentMethod?: PaymentMethod
}
