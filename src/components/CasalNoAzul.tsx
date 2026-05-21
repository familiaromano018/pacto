'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { tokens } from '@/lib/tokens'
import { useLocalState, clearAllLocalState } from '@/lib/storage'
import { generateExtractPDF } from '@/lib/pdf'
import { useToast } from './Toast'
import { currentMonthKey, parseMonthKey } from '@/lib/format'
import Setup from './Setup'
import LoginScreen from './LoginScreen'
import PaywallScreen from './PaywallScreen'
import TrialBanner from './TrialBanner'
import TrialWelcomeModal from './TrialWelcomeModal'
import InstallModal from './InstallModal'
import DailyTipModal from './DailyTipModal'
import MonthHeader from './MonthHeader'
import TabMes from './TabMes'
import TabVisao from './TabVisao'
import TabRecorrentes from './TabRecorrentes'
import TabMetas from './TabMetas'
import TabConfig from './TabConfig'
import AddExpenseSheet from './AddExpenseSheet'
import { Logo } from './Logo'
import { newId } from '@/lib/id'
import { useSession, signOut } from '@/lib/supabase/useSession'
import { supabase } from '@/lib/supabase/client'
import { getCurrentCoupleId, getCoupleRow } from '@/lib/supabase/couple'
import { useCloudSync } from '@/lib/sync/useCloudSync'
import { enqueue, drainQueue, clearQueue } from '@/lib/sync/queue'
import { useSubscription } from '@/lib/subscription/useSubscription'
import { classify } from '@/lib/changes/classify'
import { createChangeRequest } from '@/lib/changes/request'
import { logSoftChange } from '@/lib/changes/history'
import { fixedAppearsInMonth } from '@/lib/fixed'
import type {
  Expense, FixedCost, Installment, Goal, ClosedMonth, CustomCategory, EditTarget,
} from './types'

type TabId = 'visao' | 'mes' | 'recorrentes' | 'metas' | 'config'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'visao',       label: 'Visão',       icon: <IconChart /> },
  { id: 'mes',         label: 'Mês',         icon: <IconCalendar /> },
  { id: 'recorrentes', label: 'Recorrentes', icon: <IconRepeat /> },
  { id: 'metas',       label: 'Metas',       icon: <IconTarget /> },
  { id: 'config',      label: 'Casal',       icon: <IconUsers /> },
]

// ── Top-level: auth gate ───────────────────────────────────────────────────────
export default function CasalNoAzul() {
  const session = useSession()

  if (session.status === 'loading') return <Splash />
  if (session.status === 'unauthenticated') return <LoginScreen />
  return <AuthedShell userId={session.user.id} />
}

// ── AuthedShell: tudo do app, com sync ─────────────────────────────────────────
function AuthedShell({ userId }: { userId: string }) {
  // ── Setup state (persisted) ──
  const [setupDone, setSetupDone] = useLocalState('setup-done', false)
  const [nameA, setNameA] = useLocalState('name-a', '')
  const [nameB, setNameB] = useLocalState('name-b', '')
  const [incomeA, setIncomeA] = useLocalState('income-a', '')
  const [incomeB, setIncomeB] = useLocalState('income-b', '')
  const [method, setMethod] = useLocalState<'50/50' | 'proporcional'>('method', '50/50')

  // ── Data state (persisted) ──
  const [expenses, setExpenses] = useLocalState<Expense[]>('expenses', [])
  const [installments, setInstallments] = useLocalState<Installment[]>('installments', [])
  const [fixedCosts, setFixedCosts] = useLocalState<FixedCost[]>('fixed-costs', [])
  const [goals, setGoals] = useLocalState<Goal[]>('goals', [])
  const [closedMonths, setClosedMonths] = useLocalState<ClosedMonth[]>('closed-months', [])
  const [customCategories, setCustomCategories] = useLocalState<CustomCategory[]>('custom-categories', [])

  // ── Cloud state ──
  const [coupleId, setCoupleId] = useState<string | null | undefined>(undefined)
  const [coupleCode, setCoupleCode] = useState<string | null>(null)
  const [partnerJoined, setPartnerJoined] = useState(false)
  const [partnerUserId, setPartnerUserId] = useState<string | null>(null)

  // ── UI state (ephemeral) ──
  const [tab, setTab] = useState<TabId>('mes')
  const [monthKey, setMonthKey] = useState(currentMonthKey())
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<EditTarget | null>(null)
  const [pendingMesFilter, setPendingMesFilter] = useState<{ category?: string; payment?: string } | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const toast = useToast()

  function handleDrillTo(target: { kind: 'category' | 'method'; key: string }) {
    if (target.kind === 'category') {
      setPendingMesFilter({ category: target.key })
    } else {
      setPendingMesFilter({ payment: target.key })
    }
    setTab('mes')
  }

  // Carrega coupleId inicial
  useEffect(() => {
    let cancelled = false
    getCurrentCoupleId()
      .then((id) => { if (!cancelled) setCoupleId(id) })
      .catch((err) => {
        console.warn('[auth] getCurrentCoupleId falhou', err)
        if (!cancelled) setCoupleId(null)
      })
    return () => { cancelled = true }
  }, [userId])

  // Carrega coupleCode + member count quando coupleId estiver pronto + escuta realtime de members
  useEffect(() => {
    if (!coupleId) {
      setCoupleCode(null)
      setPartnerJoined(false)
      setPartnerUserId(null)
      return
    }
    const sb = supabase()
    let cancelled = false

    async function loadCouple() {
      const row = await getCoupleRow(coupleId!)
      if (cancelled) return
      setCoupleCode(row?.code ?? null)
      // sincroniza também valores locais com server se vazios localmente (caso B entrando pela primeira vez)
      if (row) {
        if (!nameA && row.name_a) setNameA(row.name_a)
        if (!nameB && row.name_b) setNameB(row.name_b)
        if (!incomeA && row.income_a) setIncomeA(row.income_a)
        if (!incomeB && row.income_b) setIncomeB(row.income_b)
        if (row.method && (row.method === '50/50' || row.method === 'proporcional')) {
          setMethod(row.method)
        }
      }
    }
    async function loadMembers() {
      const { count } = await sb
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('couple_id', coupleId!)
      if (cancelled) return
      setPartnerJoined((count ?? 0) >= 2)
    }
    async function loadPartner() {
      const { data } = await sb
        .from('members')
        .select('user_id')
        .eq('couple_id', coupleId!)
        .neq('user_id', userId)
        .maybeSingle()
      if (cancelled) return
      setPartnerUserId(data?.user_id ?? null)
    }
    loadCouple().catch(() => {})
    loadMembers().catch(() => {})
    loadPartner().catch(() => {})

    const ch = sb
      .channel(`pacto:${coupleId}:meta`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members', filter: `couple_id=eq.${coupleId}` }, () => {
        loadMembers().catch(() => {})
        loadPartner().catch(() => {})
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'couples', filter: `id=eq.${coupleId}` }, (payload) => {
        const row = payload.new as { name_a?: string; name_b?: string; income_a?: string; income_b?: string; method?: '50/50' | 'proporcional'; code?: string }
        if (row.code) setCoupleCode(row.code)
        // espelha mudanças do parceiro no state local (sem entrar em loop: useLocalState não dispara enqueue)
        if (row.name_a != null) setNameA(row.name_a)
        if (row.name_b != null) setNameB(row.name_b)
        if (row.income_a != null) setIncomeA(row.income_a)
        if (row.income_b != null) setIncomeB(row.income_b)
        if (row.method) setMethod(row.method)
      })
      .subscribe()

    return () => {
      cancelled = true
      sb.removeChannel(ch)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupleId])

  // ── Pending change_requests endereçadas a esse user (badge no bottom nav) ──
  useEffect(() => {
    if (!coupleId || !userId) {
      setPendingCount(0)
      return
    }
    const sb = supabase()
    let cancelled = false
    async function load() {
      const { count } = await sb
        .from('change_requests')
        .select('*', { count: 'exact', head: true })
        .eq('couple_id', coupleId!)
        .eq('requested_to', userId)
        .eq('status', 'pending')
      if (!cancelled) setPendingCount(count ?? 0)
    }
    load().catch(() => {})
    const ch = sb
      .channel(`pacto:${coupleId}:badge`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'change_requests', filter: `couple_id=eq.${coupleId}` }, () => {
        load().catch(() => {})
      })
      .subscribe()
    return () => { cancelled = true; sb.removeChannel(ch) }
  }, [coupleId, userId])

  // Cloud sync engine — só roda quando coupleId tá setado
  useCloudSync({
    coupleId: coupleId ?? null,
    userId,
    current: { expenses, fixedCosts, installments, goals, closedMonths, customCategories },
    setExpenses, setFixedCosts, setInstallments, setGoals, setClosedMonths, setCustomCategories,
  })

  // Subscription state pro paywall + trial banner
  const sub = useSubscription(coupleId ?? null)

  // ── Wrappers de mutation: set local + enqueue ──
  // Sentinel: refs locais pra setState com diff e enqueue automático
  const expensesRef = useRef(expenses); expensesRef.current = expenses
  const fixedRef = useRef(fixedCosts); fixedRef.current = fixedCosts
  const instRef = useRef(installments); instRef.current = installments
  const goalsRef = useRef(goals); goalsRef.current = goals
  const closedRef = useRef(closedMonths); closedRef.current = closedMonths
  const catsRef = useRef(customCategories); catsRef.current = customCategories

  function pushDrain() {
    if (coupleId) drainQueue(coupleId, userId).catch(() => {})
  }

  // ── Expense ──
  async function upsertExpense(e: Expense) {
    const existing = expenses.find((x) => x.id === e.id)
    const isOwn = !existing || (existing.createdBy ?? e.createdBy) === userId

    // New OR own → direct
    if (!existing || isOwn) {
      setExpenses((prev) => {
        const i = prev.findIndex((x) => x.id === e.id)
        if (i === -1) return [...prev, e]
        const copy = prev.slice()
        copy[i] = e
        return copy
      })
      enqueue({ table: 'expenses', op: 'upsert', payload: e })
      pushDrain()
      return
    }

    // Cross-user → classify
    const route = classify(existing, e)
    if (route === 'no-op') return

    if (route === 'soft') {
      setExpenses((prev) => {
        const i = prev.findIndex((x) => x.id === e.id)
        if (i === -1) return [...prev, e]
        const copy = prev.slice()
        copy[i] = e
        return copy
      })
      enqueue({ table: 'expenses', op: 'upsert', payload: e })
      pushDrain()
      if (coupleId) {
        await logSoftChange({
          coupleId,
          targetTable: 'expenses',
          targetId: e.id,
          changedBy: userId,
          prevValue: existing as any,
          newValue: e as any,
        }).catch(() => {})
      }
      return
    }

    // strict
    if (coupleId && existing.createdBy) {
      await createChangeRequest({
        coupleId,
        targetTable: 'expenses',
        targetId: e.id,
        requestedBy: userId,
        requestedTo: existing.createdBy,
        action: 'edit',
        payload: e as any,
      }).catch(() => {})
      toast.show('Pedido enviado pra aprovação do parceiro')
    }
  }
  async function removeExpense(id: string) {
    const existing = expenses.find((x) => x.id === id)
    if (!existing) return
    const isOwn = (existing.createdBy ?? null) === userId

    if (isOwn) {
      setExpenses((prev) => prev.filter((x) => x.id !== id))
      enqueue({ table: 'expenses', op: 'delete', payload: { id } })
      pushDrain()
      return
    }

    // Cross-user delete → strict
    if (coupleId && existing.createdBy) {
      await createChangeRequest({
        coupleId,
        targetTable: 'expenses',
        targetId: id,
        requestedBy: userId,
        requestedTo: existing.createdBy,
        action: 'delete',
        payload: null,
      }).catch(() => {})
      toast.show('Pedido de remoção enviado pra aprovação')
    }
  }
  function startEditExpense(id: string) {
    const e = expenses.find((x) => x.id === id)
    if (!e) return
    setEditing({ kind: 'avulso', expense: e })
    setSheetOpen(true)
  }
  function startEditFixed(id: string) {
    const f = fixedCosts.find((x) => x.id === id)
    if (!f) return
    setEditing({ kind: 'fixo', fixed: f })
    setSheetOpen(true)
  }
  function startEditInstallment(id: string) {
    const i = installments.find((x) => x.id === id)
    if (!i) return
    setEditing({ kind: 'parcela', installment: i })
    setSheetOpen(true)
  }
  async function removeFixed(id: string) {
    const existing = fixedCosts.find((x) => x.id === id)
    if (!existing) return
    const isOwn = (existing.createdBy ?? null) === userId

    if (isOwn) {
      setFixedCosts((prev) => prev.filter((x) => x.id !== id))
      enqueue({ table: 'fixed_costs', op: 'delete', payload: { id } })
      pushDrain()
      return
    }

    if (coupleId && existing.createdBy) {
      await createChangeRequest({
        coupleId,
        targetTable: 'fixed_costs',
        targetId: id,
        requestedBy: userId,
        requestedTo: existing.createdBy,
        action: 'delete',
        payload: null,
      }).catch(() => {})
      toast.show('Pedido de remoção enviado pra aprovação')
    }
  }
  async function removeInstallment(id: string) {
    const existing = installments.find((x) => x.id === id)
    if (!existing) return
    const isOwn = (existing.createdBy ?? null) === userId

    if (isOwn) {
      setInstallments((prev) => prev.filter((x) => x.id !== id))
      enqueue({ table: 'installments', op: 'delete', payload: { id } })
      pushDrain()
      return
    }

    if (coupleId && existing.createdBy) {
      await createChangeRequest({
        coupleId,
        targetTable: 'installments',
        targetId: id,
        requestedBy: userId,
        requestedTo: existing.createdBy,
        action: 'delete',
        payload: null,
      }).catch(() => {})
      toast.show('Pedido de remoção enviado pra aprovação')
    }
  }
  async function upsertFixed(f: FixedCost) {
    const existing = fixedCosts.find((x) => x.id === f.id)
    const isOwn = !existing || (existing.createdBy ?? f.createdBy) === userId

    if (!existing || isOwn) {
      setFixedCosts((prev) => {
        const i = prev.findIndex((x) => x.id === f.id)
        if (i === -1) return [...prev, f]
        const copy = prev.slice(); copy[i] = f; return copy
      })
      enqueue({ table: 'fixed_costs', op: 'upsert', payload: f })
      pushDrain()
      return
    }

    const route = classify(existing, f)
    if (route === 'no-op') return

    if (route === 'soft') {
      setFixedCosts((prev) => {
        const i = prev.findIndex((x) => x.id === f.id)
        if (i === -1) return [...prev, f]
        const copy = prev.slice(); copy[i] = f; return copy
      })
      enqueue({ table: 'fixed_costs', op: 'upsert', payload: f })
      pushDrain()
      if (coupleId) {
        await logSoftChange({
          coupleId,
          targetTable: 'fixed_costs',
          targetId: f.id,
          changedBy: userId,
          prevValue: existing as any,
          newValue: f as any,
        }).catch(() => {})
      }
      return
    }

    if (coupleId && existing.createdBy) {
      await createChangeRequest({
        coupleId,
        targetTable: 'fixed_costs',
        targetId: f.id,
        requestedBy: userId,
        requestedTo: existing.createdBy,
        action: 'edit',
        payload: f as any,
      }).catch(() => {})
      toast.show('Pedido enviado pra aprovação do parceiro')
    }
  }
  async function upsertInstallment(i: Installment) {
    const existing = installments.find((x) => x.id === i.id)
    const isOwn = !existing || (existing.createdBy ?? i.createdBy) === userId

    if (!existing || isOwn) {
      setInstallments((prev) => {
        const idx = prev.findIndex((x) => x.id === i.id)
        if (idx === -1) return [...prev, i]
        const copy = prev.slice(); copy[idx] = i; return copy
      })
      enqueue({ table: 'installments', op: 'upsert', payload: i })
      pushDrain()
      return
    }

    const route = classify(existing, i)
    if (route === 'no-op') return

    if (route === 'soft') {
      setInstallments((prev) => {
        const idx = prev.findIndex((x) => x.id === i.id)
        if (idx === -1) return [...prev, i]
        const copy = prev.slice(); copy[idx] = i; return copy
      })
      enqueue({ table: 'installments', op: 'upsert', payload: i })
      pushDrain()
      if (coupleId) {
        await logSoftChange({
          coupleId,
          targetTable: 'installments',
          targetId: i.id,
          changedBy: userId,
          prevValue: existing as any,
          newValue: i as any,
        }).catch(() => {})
      }
      return
    }

    if (coupleId && existing.createdBy) {
      await createChangeRequest({
        coupleId,
        targetTable: 'installments',
        targetId: i.id,
        requestedBy: userId,
        requestedTo: existing.createdBy,
        action: 'edit',
        payload: i as any,
      }).catch(() => {})
      toast.show('Pedido enviado pra aprovação do parceiro')
    }
  }

  // ── Diff-and-enqueue setter factory ──
  // Aceita SetStateAction<T[]> (valor direto OU updater), diffa contra o anterior
  // e enfileira upsert pros novos/modificados + delete pros removidos.
  function makeDiffSetter<T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    table: 'fixed_costs' | 'installments' | 'goals',
  ): React.Dispatch<React.SetStateAction<T[]>> {
    return (action) => {
      setter((prev) => {
        const next = typeof action === 'function'
          ? (action as (prev: T[]) => T[])(prev)
          : action
        const prevMap = new Map(prev.map((x) => [x.id, x]))
        const nextMap = new Map(next.map((x) => [x.id, x]))
        nextMap.forEach((x, id) => {
          const old = prevMap.get(id)
          if (!old || JSON.stringify(old) !== JSON.stringify(x)) {
            enqueue({ table, op: 'upsert', payload: x as any })
          }
        })
        prevMap.forEach((_x, id) => {
          if (!nextMap.has(id)) {
            enqueue({ table, op: 'delete', payload: { id } as any })
          }
        })
        pushDrain()
        return next
      })
    }
  }

  const updateFixed = useMemo(() => makeDiffSetter<FixedCost>(setFixedCosts, 'fixed_costs'), [])
  const updateInstallments = useMemo(() => makeDiffSetter<Installment>(setInstallments, 'installments'), [])
  const updateGoals = useMemo(() => makeDiffSetter<Goal>(setGoals, 'goals'), [])


  // ── Categories ──
  function addCustomCategory(name: string, emoji: string) {
    const cat: CustomCategory = { id: newId(), name: name.trim(), emoji, createdAt: Date.now() }
    setCustomCategories((prev) => [...prev, cat])
    enqueue({ table: 'custom_categories', op: 'upsert', payload: cat })
    pushDrain()
    return cat
  }
  function removeCustomCategory(id: string) {
    setCustomCategories((prev) => prev.filter((c) => c.id !== id))
    enqueue({ table: 'custom_categories', op: 'delete', payload: { id } })
    pushDrain()
  }

  // ── Config (couple row) ──
  function updateConfig(patch: Partial<{
    nameA: string; nameB: string; incomeA: string; incomeB: string
    method: '50/50' | 'proporcional'
  }>) {
    const serverPatch: Record<string, any> = {}
    if (patch.nameA != null) { setNameA(patch.nameA); serverPatch.name_a = patch.nameA }
    if (patch.nameB != null) { setNameB(patch.nameB); serverPatch.name_b = patch.nameB }
    if (patch.incomeA != null) { setIncomeA(patch.incomeA); serverPatch.income_a = patch.incomeA }
    if (patch.incomeB != null) { setIncomeB(patch.incomeB); serverPatch.income_b = patch.incomeB }
    if (patch.method != null) { setMethod(patch.method); serverPatch.method = patch.method }
    if (Object.keys(serverPatch).length > 0) {
      enqueue({ table: 'couples', op: 'update', payload: serverPatch })
      pushDrain()
    }
  }

  // ── Sign out: limpa local mas mantém dados no server ──
  function handleSignOut() {
    clearQueue()
    clearAllLocalState()
    signOut().finally(() => {
      // reset state local pra evitar flash de dados do user antigo se logar de novo
      setSetupDone(false)
      setNameA(''); setNameB(''); setIncomeA(''); setIncomeB('')
      setMethod('50/50')
      setExpenses([]); setInstallments([]); setFixedCosts([])
      setGoals([]); setClosedMonths([]); setCustomCategories([])
      setCoupleId(null); setCoupleCode(null); setPartnerJoined(false); setPartnerUserId(null)
      setMonthKey(currentMonthKey())
      setTab('mes')
    })
  }

  const isCurrentMonthClosed = useMemo(
    () => closedMonths.some((m) => m.monthKey === monthKey),
    [closedMonths, monthKey]
  )

  function closeMonth() {
    const mk = monthKey
    const monthInfo = parseMonthKey(mk)

    const monthExpenses = expenses.filter((e) => e.monthKey === mk)
    const totalCasal = monthExpenses.filter((e) => e.scope === 'casal').reduce((s, e) => s + e.amount, 0)
    const totalPersonalA = monthExpenses.filter((e) => e.scope === 'A').reduce((s, e) => s + e.amount, 0)
    const totalPersonalB = monthExpenses.filter((e) => e.scope === 'B').reduce((s, e) => s + e.amount, 0)
    const totalFixed = fixedCosts
      .filter((f) => f.active && fixedAppearsInMonth(f.createdAt, f.frequency, mk))
      .reduce((s, f) => s + f.amount, 0)

    const activeInst = installments.filter((i) => {
      const elapsed = monthsBetween(i.startedAt, mk)
      return elapsed >= 0 && elapsed < i.totalParcelas
    })
    const totalInst = activeInst.reduce((s, i) => s + i.parcelaMensal, 0)

    const iA = parseFloat(incomeA) || 0
    const iB = parseFloat(incomeB) || 0
    const totalCasalA = monthExpenses.filter((e) => e.scope === 'casal' && e.paidBy === 'A').reduce((s, e) => s + e.amount, 0)
    const fairShareA = method === '50/50' || (iA + iB === 0)
      ? totalCasal / 2
      : totalCasal * (iA / (iA + iB))
    const balanceA = totalCasalA - fairShareA

    const closed: ClosedMonth = {
      monthKey: mk,
      closedAt: Date.now(),
      totals: {
        casal: totalCasal,
        personalA: totalPersonalA,
        personalB: totalPersonalB,
        fixed: totalFixed,
        installments: totalInst,
        balanceA,
      },
    }
    setClosedMonths((prev) => [...prev.filter((m) => m.monthKey !== mk), closed])
    enqueue({ table: 'closed_months', op: 'upsert', payload: closed })

    setInstallments((prev) => {
      const next = prev.map((i) => {
        const elapsed = monthsBetween(i.startedAt, mk)
        if (elapsed >= 0 && elapsed < i.totalParcelas && i.paidParcelas <= elapsed) {
          return { ...i, paidParcelas: i.paidParcelas + 1 }
        }
        return i
      })
      // enfileira upserts pros installments que mudaram
      for (let idx = 0; idx < next.length; idx++) {
        if (prev[idx] !== next[idx]) {
          enqueue({ table: 'installments', op: 'upsert', payload: next[idx] })
        }
      }
      return next
    })

    pushDrain()

    const nextMonth = new Date(monthInfo.year, monthInfo.month, 1)
    setMonthKey(`${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`)
    toast.show('Mês fechado ✓')
  }

  function exportPDF(mk: string = monthKey) {
    try {
      generateExtractPDF({
        monthKey: mk,
        nameA, nameB, incomeA, incomeB, method,
        expenses, fixedCosts, installments, customCategories,
      })
      toast.show('PDF gerado ✓')
    } catch (err) {
      console.error(err)
      toast.show('Não foi possível gerar o PDF', 'error')
    }
  }

  const totalMes = useMemo(() => {
    const monthInfo = parseMonthKey(monthKey)
    const now = new Date()
    const isFuture = monthInfo.year > now.getFullYear() ||
      (monthInfo.year === now.getFullYear() && monthInfo.month > now.getMonth() + 1)
    if (isFuture) return 0

    const fromExpenses = expenses.filter((e) => e.monthKey === monthKey).reduce((s, e) => s + e.amount, 0)
    const fromFixed = fixedCosts
      .filter((f) => f.active && fixedAppearsInMonth(f.createdAt, f.frequency, monthKey))
      .reduce((s, f) => s + f.amount, 0)
    const fromInst = installments.reduce((s, i) => {
      const elapsed = monthsBetween(i.startedAt, monthKey)
      return elapsed >= 0 && elapsed < i.totalParcelas ? s + i.parcelaMensal : s
    }, 0)
    return fromExpenses + fromFixed + fromInst
  }, [expenses, fixedCosts, installments, monthKey])

  // ── Render: loading / setup / app ──
  if (coupleId === undefined) return <Splash />

  if (!coupleId || !setupDone) {
    return (
      <Setup
        initialCoupleId={coupleId}
        onDone={(r) => {
          setCoupleId(r.coupleId)
          setNameA(r.nameA); setNameB(r.nameB)
          setIncomeA(r.incomeA); setIncomeB(r.incomeB)
          setMethod(r.method)
          setSetupDone(true)
        }}
      />
    )
  }

  // Gate de assinatura: enquanto carrega SEM cache otimista, mostra splash.
  // Se cache diz hasAccess=true, deixa entrar direto no app (evita flash do paywall).
  // Quando o RPC retorna, sub.loading vira false; aí o gate real abaixo decide.
  if (sub.loading && !sub.hasAccess) return <Splash />
  if (!sub.loading && !sub.hasAccess) {
    return <PaywallScreen status={sub.status} coupleCode={coupleCode} />
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: tokens.color.bg_app,
        fontFamily: tokens.primitive.fontFamily.sans,
        paddingBottom: 110,
      }}
    >
      {sub.status === 'trial' && (
        <>
          <TrialWelcomeModal
            daysRemaining={sub.daysRemaining}
            coupleId={coupleId}
            coupleCode={coupleCode}
          />
          <TrialBanner daysRemaining={sub.daysRemaining} coupleCode={coupleCode} />
        </>
      )}
      <MonthHeader
        nameA={nameA}
        nameB={nameB}
        monthKey={monthKey}
        onChangeMonth={setMonthKey}
        totalMes={totalMes}
        onOpenConfig={() => setTab('config')}
      />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: `${tokens.primitive.space[10]} ${tokens.primitive.space[8]}` }}>
        {tab === 'visao' && (
          <TabVisao
            nameA={nameA} nameB={nameB}
            monthKey={monthKey}
            expenses={expenses}
            fixedCosts={fixedCosts}
            installments={installments}
            customCategories={customCategories}
            onDrillTo={handleDrillTo}
          />
        )}

        {tab === 'mes' && (
          <TabMes
            nameA={nameA} nameB={nameB}
            incomeA={incomeA} incomeB={incomeB} method={method}
            monthKey={monthKey}
            expenses={expenses}
            fixedCosts={fixedCosts}
            installments={installments}
            customCategories={customCategories}
            currentUserId={userId}
            onRemoveExpense={removeExpense}
            onEditExpense={startEditExpense}
            onEditFixed={startEditFixed}
            onEditInstallment={startEditInstallment}
            onOpenAdd={() => { setEditing(null); setSheetOpen(true) }}
            onCloseMonth={closeMonth}
            onExportPDF={() => exportPDF()}
            isClosed={isCurrentMonthClosed}
            pendingFilter={pendingMesFilter}
            onConsumePendingFilter={() => setPendingMesFilter(null)}
          />
        )}

        {tab === 'recorrentes' && (
          <TabRecorrentes
            nameA={nameA} nameB={nameB}
            fixedCosts={fixedCosts} setFixedCosts={updateFixed}
            installments={installments} setInstallments={updateInstallments}
            customCategories={customCategories}
            currentUserId={userId}
            onOpenAdd={() => { setEditing(null); setSheetOpen(true) }}
            onEditFixed={startEditFixed}
            onEditInstallment={startEditInstallment}
          />
        )}

        {tab === 'metas' && <TabMetas goals={goals} setGoals={updateGoals} />}

        {tab === 'config' && (
          <TabConfig
            nameA={nameA} nameB={nameB}
            incomeA={incomeA} incomeB={incomeB}
            method={method}
            closedMonths={closedMonths}
            customCategories={customCategories}
            coupleCode={coupleCode}
            partnerJoined={partnerJoined}
            coupleId={coupleId ?? null}
            currentUserId={userId}
            onUpdate={updateConfig}
            onSignOut={handleSignOut}
            onExportMonth={exportPDF}
            onRemoveCategory={removeCustomCategory}
          />
        )}
      </div>

      {tab === 'mes' && !isCurrentMonthClosed && (
        <FAB onClick={() => setSheetOpen(true)} pulse={totalMes === 0} />
      )}

      <BottomNav tab={tab} onTab={setTab} onOpenAdd={() => setSheetOpen(true)} pendingCount={pendingCount} />

      <InstallModal />
      <DailyTipModal coupleId={coupleId ?? null} />

      <AddExpenseSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setEditing(null) }}
        nameA={nameA}
        nameB={nameB}
        monthKey={monthKey}
        customCategories={customCategories}
        currentUserId={userId}
        editing={editing}
        onAddExpense={(e) => {
          const existing = expenses.find((x) => x.id === e.id)
          const isCrossUser = !!existing && !!existing.createdBy && existing.createdBy !== userId
          upsertExpense(e)
          // Toast só quando a mudança foi aplicada direto (own-edit ou novo).
          // Cross-user vira pedido — upsertExpense já mostra o toast "Pedido enviado".
          if (!isCrossUser || !existing) {
            toast.show(editing?.kind === 'avulso' ? 'Gasto atualizado ✓' : 'Gasto adicionado ✓')
          }
        }}
        onAddFixed={(f) => {
          const existing = fixedCosts.find((x) => x.id === f.id)
          const isCrossUser = !!existing && !!existing.createdBy && existing.createdBy !== userId
          upsertFixed(f)
          if (!isCrossUser || !existing) {
            toast.show(editing?.kind === 'fixo' ? 'Custo fixo atualizado ✓' : 'Custo fixo criado ✓')
          }
        }}
        onAddInstallment={(i) => {
          const existing = installments.find((x) => x.id === i.id)
          const isCrossUser = !!existing && !!existing.createdBy && existing.createdBy !== userId
          upsertInstallment(i)
          if (!isCrossUser || !existing) {
            toast.show(editing?.kind === 'parcela' ? 'Parcelado atualizado ✓' : 'Parcelado criado ✓')
          }
        }}
        onRemoveExpense={removeExpense}
        onRemoveFixed={removeFixed}
        onRemoveInstallment={removeInstallment}
        onAddCategory={(name, emoji) => {
          const cat = addCustomCategory(name, emoji)
          toast.show('Categoria criada ✓')
          return cat
        }}
      />
    </div>
  )
}

// ── Splash ─────────────────────────────────────────────────────────────────────
function Splash() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg-app)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Logo size={64} showWord={false} />
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────────
function IconChart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}
function IconCalendar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}
function IconRepeat() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  )
}
function IconTarget() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
function IconUsers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}

// ── FAB ────────────────────────────────────────────────────────────────────────
function FAB({ onClick, pulse }: { onClick: () => void; pulse: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label="Novo gasto"
      style={{
        position: 'fixed',
        bottom: 86,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: tokens.primitive.zIndex.nav + 1,
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${tokens.color.brand} 0%, #7da3ff 100%)`,
        color: tokens.color.text_onBrand,
        border: '3px solid var(--color-bg-app)',
        fontSize: 28,
        fontWeight: 400,
        lineHeight: 1,
        cursor: 'pointer',
        boxShadow: 'var(--shadow-fab)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'inherit',
        animation: pulse
          ? 'cna-fab-pop 300ms cubic-bezier(0.4,0,0.2,1), cna-fab-pulse 2.4s ease-in-out 300ms infinite'
          : 'cna-fab-pop 300ms cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  )
}

// ── BottomNav ──────────────────────────────────────────────────────────────────
function BottomNav({
  tab, onTab, pendingCount,
}: { tab: TabId; onTab: (t: TabId) => void; onOpenAdd: () => void; pendingCount?: number }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        background: tokens.color.bg_card,
        borderTop: `1.5px solid ${tokens.color.border_subtle}`,
        boxShadow: tokens.shadow.bottomNav,
        zIndex: tokens.primitive.zIndex.nav,
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
          padding: `${tokens.primitive.space[4]} 0 ${tokens.primitive.space[7]}`,
        }}
      >
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => onTab(t.id)}
              style={{
                background: 'none', border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: `${tokens.primitive.space[2]} 0`,
                fontFamily: 'inherit',
                color: active ? tokens.color.brand : tokens.color.text_secondary,
                position: 'relative',
              }}
            >
              <span
                aria-hidden
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 22,
                  opacity: active ? 1 : 0.55,
                  transition: tokens.motion.interaction,
                }}
              >
                {t.icon}
              </span>
              {t.id === 'config' && pendingCount && pendingCount > 0 && (
                <span
                  aria-label={`${pendingCount} pendentes`}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: '28%',
                    background: tokens.color.danger,
                    color: '#fff',
                    fontSize: 9,
                    fontWeight: 800,
                    minWidth: 14,
                    height: 14,
                    borderRadius: 7,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    lineHeight: 1,
                  }}
                >
                  {pendingCount}
                </span>
              )}
              <span
                style={{
                  fontSize: tokens.primitive.fontSize['2xs'],
                  fontWeight: active ? tokens.primitive.fontWeight.extrabold : tokens.primitive.fontWeight.semibold,
                  marginTop: 4,
                }}
              >
                {t.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function monthsBetween(startTs: number, targetMonthKey: string): number {
  const start = new Date(startTs)
  const { year, month } = parseMonthKey(targetMonthKey)
  return (year - start.getFullYear()) * 12 + (month - 1 - start.getMonth())
}
