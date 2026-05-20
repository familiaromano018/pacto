// src/lib/changes/history.ts
import { supabase } from '@/lib/supabase/client'
import type { ChangeHistoryEntry, ChangeTargetTable } from '@/components/types'

function row2hist(r: any): ChangeHistoryEntry {
  return {
    id: r.id,
    coupleId: r.couple_id,
    targetTable: r.target_table,
    targetId: r.target_id,
    changedBy: r.changed_by,
    prevValue: r.prev_value,
    newValue: r.new_value,
    isSoft: r.is_soft,
    canUndoUntil: new Date(r.can_undo_until).getTime(),
    undone: r.undone,
    createdAt: new Date(r.created_at).getTime(),
  }
}

/** Lista entradas recentes do histórico (últimos 30 dias). */
export async function listChangeHistory(coupleId: string): Promise<ChangeHistoryEntry[]> {
  const sb = supabase()
  const cutoff = new Date(Date.now() - 30 * 86400 * 1000).toISOString()
  const { data, error } = await sb
    .from('change_history')
    .select('*')
    .eq('couple_id', coupleId)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []).map(row2hist)
}

/** Registra uma soft change. (Aplicação no target é feita pelo caller.) */
export async function logSoftChange(input: {
  coupleId: string
  targetTable: ChangeTargetTable
  targetId: string
  changedBy: string
  prevValue: Record<string, any>
  newValue: Record<string, any>
}): Promise<ChangeHistoryEntry> {
  const sb = supabase()
  const { data, error } = await sb
    .from('change_history')
    .insert({
      couple_id: input.coupleId,
      target_table: input.targetTable,
      target_id: input.targetId,
      changed_by: input.changedBy,
      prev_value: input.prevValue,
      new_value: input.newValue,
      is_soft: true,
    })
    .select()
    .single()
  if (error) throw error
  return row2hist(data)
}

/** Desfaz uma soft change: restaura prev_value no target + marca undone=true. */
export async function undoSoftChange(entry: ChangeHistoryEntry): Promise<void> {
  const sb = supabase()
  if (Date.now() > entry.canUndoUntil) throw new Error('Janela de undo expirada')

  const { error } = await sb
    .from(entry.targetTable)
    .update(entry.prevValue)
    .eq('id', entry.targetId)
  if (error) throw error

  const { error: upErr } = await sb
    .from('change_history')
    .update({ undone: true })
    .eq('id', entry.id)
  if (upErr) throw upErr
}
