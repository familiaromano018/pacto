'use client'

import { supabase } from './client'
import {
  expenseFromRow, expenseToRow,
  fixedFromRow, fixedToRow,
  installmentFromRow, installmentToRow,
  goalFromRow, goalToRow,
  closedMonthFromRow, closedMonthToRow,
  categoryFromRow, categoryToRow,
} from './mappers'
import type {
  Expense, Installment, FixedCost, Goal, ClosedMonth, CustomCategory,
} from '@/components/types'

// ── EXPENSES ───────────────────────────────────────────────────────────────────
export async function listExpenses(coupleId: string): Promise<Expense[]> {
  const sb = supabase()
  const { data, error } = await sb.from('expenses').select('*').eq('couple_id', coupleId)
  if (error) throw error
  return (data ?? []).map(expenseFromRow)
}
export async function upsertExpense(coupleId: string, userId: string | null, e: Expense) {
  const sb = supabase()
  const { error } = await sb.from('expenses').upsert(expenseToRow(e, coupleId, userId))
  if (error) throw error
}
export async function deleteExpense(id: string) {
  const sb = supabase()
  const { error } = await sb.from('expenses').delete().eq('id', id)
  if (error) throw error
}

// ── FIXED COSTS ────────────────────────────────────────────────────────────────
export async function listFixedCosts(coupleId: string): Promise<FixedCost[]> {
  const sb = supabase()
  const { data, error } = await sb.from('fixed_costs').select('*').eq('couple_id', coupleId)
  if (error) throw error
  return (data ?? []).map(fixedFromRow)
}
export async function upsertFixedCost(coupleId: string, userId: string | null, f: FixedCost) {
  const sb = supabase()
  const { error } = await sb.from('fixed_costs').upsert(fixedToRow(f, coupleId, userId))
  if (error) throw error
}
export async function deleteFixedCost(id: string) {
  const sb = supabase()
  const { error } = await sb.from('fixed_costs').delete().eq('id', id)
  if (error) throw error
}

// ── INSTALLMENTS ───────────────────────────────────────────────────────────────
export async function listInstallments(coupleId: string): Promise<Installment[]> {
  const sb = supabase()
  const { data, error } = await sb.from('installments').select('*').eq('couple_id', coupleId)
  if (error) throw error
  return (data ?? []).map(installmentFromRow)
}
export async function upsertInstallment(coupleId: string, userId: string | null, i: Installment) {
  const sb = supabase()
  const { error } = await sb.from('installments').upsert(installmentToRow(i, coupleId, userId))
  if (error) throw error
}
export async function deleteInstallment(id: string) {
  const sb = supabase()
  const { error } = await sb.from('installments').delete().eq('id', id)
  if (error) throw error
}

// ── GOALS ──────────────────────────────────────────────────────────────────────
export async function listGoals(coupleId: string): Promise<Goal[]> {
  const sb = supabase()
  const { data, error } = await sb.from('goals').select('*').eq('couple_id', coupleId)
  if (error) throw error
  return (data ?? []).map(goalFromRow)
}
export async function upsertGoal(coupleId: string, userId: string | null, g: Goal) {
  const sb = supabase()
  const { error } = await sb.from('goals').upsert(goalToRow(g, coupleId, userId))
  if (error) throw error
}
export async function deleteGoal(id: string) {
  const sb = supabase()
  const { error } = await sb.from('goals').delete().eq('id', id)
  if (error) throw error
}

// ── CLOSED MONTHS ──────────────────────────────────────────────────────────────
export async function listClosedMonths(coupleId: string): Promise<ClosedMonth[]> {
  const sb = supabase()
  const { data, error } = await sb.from('closed_months').select('*').eq('couple_id', coupleId)
  if (error) throw error
  return (data ?? []).map(closedMonthFromRow)
}
export async function upsertClosedMonth(coupleId: string, m: ClosedMonth) {
  const sb = supabase()
  const { error } = await sb.from('closed_months').upsert(closedMonthToRow(m, coupleId), {
    onConflict: 'couple_id,month_key',
  })
  if (error) throw error
}
export async function deleteClosedMonth(coupleId: string, monthKey: string) {
  const sb = supabase()
  const { error } = await sb
    .from('closed_months')
    .delete()
    .eq('couple_id', coupleId)
    .eq('month_key', monthKey)
  if (error) throw error
}

// ── CUSTOM CATEGORIES ──────────────────────────────────────────────────────────
export async function listCategories(coupleId: string): Promise<CustomCategory[]> {
  const sb = supabase()
  const { data, error } = await sb.from('custom_categories').select('*').eq('couple_id', coupleId)
  if (error) throw error
  return (data ?? []).map(categoryFromRow)
}
export async function upsertCategory(coupleId: string, c: CustomCategory) {
  const sb = supabase()
  const { error } = await sb.from('custom_categories').upsert(categoryToRow(c, coupleId))
  if (error) throw error
}
export async function deleteCategory(id: string) {
  const sb = supabase()
  const { error } = await sb.from('custom_categories').delete().eq('id', id)
  if (error) throw error
}

// ── Bundle types pra full-pull ─────────────────────────────────────────────────
export interface RemoteSnapshot {
  expenses: Expense[]
  fixedCosts: FixedCost[]
  installments: Installment[]
  goals: Goal[]
  closedMonths: ClosedMonth[]
  customCategories: CustomCategory[]
}

export async function fetchSnapshot(coupleId: string): Promise<RemoteSnapshot> {
  const [expenses, fixedCosts, installments, goals, closedMonths, customCategories] =
    await Promise.all([
      listExpenses(coupleId),
      listFixedCosts(coupleId),
      listInstallments(coupleId),
      listGoals(coupleId),
      listClosedMonths(coupleId),
      listCategories(coupleId),
    ])
  return { expenses, fixedCosts, installments, goals, closedMonths, customCategories }
}
