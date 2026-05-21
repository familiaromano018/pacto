'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'canceled' | 'expired'

export interface SubscriptionState {
  loading: boolean
  status: SubscriptionStatus | null
  hasAccess: boolean
  daysRemaining: number
  trialEndsAt: string | null
  currentPeriodEnd: string | null
}

const initial: SubscriptionState = {
  loading: true,
  status: null,
  hasAccess: false,
  daysRemaining: 0,
  trialEndsAt: null,
  currentPeriodEnd: null,
}

// Cache otimista do hasAccess no localStorage: evita flash do PaywallScreen
// enquanto o RPC carrega, pra quem já entrou com acesso premium/trial antes.
const ACCESS_CACHE_KEY = 'pacto:has-access'

function readCachedAccess(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(ACCESS_CACHE_KEY) === '1'
  } catch {
    return false
  }
}

function writeCachedAccess(has: boolean): void {
  if (typeof window === 'undefined') return
  try {
    if (has) localStorage.setItem(ACCESS_CACHE_KEY, '1')
    else localStorage.removeItem(ACCESS_CACHE_KEY)
  } catch {
    /* ignore */
  }
}

export function useSubscription(coupleId: string | null | undefined) {
  const [state, setState] = useState<SubscriptionState>(() => ({
    ...initial,
    hasAccess: readCachedAccess(),
  }))

  const refresh = useCallback(async () => {
    const sb = supabase()
    const { data, error } = await sb.rpc('get_my_subscription')
    if (error) {
      console.warn('[subscription] rpc error', error)
      setState((s) => ({ ...s, loading: false }))
      return
    }
    // Função retorna jsonb (single row) ou null
    const row = data as
      | {
          couple_id: string
          status: SubscriptionStatus
          trial_ends_at: string | null
          current_period_end: string | null
          days_remaining: number
          has_access: boolean
        }
      | null
    if (!row) {
      writeCachedAccess(false)
      setState({ ...initial, loading: false })
      return
    }
    writeCachedAccess(!!row.has_access)
    setState({
      loading: false,
      status: row.status,
      hasAccess: !!row.has_access,
      daysRemaining: row.days_remaining ?? 0,
      trialEndsAt: row.trial_ends_at,
      currentPeriodEnd: row.current_period_end,
    })
  }, [])

  useEffect(() => {
    if (coupleId === undefined) return
    if (coupleId === null) {
      writeCachedAccess(false)
      setState({ ...initial, loading: false })
      return
    }
    let cancelled = false
    refresh().catch(() => { if (!cancelled) setState((s) => ({ ...s, loading: false })) })
    return () => { cancelled = true }
  }, [coupleId, refresh])

  // Realtime: quando o webhook ativar a sub, atualiza UI sem refresh
  useEffect(() => {
    if (!coupleId) return
    const sb = supabase()
    const ch = sb
      .channel(`pacto:${coupleId}:sub`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subscriptions', filter: `couple_id=eq.${coupleId}` },
        () => { refresh().catch(() => {}) },
      )
      .subscribe()
    return () => { sb.removeChannel(ch) }
  }, [coupleId, refresh])

  // Re-checa quando o tab volta a ficar visível
  useEffect(() => {
    const onFocus = () => { refresh().catch(() => {}) }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refresh])

  return { ...state, refresh }
}
