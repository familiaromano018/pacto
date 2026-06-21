'use client'

import { supabase } from './client'
import type { CoupleRow } from './database.types'

/**
 * Retorna o couple_id do usuário autenticado. Null se ainda não é member de nenhum casal.
 */
export async function getCurrentCoupleId(): Promise<string | null> {
  const sb = supabase()
  const { data: auth } = await sb.auth.getUser()
  if (!auth.user) return null
  const { data, error } = await sb
    .from('members')
    .select('couple_id')
    .eq('user_id', auth.user.id)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data?.couple_id ?? null
}

/**
 * Cria casal pro user atual (role A). Idempotente: se já existe, retorna o atual.
 */
export async function ensureCoupleForCurrentUser(): Promise<string> {
  const sb = supabase()
  const { data, error } = await sb.rpc('create_couple_for_current_user')
  if (error) throw error
  if (!data) throw new Error('RPC create_couple_for_current_user retornou vazio')
  return data
}

/**
 * Entra num casal existente via código de convite.
 * Erros possíveis (todos via raise exception do RPC):
 *  - "Código inválido"
 *  - "Você já faz parte de outro casal. Saia primeiro."
 *  - "Este casal já tem 2 membros"
 */
export async function joinCoupleWithCode(code: string): Promise<string> {
  const sb = supabase()
  const { data, error } = await sb.rpc('join_couple_with_code', { invite_code: code })
  if (error) throw error
  if (!data) throw new Error('RPC join_couple_with_code retornou vazio')
  return data
}

/**
 * Lê os dados completos de um casal (códigos, nomes, rendas, método, privacy).
 */
export async function getCoupleRow(coupleId: string): Promise<CoupleRow | null> {
  const sb = supabase()
  const { data, error } = await sb.from('couples').select('*').eq('id', coupleId).maybeSingle()
  if (error) throw error
  return data
}

/**
 * Atualiza campos do casal (nomes, rendas, método, privacy).
 */
export async function updateCoupleRow(
  coupleId: string,
  patch: Partial<Pick<CoupleRow, 'name_a' | 'name_b' | 'income_a' | 'income_b' | 'method' | 'mesada' | 'category_split' | 'category_budgets' | 'privacy_mode'>>,
) {
  const sb = supabase()
  const { error } = await sb.from('couples').update(patch).eq('id', coupleId)
  if (error) throw error
}

/**
 * Lê meu role (A ou B) dentro do casal.
 */
export async function getMyRole(coupleId: string): Promise<'A' | 'B' | null> {
  const sb = supabase()
  const { data: auth } = await sb.auth.getUser()
  if (!auth.user) return null
  const { data, error } = await sb
    .from('members')
    .select('role')
    .eq('couple_id', coupleId)
    .eq('user_id', auth.user.id)
    .maybeSingle()
  if (error) throw error
  return (data?.role as 'A' | 'B' | undefined) ?? null
}
