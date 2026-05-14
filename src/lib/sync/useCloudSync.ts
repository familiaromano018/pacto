'use client'

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  fetchSnapshot,
  type RemoteSnapshot,
} from '@/lib/supabase/repositories'
import {
  expenseFromRow,
  fixedFromRow,
  installmentFromRow,
  goalFromRow,
  closedMonthFromRow,
  categoryFromRow,
} from '@/lib/supabase/mappers'
import type {
  ExpenseRow, FixedCostRow, InstallmentRow, GoalRow, ClosedMonthRow, CustomCategoryRow,
} from '@/lib/supabase/database.types'
import type {
  Expense, FixedCost, Installment, Goal, ClosedMonth, CustomCategory,
} from '@/components/types'
import {
  drainQueue,
  enqueue,
  type Mutation,
} from './queue'

const QUEUE_KEY = 'casal-no-azul/v1/sync-queue'

export interface CloudSyncOpts {
  coupleId: string | null
  userId: string | null
  /** valores atuais do state local (lidos via ref pra detectar migração inicial) */
  current: {
    expenses: Expense[]
    fixedCosts: FixedCost[]
    installments: Installment[]
    goals: Goal[]
    closedMonths: ClosedMonth[]
    customCategories: CustomCategory[]
  }
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>
  setFixedCosts: React.Dispatch<React.SetStateAction<FixedCost[]>>
  setInstallments: React.Dispatch<React.SetStateAction<Installment[]>>
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>
  setClosedMonths: React.Dispatch<React.SetStateAction<ClosedMonth[]>>
  setCustomCategories: React.Dispatch<React.SetStateAction<CustomCategory[]>>
}

function readQueueRaw(): Mutation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? (JSON.parse(raw) as Mutation[]) : []
  } catch { return [] }
}

/**
 * Aplica mutations pendentes sobre o snapshot remoto, pra UI não "perder"
 * mudanças otimistas durante o full-pull.
 */
function applyPending(snap: RemoteSnapshot, q: Mutation[]): RemoteSnapshot {
  const result: RemoteSnapshot = {
    expenses: [...snap.expenses],
    fixedCosts: [...snap.fixedCosts],
    installments: [...snap.installments],
    goals: [...snap.goals],
    closedMonths: [...snap.closedMonths],
    customCategories: [...snap.customCategories],
  }
  for (const m of q) {
    switch (m.table) {
      case 'expenses':
        result.expenses = m.op === 'upsert'
          ? upsertById(result.expenses, m.payload)
          : result.expenses.filter((x) => x.id !== m.payload.id)
        break
      case 'fixed_costs':
        result.fixedCosts = m.op === 'upsert'
          ? upsertById(result.fixedCosts, m.payload)
          : result.fixedCosts.filter((x) => x.id !== m.payload.id)
        break
      case 'installments':
        result.installments = m.op === 'upsert'
          ? upsertById(result.installments, m.payload)
          : result.installments.filter((x) => x.id !== m.payload.id)
        break
      case 'goals':
        result.goals = m.op === 'upsert'
          ? upsertById(result.goals, m.payload)
          : result.goals.filter((x) => x.id !== m.payload.id)
        break
      case 'closed_months':
        result.closedMonths = m.op === 'upsert'
          ? upsertByKey(result.closedMonths, m.payload, (x) => x.monthKey)
          : result.closedMonths.filter((x) => x.monthKey !== m.payload.monthKey)
        break
      case 'custom_categories':
        result.customCategories = m.op === 'upsert'
          ? upsertById(result.customCategories, m.payload)
          : result.customCategories.filter((x) => x.id !== m.payload.id)
        break
      case 'couples':
        // não afeta entidades do snapshot
        break
    }
  }
  return result
}

function isSnapshotEmpty(s: RemoteSnapshot): boolean {
  return s.expenses.length === 0 && s.fixedCosts.length === 0 && s.installments.length === 0
    && s.goals.length === 0 && s.closedMonths.length === 0 && s.customCategories.length === 0
}
function isLocalEmpty(s: CloudSyncOpts['current']): boolean {
  return s.expenses.length === 0 && s.fixedCosts.length === 0 && s.installments.length === 0
    && s.goals.length === 0 && s.closedMonths.length === 0 && s.customCategories.length === 0
}

function upsertById<T extends { id: string }>(arr: T[], item: T): T[] {
  const i = arr.findIndex((x) => x.id === item.id)
  if (i === -1) return [...arr, item]
  const copy = arr.slice()
  copy[i] = item
  return copy
}
function upsertByKey<T>(arr: T[], item: T, key: (x: T) => string): T[] {
  const k = key(item)
  const i = arr.findIndex((x) => key(x) === k)
  if (i === -1) return [...arr, item]
  const copy = arr.slice()
  copy[i] = item
  return copy
}

/**
 * Hook principal de sync. Roda quando coupleId está definido.
 * - Faz full pull (com merge das mutations pendentes)
 * - Drena fila imediatamente e depois a cada 8s + on 'online' + on focus
 * - Assina realtime nas 6 tabelas filtrado por couple_id e atualiza state local
 */
export function useCloudSync(opts: CloudSyncOpts) {
  const {
    coupleId, userId, current,
    setExpenses, setFixedCosts, setInstallments, setGoals, setClosedMonths, setCustomCategories,
  } = opts

  // Refs estáveis pra evitar re-trigger dos effects toda hora que state local muda
  const settersRef = useRef({ setExpenses, setFixedCosts, setInstallments, setGoals, setClosedMonths, setCustomCategories })
  settersRef.current = { setExpenses, setFixedCosts, setInstallments, setGoals, setClosedMonths, setCustomCategories }
  const currentRef = useRef(current)
  currentRef.current = current

  // ── 1. Initial pull + merge pending + migration ──
  useEffect(() => {
    if (!coupleId) return
    let cancelled = false
    ;(async () => {
      try {
        const snap = await fetchSnapshot(coupleId)
        if (cancelled) return
        const local = currentRef.current
        const serverEmpty = isSnapshotEmpty(snap)
        const localHasData = !isLocalEmpty(local)
        if (serverEmpty && localHasData) {
          // Migration one-time: enfileira tudo que tá no localStorage pro server
          for (const e of local.expenses) enqueue({ table: 'expenses', op: 'upsert', payload: e })
          for (const f of local.fixedCosts) enqueue({ table: 'fixed_costs', op: 'upsert', payload: f })
          for (const i of local.installments) enqueue({ table: 'installments', op: 'upsert', payload: i })
          for (const g of local.goals) enqueue({ table: 'goals', op: 'upsert', payload: g })
          for (const m of local.closedMonths) enqueue({ table: 'closed_months', op: 'upsert', payload: m })
          for (const c of local.customCategories) enqueue({ table: 'custom_categories', op: 'upsert', payload: c })
          // não toca no state — local já é a verdade. Drain vai propagar pro server.
          return
        }
        // Pull normal: aplica mutations pendentes sobre snapshot remoto
        const merged = applyPending(snap, readQueueRaw())
        const s = settersRef.current
        s.setExpenses(merged.expenses)
        s.setFixedCosts(merged.fixedCosts)
        s.setInstallments(merged.installments)
        s.setGoals(merged.goals)
        s.setClosedMonths(merged.closedMonths)
        s.setCustomCategories(merged.customCategories)
      } catch (err) {
        console.warn('[sync] fetchSnapshot falhou', err)
      }
    })()
    return () => { cancelled = true }
  }, [coupleId])

  // ── 2. Drain loop ──
  useEffect(() => {
    if (!coupleId) return
    let alive = true
    const tick = () => { if (alive) drainQueue(coupleId, userId).catch(() => {}) }
    tick()
    const id = window.setInterval(tick, 8000)
    const onOnline = () => tick()
    const onFocus = () => tick()
    window.addEventListener('online', onOnline)
    window.addEventListener('focus', onFocus)
    return () => {
      alive = false
      window.clearInterval(id)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('focus', onFocus)
    }
  }, [coupleId, userId])

  // ── 3. Realtime ──
  useEffect(() => {
    if (!coupleId) return
    const sb = supabase()
    const filter = `couple_id=eq.${coupleId}`
    const s = settersRef.current

    const ch = sb
      .channel(`pacto:${coupleId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const id = (payload.old as Partial<ExpenseRow>).id
          if (id) s.setExpenses((prev) => prev.filter((x) => x.id !== id))
        } else {
          const row = payload.new as ExpenseRow
          s.setExpenses((prev) => upsertById(prev, expenseFromRow(row)))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fixed_costs', filter }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const id = (payload.old as Partial<FixedCostRow>).id
          if (id) s.setFixedCosts((prev) => prev.filter((x) => x.id !== id))
        } else {
          const row = payload.new as FixedCostRow
          s.setFixedCosts((prev) => upsertById(prev, fixedFromRow(row)))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'installments', filter }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const id = (payload.old as Partial<InstallmentRow>).id
          if (id) s.setInstallments((prev) => prev.filter((x) => x.id !== id))
        } else {
          const row = payload.new as InstallmentRow
          s.setInstallments((prev) => upsertById(prev, installmentFromRow(row)))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals', filter }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const id = (payload.old as Partial<GoalRow>).id
          if (id) s.setGoals((prev) => prev.filter((x) => x.id !== id))
        } else {
          const row = payload.new as GoalRow
          s.setGoals((prev) => upsertById(prev, goalFromRow(row)))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'closed_months', filter }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const mk = (payload.old as Partial<ClosedMonthRow>).month_key
          if (mk) s.setClosedMonths((prev) => prev.filter((x) => x.monthKey !== mk))
        } else {
          const row = payload.new as ClosedMonthRow
          s.setClosedMonths((prev) => upsertByKey(prev, closedMonthFromRow(row), (x) => x.monthKey))
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'custom_categories', filter }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const id = (payload.old as Partial<CustomCategoryRow>).id
          if (id) s.setCustomCategories((prev) => prev.filter((x) => x.id !== id))
        } else {
          const row = payload.new as CustomCategoryRow
          s.setCustomCategories((prev) => upsertById(prev, categoryFromRow(row)))
        }
      })
      .subscribe()

    return () => { sb.removeChannel(ch) }
  }, [coupleId])
}
