'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

const DAY = 86400000

export type AdminAction =
  | { kind: 'premium'; months: number }
  | { kind: 'trial'; days: number }
  | { kind: 'cancel' }

/**
 * Troca manualmente o status de assinatura de um casal (uso exclusivo do admin).
 *
 *   premium → status 'active', current_period_end = hoje + N meses
 *   trial   → status 'trial',  trial_ends_at      = hoje + N dias
 *   cancel  → status 'canceled'
 *
 * Toda alteração fica registrada em hotmart_event_log como evento ADMIN_MANUAL
 * (com o email do admin que fez), pra auditoria.
 */
export async function setCoupleStatus(coupleId: string, action: AdminAction) {
  const admin = await requireAdmin()
  if (!coupleId) throw new Error('coupleId obrigatório')

  const sb = supabaseAdmin()
  const now = Date.now()

  const patch: Record<string, unknown> = {}
  let detail = ''

  if (action.kind === 'premium') {
    const months = Math.max(1, Math.min(60, Math.round(action.months || 12)))
    patch.status = 'active'
    patch.current_period_end = new Date(now + months * 30 * DAY).toISOString()
    detail = `${months}m`
  } else if (action.kind === 'trial') {
    const days = Math.max(1, Math.min(365, Math.round(action.days || 14)))
    patch.status = 'trial'
    patch.trial_ends_at = new Date(now + days * DAY).toISOString()
    patch.current_period_end = null
    detail = `${days}d`
  } else if (action.kind === 'cancel') {
    patch.status = 'canceled'
  } else {
    throw new Error('ação inválida')
  }

  // Garante a row (onConflict couple_id, mesma convenção do webhook)
  const { error: upErr } = await sb
    .from('subscriptions')
    .upsert({ couple_id: coupleId, ...patch }, { onConflict: 'couple_id' })
  if (upErr) throw new Error(`Falha ao atualizar assinatura: ${upErr.message}`)

  // Append no log de auditoria
  const { data: row } = await sb
    .from('subscriptions')
    .select('hotmart_event_log')
    .eq('couple_id', coupleId)
    .maybeSingle()
  const log = (row?.hotmart_event_log as object[]) || []
  await sb
    .from('subscriptions')
    .update({
      hotmart_event_log: [
        ...log,
        {
          event: 'ADMIN_MANUAL',
          action: action.kind,
          detail,
          by: admin.email,
          at: new Date(now).toISOString(),
        },
      ],
    })
    .eq('couple_id', coupleId)

  revalidatePath('/admin')
  return { ok: true as const }
}
