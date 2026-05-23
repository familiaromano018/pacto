import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const PLAN_PRICE = 29.9

export type SubStatus = 'trial' | 'active' | 'past_due' | 'canceled' | 'expired' | 'none'

export interface CoupleRow {
  coupleId: string
  code: string
  nameA: string
  nameB: string
  createdAt: string
  status: SubStatus
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  daysRemaining: number
  hasAccess: boolean
  members: { userId: string; email: string | null; role: 'A' | 'B'; joinedAt: string }[]
  hotmartEventLog: unknown[]
  hotmartSubscriberCode: string | null
}

export interface AdminMetrics {
  totalCouples: number
  activeTrials: number
  paying: number
  pastDue: number
  canceled: number
  expiringIn3Days: number
  newCouples30d: number
  churn30d: number
  mrr: number
}

export interface GrowthPoint {
  month: string
  couples: number
  paying: number
}

function computeDaysRemaining(target: string | null): number {
  if (!target) return 0
  const diffMs = new Date(target).getTime() - Date.now()
  if (diffMs <= 0) return 0
  return Math.ceil(diffMs / 86400000)
}

function effectiveStatus(
  rawStatus: string | null,
  trialEndsAt: string | null,
  periodEnd: string | null,
): SubStatus {
  if (!rawStatus) return 'none'
  const now = Date.now()
  if (rawStatus === 'trial') {
    if (!trialEndsAt || new Date(trialEndsAt).getTime() <= now) return 'expired'
    return 'trial'
  }
  if (rawStatus === 'active') {
    if (periodEnd && new Date(periodEnd).getTime() <= now) return 'expired'
    return 'active'
  }
  return rawStatus as SubStatus
}

export async function listCouples(): Promise<CoupleRow[]> {
  const sb = supabaseAdmin()

  const [{ data: couples, error: ec }, { data: subs, error: es }, { data: members, error: em }] =
    await Promise.all([
      sb
        .from('couples')
        .select('id, code, name_a, name_b, created_at')
        .order('created_at', { ascending: false }),
      sb
        .from('subscriptions')
        .select(
          'couple_id, status, trial_ends_at, current_period_end, hotmart_subscriber_code, hotmart_event_log',
        ),
      sb.from('members').select('couple_id, user_id, role, joined_at'),
    ])

  if (ec) throw ec
  if (es) throw es
  if (em) throw em

  const userIds = Array.from(new Set((members || []).map((m) => m.user_id)))
  const emailByUser = new Map<string, string | null>()
  // auth.admin.listUsers tem paginação; assumimos < 1000 usuários por enquanto
  const { data: usersPage, error: eu } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (eu) throw eu
  for (const u of usersPage.users) emailByUser.set(u.id, u.email ?? null)
  // garantia: usuários só listados em members também ganham null
  for (const id of userIds) if (!emailByUser.has(id)) emailByUser.set(id, null)

  const subByCouple = new Map<string, NonNullable<typeof subs>[number]>()
  for (const s of subs || []) subByCouple.set(s.couple_id, s)

  const membersByCouple = new Map<string, NonNullable<typeof members>>()
  for (const m of members || []) {
    const list = membersByCouple.get(m.couple_id) || []
    list.push(m)
    membersByCouple.set(m.couple_id, list as any)
  }

  return (couples || []).map<CoupleRow>((c) => {
    const sub = subByCouple.get(c.id)
    const status = effectiveStatus(
      sub?.status ?? null,
      sub?.trial_ends_at ?? null,
      sub?.current_period_end ?? null,
    )
    const targetDate =
      status === 'trial' ? sub?.trial_ends_at ?? null : sub?.current_period_end ?? null
    return {
      coupleId: c.id,
      code: c.code,
      nameA: c.name_a || '',
      nameB: c.name_b || '',
      createdAt: c.created_at,
      status,
      trialEndsAt: sub?.trial_ends_at ?? null,
      currentPeriodEnd: sub?.current_period_end ?? null,
      daysRemaining: computeDaysRemaining(targetDate),
      hasAccess: status === 'trial' || status === 'active',
      members: (membersByCouple.get(c.id) || []).map((m) => ({
        userId: m.user_id,
        email: emailByUser.get(m.user_id) ?? null,
        role: m.role,
        joinedAt: m.joined_at,
      })),
      hotmartEventLog: Array.isArray(sub?.hotmart_event_log) ? sub!.hotmart_event_log : [],
      hotmartSubscriberCode: sub?.hotmart_subscriber_code ?? null,
    }
  })
}

export function computeMetrics(rows: CoupleRow[]): AdminMetrics {
  const now = Date.now()
  const m: AdminMetrics = {
    totalCouples: rows.length,
    activeTrials: 0,
    paying: 0,
    pastDue: 0,
    canceled: 0,
    expiringIn3Days: 0,
    newCouples30d: 0,
    churn30d: 0,
    mrr: 0,
  }
  const dayMs = 86400000
  for (const r of rows) {
    if (r.status === 'trial') m.activeTrials++
    if (r.status === 'active') m.paying++
    if (r.status === 'past_due') m.pastDue++
    if (r.status === 'canceled') m.canceled++
    if (r.status === 'trial' && r.daysRemaining <= 3 && r.daysRemaining > 0) m.expiringIn3Days++
    if (now - new Date(r.createdAt).getTime() <= 30 * dayMs) m.newCouples30d++
    if (
      r.status === 'canceled' &&
      r.currentPeriodEnd &&
      now - new Date(r.currentPeriodEnd).getTime() <= 30 * dayMs
    )
      m.churn30d++
  }
  m.mrr = m.paying * PLAN_PRICE
  return m
}

export function computeGrowth(rows: CoupleRow[]): GrowthPoint[] {
  // últimos 12 meses, do mais antigo pro mais recente
  const now = new Date()
  const buckets: GrowthPoint[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets.push({ month: key, couples: 0, paying: 0 })
  }
  const indexByKey = new Map(buckets.map((b, i) => [b.month, i]))
  for (const r of rows) {
    const d = new Date(r.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const i = indexByKey.get(key)
    if (i === undefined) continue
    buckets[i].couples++
    if (r.status === 'active') buckets[i].paying++
  }
  return buckets
}
