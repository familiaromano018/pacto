'use client'

import { supabase } from './client'

export interface WhatsappStatus {
  phone: string | null
  verified: boolean
}

/** Lê o status do WhatsApp do usuário logado (ou null se nunca cadastrou). */
export async function getMyWhatsapp(): Promise<WhatsappStatus | null> {
  const sb = supabase()
  const { data: auth } = await sb.auth.getUser()
  if (!auth.user) return null
  const { data, error } = await sb
    .from('user_whatsapp')
    .select('phone, verified')
    .eq('user_id', auth.user.id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return { phone: data.phone ?? null, verified: !!data.verified }
}

/**
 * Inicia (ou reinicia) a verificação: gera um código de 6 dígitos, grava como
 * pendente (válido por 10 min) e retorna o código pra mostrar na tela.
 * A confirmação acontece quando o usuário manda esse código pro WhatsApp do
 * Pacto (tratado no webhook /api/whatsapp).
 */
export async function startWhatsappVerification(): Promise<string> {
  const sb = supabase()
  const { data: auth } = await sb.auth.getUser()
  if (!auth.user) throw new Error('Não autenticado')

  const code = String(Math.floor(100000 + Math.random() * 900000)) // 6 dígitos
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const { error } = await sb.from('user_whatsapp').upsert(
    {
      user_id: auth.user.id,
      verify_code: code,
      verify_expires_at: expires,
      verified: false,
      phone: null,
    },
    { onConflict: 'user_id' },
  )
  if (error) throw error
  return code
}
