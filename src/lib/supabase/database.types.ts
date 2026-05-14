/**
 * Tipos do schema Postgres do Pacto.
 * Manualmente espelhados de docs/supabase/schema.sql.
 * Quando o schema mudar, atualizar aqui também (ou rodar `supabase gen types`).
 */

export type Scope = 'casal' | 'A' | 'B'
export type PaidBy = 'A' | 'B'
export type Method = '50/50' | 'proporcional'
export type PrivacyMode = 'open' | 'private'
export type PaymentMethod = 'pix' | 'debito' | 'credito' | 'dinheiro' | 'boleto' | 'transferencia'

export interface CoupleRow {
  id: string
  code: string
  name_a: string
  name_b: string
  income_a: string
  income_b: string
  method: Method
  privacy_mode: PrivacyMode
  created_at: string
  updated_at: string
}

export interface MemberRow {
  user_id: string
  couple_id: string
  role: PaidBy
  joined_at: string
}

export interface ExpenseRow {
  id: string
  couple_id: string
  created_by: string | null
  desc_text: string
  amount: number
  paid_by: PaidBy
  scope: Scope
  category: string
  payment_method: PaymentMethod | null
  month_key: string
  created_at: string
  updated_at: string
}

export interface FixedCostRow {
  id: string
  couple_id: string
  created_by: string | null
  desc_text: string
  amount: number
  paid_by: PaidBy
  scope: Scope
  category: string
  payment_method: PaymentMethod | null
  due_day: number | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface InstallmentRow {
  id: string
  couple_id: string
  created_by: string | null
  desc_text: string
  total_amount: number
  total_parcelas: number
  paid_parcelas: number
  parcela_mensal: number
  paid_by: PaidBy
  scope: Scope
  category: string
  payment_method: PaymentMethod | null
  due_day: number | null
  started_at: string
  created_at: string
  updated_at: string
}

export interface GoalRow {
  id: string
  couple_id: string
  created_by: string | null
  name: string
  target: number
  saved: number
  created_at: string
  updated_at: string
}

export interface ClosedMonthRow {
  couple_id: string
  month_key: string
  closed_at: string
  totals: {
    casal: number
    personalA: number
    personalB: number
    fixed: number
    installments: number
    balanceA: number
  }
}

export interface CustomCategoryRow {
  id: string
  couple_id: string
  name: string
  emoji: string
  created_at: string
}

// ────────────────────────────────────────────────────────────── Database type ──

type Insertable<T extends { id?: string; created_at?: string; updated_at?: string }> =
  Omit<T, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<T, 'id'>>

type Updatable<T> = Partial<T>

type T<Row, Ins = Insertable<Row & { id?: string; created_at?: string; updated_at?: string }>> = {
  Row: Row
  Insert: Ins
  Update: Partial<Row>
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      couples:           T<CoupleRow>
      members:           { Row: MemberRow; Insert: MemberRow; Update: Partial<MemberRow>; Relationships: [] }
      expenses:          T<ExpenseRow>
      fixed_costs:       T<FixedCostRow>
      installments:      T<InstallmentRow>
      goals:             T<GoalRow>
      closed_months:     { Row: ClosedMonthRow; Insert: ClosedMonthRow; Update: Partial<ClosedMonthRow>; Relationships: [] }
      custom_categories: T<CustomCategoryRow>
    }
    Views: Record<string, never>
    Functions: {
      generate_couple_code:           { Args: Record<string, never>; Returns: string }
      create_couple_for_current_user: { Args: Record<string, never>; Returns: string }
      join_couple_with_code:          { Args: { invite_code: string }; Returns: string }
    }
  }
}
