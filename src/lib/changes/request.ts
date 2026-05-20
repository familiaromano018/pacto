// src/lib/changes/request.ts
import { supabase } from '@/lib/supabase/client'
import type {
  ChangeRequest, ChangeAction, ChangeTargetTable,
} from '@/components/types'

function row2req(r: any): ChangeRequest {
  return {
    id: r.id,
    coupleId: r.couple_id,
    targetTable: r.target_table,
    targetId: r.target_id,
    requestedBy: r.requested_by,
    requestedTo: r.requested_to,
    action: r.action,
    payload: r.payload,
    status: r.status,
    createdAt: new Date(r.created_at).getTime(),
    resolvedAt: r.resolved_at ? new Date(r.resolved_at).getTime() : null,
    expiresAt: new Date(r.expires_at).getTime(),
  }
}

/** Lista pedidos relevantes pro user (pendentes endereçados a ele OU criados por ele). */
export async function listChangeRequests(coupleId: string): Promise<ChangeRequest[]> {
  const sb = supabase()
  const { data, error } = await sb
    .from('change_requests')
    .select('*')
    .eq('couple_id', coupleId)
    .in('status', ['pending', 'approved', 'denied', 'expired'])
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []).map(row2req)
}

/** Cria um novo pedido. */
export async function createChangeRequest(input: {
  coupleId: string
  targetTable: ChangeTargetTable
  targetId: string
  requestedBy: string
  requestedTo: string
  action: ChangeAction
  payload: Record<string, any> | null
}): Promise<ChangeRequest> {
  const sb = supabase()
  const { data, error } = await sb
    .from('change_requests')
    .insert({
      couple_id: input.coupleId,
      target_table: input.targetTable,
      target_id: input.targetId,
      requested_by: input.requestedBy,
      requested_to: input.requestedTo,
      action: input.action,
      payload: input.payload,
    })
    .select()
    .single()
  if (error) throw error
  return row2req(data)
}

/** Aprova um pedido: aplica a mudança + marca como approved. */
export async function approveChangeRequest(req: ChangeRequest): Promise<void> {
  const sb = supabase()

  if (req.action === 'delete') {
    const { error } = await sb.from(req.targetTable).delete().eq('id', req.targetId)
    if (error) throw error
  } else if (req.action === 'edit' && req.payload) {
    const { error } = await sb.from(req.targetTable).update(req.payload).eq('id', req.targetId)
    if (error) throw error
  }

  const { error: upErr } = await sb
    .from('change_requests')
    .update({ status: 'approved', resolved_at: new Date().toISOString() })
    .eq('id', req.id)
  if (upErr) throw upErr
}

/** Nega um pedido. */
export async function denyChangeRequest(reqId: string): Promise<void> {
  const sb = supabase()
  const { error } = await sb
    .from('change_requests')
    .update({ status: 'denied', resolved_at: new Date().toISOString() })
    .eq('id', reqId)
  if (error) throw error
}
