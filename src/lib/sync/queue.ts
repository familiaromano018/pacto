'use client'

import { newId } from '@/lib/id'
import * as repo from '@/lib/supabase/repositories'
import { updateCoupleRow } from '@/lib/supabase/couple'
import type {
  Expense, FixedCost, Installment, Goal, ClosedMonth, CustomCategory,
} from '@/components/types'
import type { CoupleRow } from '@/lib/supabase/database.types'

const QUEUE_KEY = 'casal-no-azul/v1/sync-queue'

export type MutationTable =
  | 'expenses'
  | 'fixed_costs'
  | 'installments'
  | 'goals'
  | 'closed_months'
  | 'custom_categories'
  | 'couples'

export type Mutation =
  | { id: string; ts: number; table: 'expenses'; op: 'upsert'; payload: Expense }
  | { id: string; ts: number; table: 'expenses'; op: 'delete'; payload: { id: string } }
  | { id: string; ts: number; table: 'fixed_costs'; op: 'upsert'; payload: FixedCost }
  | { id: string; ts: number; table: 'fixed_costs'; op: 'delete'; payload: { id: string } }
  | { id: string; ts: number; table: 'installments'; op: 'upsert'; payload: Installment }
  | { id: string; ts: number; table: 'installments'; op: 'delete'; payload: { id: string } }
  | { id: string; ts: number; table: 'goals'; op: 'upsert'; payload: Goal }
  | { id: string; ts: number; table: 'goals'; op: 'delete'; payload: { id: string } }
  | { id: string; ts: number; table: 'closed_months'; op: 'upsert'; payload: ClosedMonth }
  | { id: string; ts: number; table: 'closed_months'; op: 'delete'; payload: { monthKey: string } }
  | { id: string; ts: number; table: 'custom_categories'; op: 'upsert'; payload: CustomCategory }
  | { id: string; ts: number; table: 'custom_categories'; op: 'delete'; payload: { id: string } }
  | {
      id: string; ts: number; table: 'couples'; op: 'update'
      payload: Partial<Pick<CoupleRow, 'name_a' | 'name_b' | 'income_a' | 'income_b' | 'method' | 'privacy_mode'>>
    }

// ── Storage helpers ────────────────────────────────────────────────────────────
function readQueue(): Mutation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Mutation[]
  } catch {
    return []
  }
}
function writeQueue(q: Mutation[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q))
  } catch {}
  notifySubscribers(q.length)
}

// ── Subscribers (pra UI mostrar pending count, status etc) ─────────────────────
type Listener = (pending: number) => void
const listeners = new Set<Listener>()
export function subscribeQueue(cb: Listener): () => void {
  listeners.add(cb)
  cb(readQueue().length)
  return () => { listeners.delete(cb) }
}
function notifySubscribers(pending: number) {
  listeners.forEach((cb) => { try { cb(pending) } catch {} })
}

// ── Public API ─────────────────────────────────────────────────────────────────
export function enqueue(m: Omit<Mutation, 'id' | 'ts'>): void {
  const full = { ...m, id: newId(), ts: Date.now() } as Mutation
  const q = readQueue()
  q.push(full)
  writeQueue(q)
}

export function pendingCount(): number {
  return readQueue().length
}

export function clearQueue() {
  writeQueue([])
}

// ── Apply: despacha pra repo certa ─────────────────────────────────────────────
async function applyMutation(m: Mutation, coupleId: string, userId: string | null) {
  switch (m.table) {
    case 'expenses':
      if (m.op === 'upsert') return repo.upsertExpense(coupleId, userId, m.payload)
      return repo.deleteExpense(m.payload.id)
    case 'fixed_costs':
      if (m.op === 'upsert') return repo.upsertFixedCost(coupleId, userId, m.payload)
      return repo.deleteFixedCost(m.payload.id)
    case 'installments':
      if (m.op === 'upsert') return repo.upsertInstallment(coupleId, userId, m.payload)
      return repo.deleteInstallment(m.payload.id)
    case 'goals':
      if (m.op === 'upsert') return repo.upsertGoal(coupleId, userId, m.payload)
      return repo.deleteGoal(m.payload.id)
    case 'closed_months':
      if (m.op === 'upsert') return repo.upsertClosedMonth(coupleId, m.payload)
      return repo.deleteClosedMonth(coupleId, m.payload.monthKey)
    case 'custom_categories':
      if (m.op === 'upsert') return repo.upsertCategory(coupleId, m.payload)
      return repo.deleteCategory(m.payload.id)
    case 'couples':
      return updateCoupleRow(coupleId, m.payload)
  }
}

// ── Drain ──────────────────────────────────────────────────────────────────────
let draining = false
export async function drainQueue(coupleId: string, userId: string | null): Promise<{ flushed: number; failed: number }> {
  if (draining) return { flushed: 0, failed: 0 }
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return { flushed: 0, failed: 0 }
  draining = true
  let flushed = 0
  let failed = 0
  try {
    while (true) {
      const q = readQueue()
      if (q.length === 0) break
      const next = q[0]
      try {
        await applyMutation(next, coupleId, userId)
        // pop head
        writeQueue(q.slice(1))
        flushed++
      } catch (err) {
        // mantém na fila pra retry depois; aborta drain pra não martelar
        console.warn('[sync] mutation falhou — vai retentar depois', next, err)
        failed++
        break
      }
    }
  } finally {
    draining = false
  }
  return { flushed, failed }
}
